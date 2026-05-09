const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.join(__dirname, "..");
const publicDir = path.join(root, "frontend");
const dbPath = path.join(root, "database", "db.json");
const PORT = process.env.PORT || 3000;
const sessions = new Map();

function normalizeDb(db) {
  let changed = false;
  const defaultTrainer = db.users.find((user) => user.role === "trainer")?.id || "";

  const ensureTrainerId = (item) => {
    if (!item.trainerId && defaultTrainer) {
      item.trainerId = defaultTrainer;
      changed = true;
    }
  };

  if (Array.isArray(db["m?ssages"]) && !Array.isArray(db.messages)) {
    db.messages = db["m?ssages"];
    delete db["m?ssages"];
    changed = true;
  }

  ["users", "sports", "students", "groups", "workouts", "events", "messages", "attendance", "performance", "financialPlans", "payments", "pdfSettings", "physicalAssessments", "nutritionPlans"].forEach((collection) => {
    if (!Array.isArray(db[collection])) {
      db[collection] = [];
      changed = true;
    }
  });

  ["groups", "workouts", "events", "messages", "financialPlans", "payments", "pdfSettings", "physicalAssessments", "nutritionPlans"].forEach((collection) => {
    (db[collection] || []).forEach(ensureTrainerId);
  });

  (db.students || []).forEach((student) => {
    if (!Array.isArray(student.trainerIds)) {
      student.trainerIds = student.trainerId ? [student.trainerId] : [];
      changed = true;
    }
    if (student.trainerId && !student.trainerIds.includes(student.trainerId)) {
      student.trainerIds.push(student.trainerId);
      changed = true;
    }
  });

  db.users
    .filter((user) => user.role === "student")
    .forEach((user) => {
      const linked = db.students.find((student) => student.id === user.studentId);
      if (linked) return;

      const sameEmail = db.students.find((student) => student.email.toLowerCase() === user.email.toLowerCase());
      if (sameEmail) {
        user.studentId = sameEmail.id;
        sameEmail.userId = user.id;
        changed = true;
        return;
      }

      const student = {
        id: id("s"),
        userId: user.id,
        photo: user.avatar || "",
        name: user.name,
        birthDate: "",
        phone: user.phone || "",
        email: user.email,
        sportId: db.sports[0]?.id || "",
        goal: "",
        notes: "",
        status: "active",
        trainerIds: [],
        trainerId: "",
        createdAt: now()
      };
      user.studentId = student.id;
      db.students.push(student);
      changed = true;
    });
  return changed;
}

const readDb = () => {
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8").replace(/^\uFEFF/, ""));
  if (normalizeDb(db)) writeDb(db);
  return db;
};
const writeDb = (db) => fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
const id = (prefix) => `${prefix}-${crypto.randomBytes(5).toString("hex")}`;
const now = () => new Date().toISOString();
const numberValue = (value) => Number(String(value || "").replace(",", ".")) || 0;

function calculateImc(weight, height) {
  const weightValue = numberValue(weight);
  const heightValue = numberValue(height);
  const meters = heightValue > 3 ? heightValue / 100 : heightValue;
  if (!weightValue || !meters) return "";
  return (weightValue / (meters * meters)).toFixed(1);
}

function send(res, status, data, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 7_000_000) {
        reject(new Error("Payload muito grande"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("JSON inválido"));
      }
    });
  });
}

function currentUser(req, db) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const userId = sessions.get(token);
  return db.users.find((user) => user.id === userId);
}

function requireUser(req, res, db) {
  const user = currentUser(req, db);
  if (!user) send(res, 401, { error: "Sessão inválida. Faça login novamente." });
  return user;
}

function publicUser(user) {
  const { password, ...safe } = user;
  return safe;
}

function studentPayload(db, student) {
  const sport = db.sports.find((item) => item.id === student.sportId);
  const group = db.groups.find((item) => item.studentIds.includes(student.id));
  return { ...student, sportName: sport?.name || "Sem modalidade", groupName: group?.name || "Sem grupo" };
}

function trainerScoped(db, trainerId) {
  const students = db.students.filter((student) => (student.trainerIds || []).includes(trainerId) || student.trainerId === trainerId);
  const studentIds = students.map((student) => student.id);
  const groups = db.groups.filter((group) => group.trainerId === trainerId);
  const groupIds = groups.map((group) => group.id);
  return {
    sports: db.sports,
    students,
    groups,
    workouts: db.workouts.filter((workout) => workout.trainerId === trainerId),
    events: db.events.filter((event) => event.trainerId === trainerId),
    messages: db.messages.filter((message) => message.trainerId === trainerId),
    financialPlans: db.financialPlans.filter((plan) => plan.trainerId === trainerId),
    payments: db.payments.filter((payment) => payment.trainerId === trainerId),
    physicalAssessments: db.physicalAssessments.filter((assessment) => assessment.trainerId === trainerId && studentIds.includes(assessment.studentId)),
    nutritionPlans: db.nutritionPlans.filter((plan) => plan.trainerId === trainerId && studentIds.includes(plan.studentId)),
    pdfSettings: db.pdfSettings.find((setting) => setting.trainerId === trainerId) || null,
    attendance: db.attendance.filter((item) => {
      const event = db.events.find((eventItem) => eventItem.id === item.eventId);
      return studentIds.includes(item.studentId) || event?.trainerId === trainerId;
    }),
    performance: db.performance.filter((item) => studentIds.includes(item.studentId)),
    users: db.users.filter((user) => user.role !== "student" || studentIds.includes(user.studentId))
  };
}

function studentScoped(db, user) {
  const student = db.students.find((item) => item.id === user.studentId || item.email === user.email);
  if (!student) return { student: null, trainerIds: [], groups: [], groupIds: [] };
  const trainerIds = student.trainerIds || (student.trainerId ? [student.trainerId] : []);
  const groups = db.groups.filter((group) => group.studentIds.includes(student.id) && trainerIds.includes(group.trainerId));
  return { student, trainerIds, groups, groupIds: groups.map((group) => group.id) };
}

function trainerDashboard(db, trainerId) {
  const scoped = trainerScoped(db, trainerId);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = scoped.events
    .filter((event) => event.date >= today)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 5);
  const completed = scoped.workouts.reduce((sum, workout) => sum + workout.completedBy.length, 0);
  return {
    students: scoped.students.filter((student) => student.status === "active").length,
    groups: scoped.groups.length,
    sports: scoped.sports.length,
    nextWorkouts: upcoming.length,
    todayEvents: scoped.events.filter((event) => event.date === today),
    upcoming,
    stats: {
      workouts: scoped.workouts.length,
      completed,
      attendance: scoped.attendance.length
    }
  };
}

function studentDashboard(db, user) {
  const { student, trainerIds, groups, groupIds } = studentScoped(db, user);
  if (!student) return { student: null, workouts: [], events: [], messages: [] };
  const workouts = db.workouts.filter((workout) => {
    if (!trainerIds.includes(workout.trainerId)) return false;
    return (workout.targetType === "student" && workout.targetId === student.id) ||
      (workout.targetType === "group" && groupIds.includes(workout.targetId));
  });
  const events = db.events.filter((event) => {
    if (!trainerIds.includes(event.trainerId)) return false;
    return event.studentId === student.id || groupIds.includes(event.groupId);
  });
  const messages = db.messages.filter((message) => {
    if (!trainerIds.includes(message.trainerId)) return false;
    return message.targetType === "all" ||
      (message.targetType === "student" && message.targetId === student.id) ||
      (message.targetType === "group" && groupIds.includes(message.targetId));
  });
  return { student: studentPayload(db, student), groups, workouts, events, messages };
}

function serveStatic(req, res) {
  const requested = req.url === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
  const filePath = path.normalize(path.join(publicDir, requested));
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      return res.end("Not found");
    }
    const ext = path.extname(filePath);
    const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml; charset=utf-8", ".webmanifest": "application/manifest+json; charset=utf-8" };
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(content);
  });
}

async function handleApi(req, res) {
  const db = readDb();
  const method = req.method;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean).slice(1);

  try {
    if (method === "POST" && parts[0] === "login") {
      const body = await parseBody(req);
      const user = db.users.find((item) => item.email.toLowerCase() === String(body.email || "").toLowerCase() && item.password === body.password && item.role === body.role);
      if (!user) return send(res, 401, { error: "E-mail, senha ou tipo de conta inválido." });
      const token = id("session");
      sessions.set(token, user.id);
      return send(res, 200, { token, user: publicUser(user), permissions: db.permissions[user.role] || [] });
    }

    if (method === "POST" && parts[0] === "register") {
      const body = await parseBody(req);
      if (!body.name || !body.email || !body.password || !body.role) return send(res, 400, { error: "Preencha nome, e-mail, senha e tipo de conta." });
      if (db.users.some((user) => user.email.toLowerCase() === body.email.toLowerCase())) return send(res, 409, { error: "E-mail já cadastrado." });
      const user = { id: id("u"), name: body.name, email: body.email, password: body.password, role: body.role, phone: body.phone || "", avatar: "", createdAt: now() };
      if (body.role === "student") {
        const sportId = db.sports[0]?.id || "";
        const student = { id: id("s"), userId: user.id, photo: "", name: body.name, birthDate: "", phone: body.phone || "", email: body.email, sportId, goal: "", notes: "", status: "active", trainerIds: [], trainerId: "", createdAt: now() };
        user.studentId = student.id;
        db.students.push(student);
      }
      db.users.push(user);
      writeDb(db);
      return send(res, 201, { user: publicUser(user) });
    }

    const user = requireUser(req, res, db);
    if (!user) return;

    if (method === "GET" && parts[0] === "me") return send(res, 200, { user: publicUser(user), permissions: db.permissions[user.role] || [] });
    if (method === "GET" && parts[0] === "dashboard") return send(res, 200, user.role === "trainer" ? trainerDashboard(db, user.id) : studentDashboard(db, user));
    if (method === "GET" && parts[0] === "data") {
      const scoped = user.role === "trainer" ? trainerScoped(db, user.id) : (() => {
        const studentData = studentDashboard(db, user);
        return {
          sports: db.sports,
          students: studentData.student ? [studentData.student] : [],
          groups: studentData.groups || [],
          workouts: studentData.workouts || [],
          events: studentData.events || [],
          messages: studentData.messages || [],
          attendance: db.attendance.filter((item) => item.studentId === studentData.student?.id),
          performance: db.performance.filter((item) => item.studentId === studentData.student?.id),
          users: [user],
          financialPlans: [],
          payments: [],
          physicalAssessments: [],
          nutritionPlans: [],
          pdfSettings: null
        };
      })();
      return send(res, 200, {
        users: scoped.users.map(publicUser),
        sports: scoped.sports,
        students: scoped.students.map((student) => studentPayload(db, student)),
        groups: scoped.groups,
        workouts: scoped.workouts,
        events: scoped.events,
        messages: scoped.messages,
        financialPlans: scoped.financialPlans,
        payments: scoped.payments,
        physicalAssessments: scoped.physicalAssessments,
        nutritionPlans: scoped.nutritionPlans,
        pdfSettings: scoped.pdfSettings,
        attendance: scoped.attendance,
        performance: scoped.performance,
        permissions: db.permissions
      });
    }

    if (user.role !== "trainer" && !["complete-workout", "attendance"].includes(parts[0])) return send(res, 403, { error: "Permissão insuficiente." });

    const collections = { sports: "sp", students: "s", groups: "g", workouts: "w", events: "e", messages: "m", financialPlans: "fp", payments: "pay", pdfSettings: "pdf", physicalAssessments: "pa", nutritionPlans: "np" };
    const collection = parts[0];
    if (collections[collection]) {
      if (method === "POST") {
        const body = await parseBody(req);
        const item = { id: id(collections[collection]), ...body, createdAt: now() };
        if (collection !== "sports") item.trainerId = user.id;
        if (collection === "workouts") item.completedBy = [];
        if (collection === "physicalAssessments" || collection === "nutritionPlans") {
          const student = db.students.find((entry) => entry.id === item.studentId);
          if (!student || (!((student.trainerIds || []).includes(user.id)) && student.trainerId !== user.id)) return send(res, 403, { error: "Aluno pertence a outro personal." });
          if (collection === "physicalAssessments") item.imc = item.imc || calculateImc(item.weight, item.height);
        }
        if (collection === "groups") item.studentIds = (item.studentIds || []).filter((studentId) => {
          const student = db.students.find((entry) => entry.id === studentId);
          return student && ((student.trainerIds || []).includes(user.id) || student.trainerId === user.id);
        });
        db[collection].push(item);
        if (collection === "students" && body.email) {
          const existingUser = db.users.find((itemUser) => itemUser.email.toLowerCase() === body.email.toLowerCase());
          if (existingUser && existingUser.role === "student") {
            existingUser.studentId = item.id;
            existingUser.name = body.name || existingUser.name;
            existingUser.phone = body.phone || existingUser.phone || "";
            existingUser.avatar = body.photo || existingUser.avatar || "";
            item.userId = existingUser.id;
          }
          item.trainerIds = Array.from(new Set([...(item.trainerIds || []), user.id]));
          item.trainerId = user.id;
          if (!existingUser) {
            const studentUser = { id: id("u"), name: body.name, email: body.email, password: "123456", role: "student", phone: body.phone || "", avatar: body.photo || "", studentId: item.id, createdAt: now() };
            item.userId = studentUser.id;
            db.users.push(studentUser);
          }
        }
        writeDb(db);
        return send(res, 201, item);
      }
      if (method === "PUT" && parts[1]) {
        const body = await parseBody(req);
        const index = db[collection].findIndex((item) => item.id === parts[1]);
        if (index < 0) return send(res, 404, { error: "Registro não encontrado." });
        if (collection !== "sports" && db[collection][index].trainerId !== user.id) return send(res, 403, { error: "Registro pertence a outro personal." });
        if (collection === "groups" && body.studentIds) {
          body.studentIds = body.studentIds.filter((studentId) => {
            const student = db.students.find((entry) => entry.id === studentId);
            return student && ((student.trainerIds || []).includes(user.id) || student.trainerId === user.id);
          });
        }
        if ((collection === "physicalAssessments" || collection === "nutritionPlans") && body.studentId) {
          const student = db.students.find((entry) => entry.id === body.studentId);
          if (!student || (!((student.trainerIds || []).includes(user.id)) && student.trainerId !== user.id)) return send(res, 403, { error: "Aluno pertence a outro personal." });
        }
        if (collection === "physicalAssessments") body.imc = body.imc || calculateImc(body.weight, body.height);
        db[collection][index] = { ...db[collection][index], ...body, updatedAt: now() };
        if (collection === "students" && body.email) {
          const existingUser = db.users.find((itemUser) => itemUser.email.toLowerCase() === body.email.toLowerCase() && itemUser.role === "student");
          if (existingUser) {
            existingUser.studentId = db[collection][index].id;
            existingUser.name = body.name || existingUser.name;
            existingUser.phone = body.phone || existingUser.phone || "";
            existingUser.avatar = body.photo || existingUser.avatar || "";
            db[collection][index].userId = existingUser.id;
          }
          db[collection][index].trainerIds = Array.from(new Set([...(db[collection][index].trainerIds || []), user.id]));
          db[collection][index].trainerId = db[collection][index].trainerId || user.id;
        }
        writeDb(db);
        return send(res, 200, db[collection][index]);
      }
      if (method === "DELETE" && parts[1]) {
        if (collection !== "sports") {
          const item = db[collection].find((entry) => entry.id === parts[1]);
          if (!item) return send(res, 404, { error: "Registro não encontrado." });
          if (item.trainerId !== user.id) return send(res, 403, { error: "Registro pertence a outro personal." });
        }
        db[collection] = db[collection].filter((item) => item.id !== parts[1]);
        if (collection === "students") db.groups.forEach((group) => group.studentIds = group.studentIds.filter((studentId) => studentId !== parts[1]));
        writeDb(db);
        return send(res, 200, { ok: true });
      }
    }

    if (method === "POST" && parts[0] === "complete-workout") {
      const body = await parseBody(req);
      const { student, trainerIds, groupIds } = studentScoped(db, user);
      const workout = db.workouts.find((item) => item.id === body.workoutId);
      if (!student || !workout) return send(res, 404, { error: "Treino não encontrado." });
      const allowed = trainerIds.includes(workout.trainerId) &&
        ((workout.targetType === "student" && workout.targetId === student.id) ||
        (workout.targetType === "group" && groupIds.includes(workout.targetId)));
      if (!allowed) return send(res, 403, { error: "Treino não pertence a este aluno." });
      if (!workout.completedBy.includes(student.id)) workout.completedBy.push(student.id);
      let perf = db.performance.find((item) => item.studentId === student.id);
      if (!perf) {
        perf = { id: id("p"), studentId: student.id, score: 70, completed: 0, streak: 0 };
        db.performance.push(perf);
      }
      perf.completed += 1;
      perf.streak += 1;
      perf.score = Math.min(100, perf.score + 2);
      writeDb(db);
      return send(res, 200, { workout, performance: perf });
    }

    if (method === "POST" && parts[0] === "attendance") {
      const body = await parseBody(req);
      const student = db.students.find((item) => item.id === (body.studentId || user.studentId) || item.email === user.email);
      if (!student || !body.eventId) return send(res, 400, { error: "Evento e aluno são obrigatórios." });
      const event = db.events.find((item) => item.id === body.eventId);
      const trainerIds = student.trainerIds || (student.trainerId ? [student.trainerId] : []);
      if (!event || (user.role === "trainer" && event.trainerId !== user.id) || (user.role === "student" && !trainerIds.includes(event.trainerId))) {
        return send(res, 403, { error: "Evento não disponível para este usuário." });
      }
      const exists = db.attendance.some((item) => item.eventId === body.eventId && item.studentId === student.id);
      if (!exists) db.attendance.push({ id: id("a"), eventId: body.eventId, studentId: student.id, checkedAt: now() });
      writeDb(db);
      return send(res, 200, { ok: true });
    }

    send(res, 404, { error: "Rota não encontrada." });
  } catch (error) {
    send(res, 500, { error: error.message || "Erro interno." });
  }
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) return handleApi(req, res);
  return serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Relay by Bentus rodando em http://localhost:${PORT}`);
});
