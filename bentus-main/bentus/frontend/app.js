const app = document.querySelector("#app");
const toastBox = document.querySelector("#toast");
const BRAND_SHORT = "Relay";
const BRAND_FULL = "Relay by Bentus";
const BRAND_TAGLINE = "Dados que guiam. Resultados que falam.";

const state = {
  token: localStorage.getItem("sportflow_token") || "",
  user: JSON.parse(localStorage.getItem("sportflow_user") || "null"),
  roleChoice: "trainer",
  authMode: "login",
  view: "dashboard",
  data: null,
  dashboard: null,
  editing: null,
  pdfPreview: null,
  financeFilters: { search: "", status: "", planId: "", month: "", sportId: "" },
  nutritionFilters: { search: "", objective: "" },
  selectedAssessmentStudentId: "",
  sidebarOpen: false
};

const navIcon = (paths) => `<svg class="nav-svg" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
const icons = {
  dashboard: navIcon('<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect>'),
  students: navIcon('<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="9.5" cy="7" r="4"></circle><path d="M19 8v6"></path><path d="M22 11h-6"></path>'),
  sports: navIcon('<circle cx="12" cy="12" r="9"></circle><path d="M5.6 5.8c3.2 1.2 6 4.1 7.2 7.5"></path><path d="M18.4 5.8c-3.2 1.2-6 4.1-7.2 7.5"></path><path d="M4 13.2c4.7-1.5 11.3-1.5 16 0"></path>'),
  groups: navIcon('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.9"></path><path d="M16 3.1a4 4 0 0 1 0 7.8"></path>'),
  workouts: navIcon('<path d="M6.5 6.5 17.5 17.5"></path><path d="m21 14-7 7"></path><path d="m10 3-7 7"></path><path d="m18 11 3 3"></path><path d="m3 10 3 3"></path><path d="m14 3 7 7"></path><path d="m3 14 7 7"></path>'),
  nutrition: navIcon('<path d="M4 3v8a3 3 0 0 0 3 3v7"></path><path d="M7 3v18"></path><path d="M10 3v8a3 3 0 0 1-3 3"></path><path d="M16 3c2.8 1.9 4 4.6 4 8v2h-4v8"></path>'),
  schedule: navIcon('<rect x="3" y="4" width="18" height="17" rx="2"></rect><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 10h18"></path><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path>'),
  messages: navIcon('<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path><path d="M8 9h8"></path><path d="M8 13h5"></path>'),
  finance: navIcon('<path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"></path>'),
  settings: navIcon('<path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"></path><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1A1.7 1.7 0 0 0 21 10h.1a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z"></path>'),
  reports: navIcon('<path d="M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5Z"></path><path d="M8 7h8"></path><path d="M8 11h8"></path><path d="M8 15h5"></path>'),
  profile: navIcon('<circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>')
};

const nutritionMeals = [
  ["breakfast", "Caf\u00e9 da manh\u00e3"],
  ["morningSnack", "Lanche da manh\u00e3"],
  ["lunch", "Almo\u00e7o"],
  ["afternoonSnack", "Lanche da tarde"],
  ["preWorkout", "Pr\u00e9-treino"],
  ["postWorkout", "P\u00f3s-treino"],
  ["dinner", "Jantar"],
  ["supper", "Ceia"]
];

function brandLogo(label = BRAND_SHORT) {
  return `<div class="brand"><span class="brand-mark" aria-hidden="true"><span></span></span><span>${label}</span></div>`;
}

const trainerNav = [
  ["dashboard", "Dashboard", icons.dashboard],
  ["students", "Alunos", icons.students],
  ["sports", "Modalidades", icons.sports],
  ["groups", "Grupos", icons.groups],
  ["workouts", "Treinos", icons.workouts],
  ["nutrition", "Plano Alimentar", icons.nutrition],
  ["schedule", "Agenda", icons.schedule],
  ["messages", "Comunica\u00e7\u00e3o", icons.messages],
  ["finance", "Financeiro", icons.finance],
  ["settings", "Configura\u00e7\u00f5es", icons.settings],
  ["reports", "Relat\u00f3rios", icons.reports]
];

const studentNav = [
  ["dashboard", "In\u00edcio", icons.dashboard],
  ["my-workouts", "Meus treinos", icons.workouts],
  ["student-schedule", "Agenda", icons.schedule],
  ["profile", "Perfil", icons.profile]
];

const api = async (path, options = {}) => {
  const response = await fetch(`/api/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Erro na solicita\u00e7\u00e3o.");
  return data;
};

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const initials = (name = "SF") => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const sportName = (id) => state.data?.sports.find((sport) => sport.id === id)?.name || "Sem modalidade";
const studentName = (id) => state.data?.students.find((student) => student.id === id)?.name || "Aluno";
const groupName = (id) => state.data?.groups.find((group) => group.id === id)?.name || "Grupo";
const todayISO = () => new Date().toISOString().slice(0, 10);
const linkedStudentUser = (student) => state.data?.users.find((user) => user.role === "student" && (user.studentId === student.id || user.email.toLowerCase() === student.email.toLowerCase()));
const brl = (value = 0) => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dateBR = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR") : "-";
const monthKey = (value = todayISO()) => String(value).slice(0, 7);
const planName = (id) => state.data?.financialPlans?.find((plan) => plan.id === id)?.name || "Sem plano";
const planValue = (id) => Number(state.data?.financialPlans?.find((plan) => plan.id === id)?.monthlyValue || 0);
const numberValue = (value) => Number(String(value || "").replace(",", ".")) || 0;
const formatMeasure = (value, suffix = "") => value || value === 0 ? `${String(value).replace(".", ",")}${suffix}` : "-";

function paymentStatus(payment) {
  if (payment.status === "paid") return "paid";
  if (payment.dueDate && payment.dueDate < todayISO()) return "overdue";
  return payment.status || "pending";
}

function paymentStatusLabel(status) {
  return ({ paid: "Pago", pending: "Pendente", overdue: "Atrasado" })[status] || status;
}

function parseMoney(value) {
  if (typeof value === "number") return value;
  const normalized = String(value || "0").replace(/[R$\s.]/g, "").replace(",", ".");
  return Number(normalized) || 0;
}

function calculateImc(weight, height) {
  const weightValue = numberValue(weight);
  const heightValue = numberValue(height);
  const meters = heightValue > 3 ? heightValue / 100 : heightValue;
  if (!weightValue || !meters) return "";
  return (weightValue / (meters * meters)).toFixed(1);
}

function updateAssessmentImc(form) {
  if (!form || form.dataset.type !== "physicalAssessment") return;
  const imcInput = form.elements.imc;
  if (!imcInput) return;
  const imc = calculateImc(form.elements.weight?.value, form.elements.height?.value);
  if (imc) imcInput.value = imc;
}

function workoutExercises(workout = {}) {
  workout = workout || {};
  if (Array.isArray(workout.exercises) && workout.exercises.length) return workout.exercises;
  const names = String(workout.exercise || "")
    .split(/\n|;/)
    .map((name) => name.trim())
    .filter(Boolean);
  return (names.length ? names : ["Exerc\u00edcio n\u00e3o informado"]).map((name) => ({
    name,
    sets: workout.sets || "",
    reps: workout.reps || "",
    rest: workout.rest || ""
  }));
}

function exerciseRows(item = {}) {
  item = item || {};
  const rows = workoutExercises(item).filter((exercise) => exercise.name !== "Exerc\u00edcio n\u00e3o informado");
  const visibleRows = rows.length ? rows : [{ name: "", sets: "", reps: "", rest: "" }];
  return visibleRows.map((exercise, index) => exerciseRow(exercise, index)).join("");
}

function exerciseRow(exercise = {}, index = 0) {
  return `
    <div class="exercise-row" data-exercise-row>
      <label class="field"><span>Exerc\u00edcio</span><input name="exerciseName" placeholder="Supino reto" value="${escapeHtml(exercise.name || "")}"></label>
      <label class="field"><span>S\u00e9ries</span><input name="exerciseSets" placeholder="4" value="${escapeHtml(exercise.sets || "")}"></label>
      <label class="field"><span>Repeti\u00e7\u00f5es</span><input name="exerciseReps" placeholder="12" value="${escapeHtml(exercise.reps || "")}"></label>
      <label class="field"><span>Descanso</span><input name="exerciseRest" placeholder="60s" value="${escapeHtml(exercise.rest || "")}"></label>
      <button class="btn secondary" type="button" data-action="remove-exercise" ${index === 0 ? "disabled" : ""}>Remover</button>
    </div>`;
}

function toast(message) {
  const item = document.createElement("div");
  item.className = "toast-item";
  item.textContent = message;
  toastBox.appendChild(item);
  setTimeout(() => item.remove(), 3200);
}

async function loadAll() {
  if (!state.token) return;
  const [data, dashboard] = await Promise.all([api("data"), api("dashboard")]);
  state.data = data;
  state.dashboard = dashboard;
}

function setSession(payload) {
  state.token = payload.token;
  state.user = payload.user;
  localStorage.setItem("sportflow_token", state.token);
  localStorage.setItem("sportflow_user", JSON.stringify(state.user));
}

function logout() {
  state.token = "";
  state.user = null;
  state.data = null;
  localStorage.removeItem("sportflow_token");
  localStorage.removeItem("sportflow_user");
  render();
}

function authScreen() {
  app.innerHTML = `
    <main class="auth-shell">
      <section class="auth-visual">
        ${brandLogo(BRAND_FULL)}
        <div class="auth-copy">
          <h1>${BRAND_SHORT}</h1>
          <p>${BRAND_TAGLINE}</p>
        </div>
      </section>
      <section class="auth-panel">
        <div class="auth-card">
          <h2>${state.authMode === "login" ? "Entrar na plataforma" : "Criar conta"}</h2>
          <div class="tabs">
            <button class="${state.authMode === "login" ? "active" : ""}" data-auth="login">Login</button>
            <button class="${state.authMode === "register" ? "active" : ""}" data-auth="register">Cadastro</button>
          </div>
          <div class="role-switch">
            <button class="${state.roleChoice === "trainer" ? "active" : ""}" data-role="trainer">Personal</button>
            <button class="${state.roleChoice === "student" ? "active" : ""}" data-role="student">Aluno</button>
          </div>
        <form class="form" id="authForm" autocomplete="off">
            ${state.authMode === "register" ? `<label class="field"><span>Nome completo</span><input name="name" required placeholder="Seu nome" /></label>` : ""}
            <label class="field"><span>E-mail</span><input type="email" name="email" required placeholder="seu@email.com" autocomplete="off" /></label>
            <label class="field"><span>Senha</span><input type="password" name="password" required placeholder="Sua senha" autocomplete="new-password" /></label>
            ${state.authMode === "register" ? `<label class="field"><span>Telefone</span><input name="phone" placeholder="(00) 00000-0000" /></label>` : ""}
            <button class="btn" type="submit">${state.authMode === "login" ? "Acessar painel" : "Criar conta"}</button>
          </form>
        </div>
      </section>
    </main>
  `;
  disableAutocomplete();
}

function layout(content) {
  const nav = (state.user.role === "trainer" ? trainerNav : studentNav)
    .filter(([key]) => !["messages", "reports"].includes(key));
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar ${state.sidebarOpen ? "open" : ""}">
        ${brandLogo(BRAND_SHORT)}
        <nav class="nav">
          ${nav.map(([key, label, icon]) => `<button class="${state.view === key ? "active" : ""}" data-view="${key}"><span>${icon}</span>${label}</button>`).join("")}
        </nav>
        <div class="sidebar-footer">
          <div class="user-pill"><span class="avatar">${initials(state.user.name)}</span><span>${escapeHtml(state.user.name)}<br><small>${state.user.role === "trainer" ? "Personal Trainer" : "Aluno"}</small></span></div>
          <button class="btn secondary" data-action="logout">Sair</button>
        </div>
      </aside>
      <button class="sidebar-overlay ${state.sidebarOpen ? "open" : ""}" data-action="close-menu" aria-label="Fechar menu"></button>
      <main class="main">
        <header class="topbar">
          <button class="btn secondary mobile-menu" data-action="menu">Menu</button>
          <div>
            <strong>${state.user.role === "trainer" ? "Painel do Personal" : "\u00c1rea do Aluno"}</strong>
            <div class="muted">${BRAND_TAGLINE}</div>
          </div>
          <span class="status-pill">Online</span>
        </header>
        ${content}
      </main>
    </div>
    ${state.editing ? modal() : ""}
    ${state.pdfPreview ? pdfPreviewModal() : ""}
  `;
  disableAutocomplete();
}

function disableAutocomplete() {
  document.querySelectorAll("input, textarea").forEach((field) => {
    field.setAttribute("autocomplete", "off");
    field.setAttribute("autocorrect", "off");
    field.setAttribute("autocapitalize", "off");
    field.setAttribute("spellcheck", "false");
  });
}

function metrics(items) {
  return `<div class="grid cols-4">${items.map((item) => `
    <article class="card metric">
      <span class="muted">${item.label}</span>
      <strong>${item.value}</strong>
      <span class="chip">${item.detail}</span>
    </article>`).join("")}</div>`;
}

function trainerDashboard() {
  const d = state.dashboard;
  return `
    <section class="section-head"><div><h2>Dashboard</h2><p class="muted">Vis\u00e3o r\u00e1pida da opera\u00e7\u00e3o esportiva.</p></div></section>
    ${metrics([
      { label: "Alunos ativos", value: d.students, detail: "base atual" },
      { label: "Grupos", value: d.groups, detail: "equipes criadas" },
      { label: "Pr\u00f3ximos treinos", value: d.nextWorkouts, detail: "agenda futura" },
      { label: "Presen\u00e7as", value: d.stats.attendance, detail: "check-ins" }
    ])}
    <div class="grid cols-2" style="margin-top:16px">
      <article class="card"><h3>Agenda do dia</h3><div class="list">${(d.todayEvents.length ? d.todayEvents : [{ title: "Sem eventos hoje", time: "", location: "Crie um treino na agenda" }]).map(eventCard).join("")}</div></article>
      <article class="card"><h3>Pr\u00f3ximos eventos</h3><div class="list">${d.upcoming.map(eventCard).join("")}</div></article>
    </div>
  `;
}

function eventCard(event) {
  return `<div class="list-item"><div><strong>${escapeHtml(event.title)}</strong><div class="muted">${event.date || ""} ${event.time || ""} - ${escapeHtml(event.location || "")}</div></div><span class="chip">${escapeHtml(event.type || "Treino")}</span></div>`;
}

function studentsView() {
  const selectedStudent = state.data.students.find((student) => student.id === state.selectedAssessmentStudentId);
  return `
    <section class="section-head">
      <div><h2>Cadastro de alunos</h2><p class="muted">Gerencie perfil, objetivo, modalidade e observa\u00e7\u00f5es.</p></div>
      <button class="btn" data-modal="student">Adicionar aluno</button>
    </section>
    <div class="table-card"><table>
      <thead><tr><th>Aluno</th><th>Contato</th><th>Acesso</th><th>Modalidade</th><th>Objetivo</th><th>A\u00e7\u00f5es</th></tr></thead>
      <tbody>${state.data.students.map((student) => `
        <tr>
          <td><div class="student-cell">${student.photo ? `<img class="photo" src="${student.photo}" alt="">` : `<span class="photo">${initials(student.name)}</span>`}<div><strong>${escapeHtml(student.name)}</strong><div class="muted">${student.birthDate || "Nascimento n\u00e3o informado"}</div></div></div></td>
          <td>${escapeHtml(student.phone || "")}<div class="muted">${escapeHtml(student.email || "")}</div></td>
          <td>${linkedStudentUser(student) ? `<span class="chip" title="Este aluno consegue entrar pelo login de aluno">Com acesso</span>` : `<span class="chip" title="Ao salvar um e-mail v\u00e1lido, o sistema cria acesso inicial com senha 123456">Sem acesso</span>`}</td>
          <td>${escapeHtml(student.sportName)}</td>
          <td>${escapeHtml(student.goal || "")}</td>
          <td><div class="actions"><button class="btn secondary" data-assessment-student="${student.id}">Avalia\u00e7\u00e3o</button><button class="btn secondary" data-edit="student:${student.id}">Editar</button><button class="btn danger" data-delete="students:${student.id}">Remover</button></div></td>
        </tr>`).join("")}</tbody>
    </table></div>
    ${selectedStudent ? physicalAssessmentsView(selectedStudent) : ""}`;
}

function studentAssessments(studentId) {
  return [...(state.data.physicalAssessments || [])]
    .filter((assessment) => assessment.studentId === studentId)
    .sort((a, b) => String(b.assessmentDate || "").localeCompare(String(a.assessmentDate || "")));
}

function assessmentDelta(current, previous, key, suffix = "") {
  if (!current || !previous || current[key] === "" || previous[key] === "" || current[key] == null || previous[key] == null) return "";
  const diff = numberValue(current[key]) - numberValue(previous[key]);
  if (!diff) return "sem varia\u00e7\u00e3o";
  return `${diff > 0 ? "+" : ""}${String(diff.toFixed(1)).replace(".", ",")}${suffix}`;
}

function assessmentMetric(label, value, delta = "") {
  return `<div class="assessment-metric"><span>${label}</span><strong>${escapeHtml(value || "-")}</strong>${delta ? `<small>${escapeHtml(delta)}</small>` : ""}</div>`;
}

function assessmentHistory(assessments) {
  if (!assessments.length) return `<p class="muted">Nenhuma avalia\u00e7\u00e3o cadastrada para este aluno.</p>`;
  return `<div class="assessment-history">${assessments.map((assessment, index) => `
    <div class="assessment-history-item">
      <div><strong>${dateBR(assessment.assessmentDate)}</strong><span class="muted">${index === 0 ? "Atual" : "Hist\u00f3rico"}</span></div>
      <div class="actions">
        <span class="chip">${formatMeasure(assessment.weight, " kg")}</span>
        <span class="chip">IMC ${formatMeasure(assessment.imc)}</span>
        <span class="chip">${formatMeasure(assessment.bodyFat, "% gordura")}</span>
      </div>
      <button class="btn secondary" data-edit="physicalAssessment:${assessment.id}">Editar</button>
    </div>`).join("")}</div>`;
}

function physicalAssessmentsView(student) {
  const assessments = studentAssessments(student.id);
  const current = assessments[0];
  const previous = assessments[1];
  return `
    <section class="section-head assessment-head">
      <div><h2>Avalia&ccedil;&atilde;o F&iacute;sica</h2><p class="muted">${escapeHtml(student.name)} - acompanhe hist&oacute;rico e evolu&ccedil;&atilde;o.</p></div>
      <div class="actions">
        <button class="btn secondary" data-action="close-assessment">Fechar</button>
        <button class="btn" data-modal-assessment="${student.id}">Nova avalia&ccedil;&atilde;o</button>
      </div>
    </section>
    <div class="grid">
      <article class="card assessment-card">
        <div class="section-head">
          <div class="student-cell">${student.photo ? `<img class="photo" src="${student.photo}" alt="">` : `<span class="photo">${initials(student.name)}</span>`}<div><h3>${escapeHtml(student.name)}</h3><p class="muted">${escapeHtml(student.sportName)} - ${assessments.length} avalia&ccedil;&otilde;es</p></div></div>
        </div>
        ${current ? `
          <div class="assessment-grid">
            ${assessmentMetric("Peso", formatMeasure(current.weight, " kg"), assessmentDelta(current, previous, "weight", " kg"))}
            ${assessmentMetric("Altura", formatMeasure(current.height, " cm"))}
            ${assessmentMetric("IMC", formatMeasure(current.imc), assessmentDelta(current, previous, "imc"))}
            ${assessmentMetric("Gordura", formatMeasure(current.bodyFat, "%"), assessmentDelta(current, previous, "bodyFat", "%"))}
            ${assessmentMetric("Massa muscular", formatMeasure(current.muscleMass, " kg"), assessmentDelta(current, previous, "muscleMass", " kg"))}
            ${assessmentMetric("Abdomen", formatMeasure(current.waist, " cm"), assessmentDelta(current, previous, "waist", " cm"))}
          </div>
          <p class="muted">${escapeHtml(current.notes || "")}</p>
        ` : `<div class="empty-state"><strong>Sem avalia&ccedil;&atilde;o ainda</strong><p class="muted">Cadastre a primeira avalia&ccedil;&atilde;o para acompanhar medidas e evolu&ccedil;&atilde;o.</p></div>`}
        <h4>Hist&oacute;rico</h4>
        ${assessmentHistory(assessments)}
      </article>
    </div>`;
}

function sportsView() {
  return `
    <section class="section-head"><div><h2>Modalidades esportivas</h2><p class="muted">Adicione esportes conforme a assessoria cresce.</p></div><button class="btn" data-modal="sport">Nova modalidade</button></section>
    <div class="grid cols-3">${state.data.sports.map((sport) => `
      <article class="card">
        <span class="chip" style="border-color:${sport.color}; color:${sport.color}">${escapeHtml(sport.name)}</span>
        <div class="actions" style="margin-top:16px"><button class="btn secondary" data-edit="sport:${sport.id}">Editar</button><button class="btn danger" data-delete="sports:${sport.id}">Remover</button></div>
      </article>`).join("")}</div>`;
}

function groupsView() {
  return `
    <section class="section-head"><div><h2>Grupos e equipes</h2><p class="muted">Monte times, hor\u00e1rios e locais de treino.</p></div><button class="btn" data-modal="group">Criar grupo</button></section>
    <div class="grid cols-3">${state.data.groups.map((group) => `
      <article class="card">
        <h3>${escapeHtml(group.name)}</h3>
        <p class="muted">${sportName(group.sportId)} - ${escapeHtml(group.location)}</p>
        <p>${escapeHtml(group.schedule)}</p>
        <div class="actions">${group.studentIds.map((studentId) => `<span class="chip">${studentName(studentId)}</span>`).join("")}</div>
        <div class="actions" style="margin-top:16px"><button class="btn secondary" data-edit="group:${group.id}">Editar</button><button class="btn danger" data-delete="groups:${group.id}">Remover</button></div>
      </article>`).join("")}</div>`;
}

function workoutsView() {
  return `
    <section class="section-head"><div><h2>Treinos</h2><p class="muted">Envie treinos para alunos ou grupos.</p></div><button class="btn" data-modal="workout">Criar treino</button></section>
    <div class="grid cols-2">${state.data.workouts.map(workoutCard).join("")}</div>`;
}

function workoutCard(workout, studentMode = false) {
  const target = workout.targetType === "student" ? studentName(workout.targetId) : groupName(workout.targetId);
  const completed = workout.completedBy?.includes(state.dashboard?.student?.id);
  const exercises = workoutExercises(workout);
  return `
    <article class="card">
      <div class="section-head"><div><h3>${escapeHtml(workout.title)}</h3><p class="muted">${workout.date || ""} - ${escapeHtml(target)}</p></div><span class="chip">${workout.time || "Sem tempo"}</span></div>
      <div class="list">${exercises.slice(0, 4).map((exercise) => `
        <div class="list-item">
          <strong>${escapeHtml(exercise.name || "Exerc\u00edcio")}</strong>
          <div class="actions">
            <span class="chip">${escapeHtml(exercise.sets || "-")} s\u00e9ries</span>
            <span class="chip">${escapeHtml(exercise.reps || "-")} reps</span>
            <span class="chip">${escapeHtml(exercise.rest || workout.rest || "-")} descanso</span>
          </div>
        </div>`).join("")}</div>
      <div class="actions">
        <span class="chip">${exercises.length} exerc\u00edcios</span>
        <span class="chip">Dist: ${escapeHtml(workout.distance || "-")}</span>
      </div>
      <p class="muted">${escapeHtml(workout.notes || "")}</p>
      ${!studentMode ? `<div class="actions workout-pdf-actions"><button class="btn" data-pdf="${workout.id}">Gerar PDF do Treino</button></div>` : ""}
      ${studentMode ? `<button class="btn ${completed ? "secondary" : ""}" ${completed ? "disabled" : ""} data-complete="${workout.id}">${completed ? "Treino conclu\u00eddo" : "Marcar como conclu\u00eddo"}</button>` : `<div class="actions workout-card-actions"><button class="btn secondary" data-edit="workout:${workout.id}">Editar</button><button class="btn danger" data-delete="workouts:${workout.id}">Remover</button></div>`}
    </article>`;
}

function filteredNutritionPlans() {
  const filters = state.nutritionFilters;
  const search = filters.search.trim().toLowerCase();
  return (state.data.nutritionPlans || []).filter((plan) => {
    const student = state.data.students.find((item) => item.id === plan.studentId);
    if (search && !student?.name.toLowerCase().includes(search)) return false;
    if (filters.objective && plan.objective !== filters.objective) return false;
    return true;
  });
}

function nutritionPlanMeals(plan = {}) {
  const meals = plan.meals || {};
  return nutritionMeals
    .map(([key, label], index) => ({ key, label, order: index + 1, ...(meals[key] || {}) }))
    .sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
}

function nutritionView() {
  const plans = filteredNutritionPlans();
  const objectives = [...new Set((state.data.nutritionPlans || []).map((plan) => plan.objective).filter(Boolean))];
  return `
    <section class="section-head">
      <div><h2>Plano Alimentar</h2><p class="muted">Crie planos simples por aluno, com refei\u00e7\u00f5es, hor\u00e1rios e observa\u00e7\u00f5es.</p></div>
      <button class="btn" data-modal="nutritionPlan">Criar Plano Alimentar</button>
    </section>
    <div class="card nutrition-filters">
      <label class="field"><span>Buscar aluno</span><input data-nutrition-filter="search" value="${escapeHtml(state.nutritionFilters.search)}" placeholder="Nome do aluno"></label>
      <label class="field"><span>Objetivo</span><select data-nutrition-filter="objective"><option value="">Todos</option>${objectives.map((objective) => `<option value="${escapeHtml(objective)}" ${state.nutritionFilters.objective === objective ? "selected" : ""}>${escapeHtml(objective)}</option>`).join("")}</select></label>
    </div>
    <div class="grid cols-2 nutrition-grid" style="margin-top:16px">
      ${plans.map(nutritionCard).join("") || `<div class="empty-state"><strong>Nenhum plano alimentar encontrado.</strong><p class="muted">Crie o primeiro plano para um aluno.</p></div>`}
    </div>`;
}

function nutritionCard(plan) {
  const student = state.data.students.find((item) => item.id === plan.studentId);
  const filledMeals = nutritionPlanMeals(plan).filter((meal) => meal.foods || meal.quantity || meal.time || meal.notes);
  return `
    <article class="card nutrition-card">
      <div class="section-head">
        <div class="student-cell">
          ${student?.photo ? `<img class="photo" src="${student.photo}" alt="">` : `<span class="photo">${initials(student?.name || "PA")}</span>`}
          <div><h3>${escapeHtml(student?.name || "Aluno n\u00e3o encontrado")}</h3><p class="muted">${dateBR(plan.createdDate)} - ${escapeHtml(plan.objective || "Objetivo n\u00e3o informado")}</p></div>
        </div>
        <span class="chip">${filledMeals.length} refei\u00e7\u00f5es</span>
      </div>
      <div class="nutrition-meal-list">
        ${filledMeals.slice(0, 4).map((meal) => `
          <div class="nutrition-meal-item">
            <strong>${String(meal.order || "").padStart(2, "0")} - ${escapeHtml(meal.label)}</strong>
            <span class="chip">${escapeHtml(meal.time || "--:--")}</span>
            <p>${escapeHtml(meal.foods || "Sem alimentos informados")}</p>
          </div>`).join("") || `<p class="muted">Nenhuma refeicao preenchida.</p>`}
      </div>
      <p class="muted">${escapeHtml(plan.notes || "")}</p>
      <div class="actions">
        <button class="btn" data-nutrition-pdf="${plan.id}">Gerar PDF</button>
        <button class="btn secondary" data-nutrition-share="${plan.id}">Enviar/Compartilhar</button>
        <button class="btn secondary" data-edit="nutritionPlan:${plan.id}">Editar</button>
        <button class="btn danger" data-delete="nutritionPlans:${plan.id}">Excluir</button>
      </div>
    </article>`;
}

function scheduleView(studentMode = false) {
  const events = studentMode ? state.dashboard.events : state.data.events;
  return `
    <section class="section-head"><div><h2>Agenda</h2><p class="muted">Calend\u00e1rio simples com hor\u00e1rios, locais e pr\u00f3ximos eventos.</p></div>${studentMode ? "" : `<button class="btn" data-modal="event">Novo evento</button>`}</section>
    <div class="calendar">${nextDays(14).map((date) => {
      const dayEvents = events.filter((event) => event.date === date.iso);
      return `<div class="day"><strong>${date.label}</strong><span class="muted">${date.iso}</span>${dayEvents.map((event) => `<span class="event-dot">${event.time} ${escapeHtml(event.title)}</span>`).join("")}</div>`;
    }).join("")}</div>`;
}

function messagesView() {
  return `
    <section class="section-head"><div><h2>Comunica\u00e7\u00e3o</h2><p class="muted">Avisos r\u00e1pidos, mensagens para grupos e notifica\u00e7\u00f5es.</p></div><button class="btn" data-modal="message">Novo aviso</button></section>
    <div class="grid cols-2">${state.data.messages.map((message) => `
      <article class="card"><span class="chip">${message.targetType === "all" ? "Todos" : message.targetType}</span><h3>${escapeHtml(message.title)}</h3><p>${escapeHtml(message.body)}</p><div class="actions"><button class="btn secondary" data-edit="message:${message.id}">Editar</button><button class="btn danger" data-delete="messages:${message.id}">Remover</button></div></article>`).join("")}</div>`;
}

function filteredPayments() {
  const filters = state.financeFilters;
  return (state.data.payments || []).filter((payment) => {
    const student = state.data.students.find((item) => item.id === payment.studentId);
    const plan = state.data.financialPlans.find((item) => item.id === payment.planId);
    const search = filters.search.trim().toLowerCase();
    if (search && !student?.name.toLowerCase().includes(search)) return false;
    if (filters.status && paymentStatus(payment) !== filters.status) return false;
    if (filters.planId && payment.planId !== filters.planId) return false;
    if (filters.month && monthKey(payment.dueDate) !== filters.month) return false;
    if (filters.sportId && plan?.sportId !== filters.sportId) return false;
    return true;
  });
}

function financeSummary(payments = state.data.payments || []) {
  const month = todayISO().slice(0, 7);
  const monthPayments = payments.filter((payment) => monthKey(payment.dueDate) === month);
  const received = monthPayments.filter((payment) => paymentStatus(payment) === "paid").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const pending = monthPayments.filter((payment) => paymentStatus(payment) !== "paid").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const payingStudents = new Set(monthPayments.map((payment) => payment.studentId)).size;
  const overdueStudents = new Set(monthPayments.filter((payment) => paymentStatus(payment) === "overdue").map((payment) => payment.studentId)).size;
  const nextDue = monthPayments.filter((payment) => paymentStatus(payment) !== "paid" && payment.dueDate >= todayISO()).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 3);
  return { monthTotal: received + pending, received, pending, payingStudents, overdueStudents, nextDue };
}

function financeView() {
  const payments = filteredPayments();
  const summary = financeSummary(state.data.payments || []);
  const filters = state.financeFilters;
  const plans = state.data.financialPlans || [];
  const overdue = (state.data.payments || []).filter((payment) => paymentStatus(payment) === "overdue");
  const upcoming = (state.data.payments || []).filter((payment) => paymentStatus(payment) === "pending" && payment.dueDate >= todayISO()).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  return `
    <section class="section-head">
      <div><h2>Financeiro</h2><p class="muted">Controle mensalidades, pagamentos, pend\u00eancias e faturamento.</p></div>
      <div class="actions"><button class="btn secondary" data-action="finance-pdf">Exportar PDF</button><button class="btn secondary" data-modal="financialPlan">Criar plano</button><button class="btn" data-modal="payment">Registrar pagamento</button></div>
    </section>
    ${metrics([
      { label: "Faturamento do m\u00eas", value: brl(summary.monthTotal), detail: "previsto" },
      { label: "Recebido", value: brl(summary.received), detail: "pagamentos pagos" },
      { label: "Pendente", value: brl(summary.pending), detail: "a receber" },
      { label: "Alunos pagantes", value: summary.payingStudents, detail: "com mensalidade" },
      { label: "Inadimplentes", value: summary.overdueStudents, detail: "alunos atrasados" },
      { label: "Pr\u00f3ximos vencimentos", value: summary.nextDue.length, detail: "neste m\u00eas" }
    ])}
    <div class="grid cols-2" style="margin-top:16px">
      <article class="card"><h3>Alertas financeiros</h3><div class="list">${financialAlerts(overdue, upcoming)}</div></article>
      <article class="card"><h3>Graficos simples</h3>${financeCharts()}</article>
    </div>
    <section class="section-head" style="margin-top:18px"><div><h2>Planos</h2><p class="muted">Mensalidades por modalidade.</p></div></section>
    <div class="grid cols-3">${plans.map((plan) => `
      <article class="card">
        <span class="chip">${escapeHtml(plan.status === "active" ? "Ativo" : "Inativo")}</span>
        <h3>${escapeHtml(plan.name)}</h3>
        <strong>${brl(plan.monthlyValue)}</strong>
        <p class="muted">${sportName(plan.sportId)} - ${escapeHtml(plan.description || "")}</p>
        <div class="actions"><button class="btn secondary" data-edit="financialPlan:${plan.id}">Editar</button><button class="btn danger" data-delete="financialPlans:${plan.id}">Excluir</button></div>
      </article>`).join("")}</div>
    <section class="section-head" style="margin-top:18px"><div><h2>Pagamentos</h2><p class="muted">Filtre por aluno, plano, status, m\u00eas ou modalidade.</p></div></section>
    <div class="card finance-filters">
      <label class="field"><span>Buscar aluno</span><input data-finance-filter="search" value="${escapeHtml(filters.search)}" placeholder="Nome do aluno"></label>
      <label class="field"><span>Status</span><select data-finance-filter="status"><option value="">Todos</option>${["paid", "pending", "overdue"].map((status) => `<option value="${status}" ${filters.status === status ? "selected" : ""}>${paymentStatusLabel(status)}</option>`).join("")}</select></label>
      <label class="field"><span>Plano</span><select data-finance-filter="planId"><option value="">Todos</option>${plans.map((plan) => `<option value="${plan.id}" ${filters.planId === plan.id ? "selected" : ""}>${escapeHtml(plan.name)}</option>`).join("")}</select></label>
      <label class="field"><span>M\u00eas</span><input type="month" data-finance-filter="month" value="${escapeHtml(filters.month)}"></label>
      <label class="field"><span>Modalidade</span><select data-finance-filter="sportId"><option value="">Todas</option>${state.data.sports.map((sport) => `<option value="${sport.id}" ${filters.sportId === sport.id ? "selected" : ""}>${escapeHtml(sport.name)}</option>`).join("")}</select></label>
    </div>
    <div class="table-card" style="margin-top:16px"><table>
      <thead><tr><th>Aluno</th><th>Plano</th><th>Valor</th><th>Vencimento</th><th>Pagamento</th><th>Status</th><th>A\u00e7\u00f5es</th></tr></thead>
      <tbody>${payments.map((payment) => paymentRow(payment)).join("") || `<tr><td colspan="7">Nenhum pagamento encontrado.</td></tr>`}</tbody>
    </table></div>`;
}

function paymentRow(payment) {
  const status = paymentStatus(payment);
  return `<tr>
    <td>${studentName(payment.studentId)}</td>
    <td>${escapeHtml(planName(payment.planId))}</td>
    <td>${brl(payment.amount)}</td>
    <td>${dateBR(payment.dueDate)}</td>
    <td>${dateBR(payment.paidDate)}</td>
    <td><span class="chip finance-${status}">${paymentStatusLabel(status)}</span></td>
    <td><div class="actions">${status !== "paid" ? `<button class="btn" data-paid="${payment.id}">Marcar como pago</button>` : ""}<button class="btn secondary" data-edit="payment:${payment.id}">Editar</button><button class="btn danger" data-delete="payments:${payment.id}">Remover</button></div></td>
  </tr>`;
}

function financialAlerts(overdue, upcoming) {
  const overdueItems = overdue.map((payment) => {
    const days = Math.max(1, Math.floor((new Date(todayISO()) - new Date(payment.dueDate)) / 86400000));
    return `<div class="list-item"><strong>${studentName(payment.studentId)}</strong><span class="chip finance-overdue">atrasado h\u00e1 ${days} dias</span></div>`;
  });
  const upcomingItems = upcoming.map((payment) => `<div class="list-item"><strong>${studentName(payment.studentId)}</strong><span class="chip finance-pending">vence em ${dateBR(payment.dueDate)}</span></div>`);
  return [...overdueItems, ...upcomingItems].slice(0, 6).join("") || `<div class="list-item"><span>Nenhum alerta financeiro agora.</span><span class="chip">OK</span></div>`;
}

function financeCharts() {
  const payments = state.data.payments || [];
  const paid = payments.filter((payment) => paymentStatus(payment) === "paid").length;
  const pending = payments.length - paid;
  const max = Math.max(1, paid, pending);
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const key = date.toISOString().slice(0, 7);
    const total = payments.filter((payment) => monthKey(payment.dueDate) === key && paymentStatus(payment) === "paid").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    return { key, total };
  });
  const maxMonth = Math.max(1, ...months.map((item) => item.total));
  return `<div class="mini-chart">
    <div><span>Pagos</span><i style="width:${(paid / max) * 100}%"></i><strong>${paid}</strong></div>
    <div><span>Pendentes</span><i style="width:${(pending / max) * 100}%"></i><strong>${pending}</strong></div>
  </div>
  <div class="bar-chart">${months.map((item) => `<div><i style="height:${Math.max(8, (item.total / maxMonth) * 100)}%"></i><span>${item.key.slice(5)}</span></div>`).join("")}</div>`;
}

function defaultPdfSettings() {
  return {
    displayName: BRAND_FULL,
    headerSubtitle: "CONSULTORIA ONLINE",
    phone: "",
    instagram: "",
    cref: "",
    primaryColor: "#00C2A8",
    footerText: `Documento gerado pelo Relay by Bentus.`,
    logo: "",
    showPhone: true,
    showInstagram: true,
    showCref: true
  };
}

function currentPdfSettings() {
  return { ...defaultPdfSettings(), ...(state.data?.pdfSettings || {}) };
}

function settingsView() {
  const settings = currentPdfSettings();
  return `
    <section class="section-head">
      <div><h2>Configura\u00e7\u00f5es</h2><p class="muted">Personalize identidade visual e cabe\u00e7alho dos PDFs de treino.</p></div>
    </section>
    <div class="grid cols-2">
      <article class="card">
        <h3>Personaliza\u00e7\u00e3o de PDF</h3>
        <form class="form" id="pdfSettingsForm" autocomplete="off">
          <label class="field"><span>Nome profissional ou assessoria</span><input name="displayName" value="${escapeHtml(settings.displayName)}" placeholder="Carlos Henrique Personal Trainer"></label>
          <label class="field"><span>Subt\u00edtulo do cabe\u00e7alho</span><input name="headerSubtitle" value="${escapeHtml(settings.headerSubtitle || "")}" placeholder="Consultoria Online"></label>
          <label class="field"><span>Logo personalizada</span><input type="file" name="logoFile" accept="image/png,image/jpeg,image/jpg"></label>
          <label class="field"><span>Telefone ou WhatsApp</span><input name="phone" value="${escapeHtml(settings.phone)}" placeholder="(43) 99999-9999"></label>
          <label class="field"><span>Instagram</span><input name="instagram" value="${escapeHtml(settings.instagram)}" placeholder="@carlospersonal"></label>
          <label class="field"><span>CREF</span><input name="cref" value="${escapeHtml(settings.cref)}" placeholder="000000-G/PR"></label>
          <label class="field"><span>Cor principal do PDF</span><input type="color" name="primaryColor" value="${escapeHtml(settings.primaryColor)}"></label>
          <label class="check"><input type="checkbox" name="showPhone" ${settings.showPhone ? "checked" : ""}> Exibir telefone</label>
          <label class="check"><input type="checkbox" name="showInstagram" ${settings.showInstagram ? "checked" : ""}> Exibir Instagram</label>
          <label class="check"><input type="checkbox" name="showCref" ${settings.showCref ? "checked" : ""}> Exibir CREF</label>
          <label class="field span-2"><span>Texto curto de rodap\u00e9</span><textarea name="footerText">${escapeHtml(settings.footerText)}</textarea></label>
          <input type="hidden" name="logo" value="${escapeHtml(settings.logo || "")}">
          <div class="actions"><button class="btn" type="submit">Salvar personaliza\u00e7\u00e3o</button>${settings.logo ? `<button class="btn secondary" type="button" data-action="remove-logo">Remover logo</button>` : ""}</div>
        </form>
      </article>
      <article class="card">
        <h3>Pr\u00e9via do cabe\u00e7alho</h3>
        ${pdfHeaderPreview(settings)}
      </article>
    </div>`;
}

function pdfHeaderPreview(settings) {
  const contacts = [
    settings.showPhone && settings.phone ? `WhatsApp: ${escapeHtml(settings.phone)}` : "",
    settings.showInstagram && settings.instagram ? `Instagram: ${escapeHtml(settings.instagram)}` : "",
    settings.showCref && settings.cref ? `CREF: ${escapeHtml(settings.cref)}` : ""
  ].filter(Boolean);
  return `<div class="pdf-header-preview" style="border-color:${settings.primaryColor}">
    <div class="pdf-preview-logo">${settings.logo ? `<img src="${settings.logo}" alt="Logo">` : `<span>${initials(settings.displayName)}</span>`}</div>
    <div>
      <h2 style="color:${settings.primaryColor}">${escapeHtml(settings.displayName)}</h2>
      ${settings.headerSubtitle ? `<p>${escapeHtml(settings.headerSubtitle)}</p>` : ""}
      ${contacts.map((line) => `<p>${line}</p>`).join("") || `<p class="muted">Informacoes de contato ocultas ou nao preenchidas.</p>`}
      <small>${escapeHtml(settings.footerText || "")}</small>
    </div>
  </div>`;
}

function reportsView() {
  const ranking = [...state.data.performance].sort((a, b) => b.score - a.score);
  const firstEvent = state.data.events[0];
  return `
    <section class="section-head"><div><h2>Relat\u00f3rios</h2><p class="muted">Ranking, hist\u00f3rico, presen\u00e7a e QR Code.</p></div></section>
    <div class="grid cols-2">
      <article class="card"><h3>Ranking de desempenho</h3><div class="list">${ranking.map((item, index) => `
        <div class="list-item"><div><strong>${index + 1}. ${studentName(item.studentId)}</strong><div class="muted">${item.completed} treinos - sequ\u00eancia ${item.streak}</div></div><div style="min-width:120px"><div class="progress"><i style="width:${item.score}%"></i></div><small>${item.score} pts</small></div></div>`).join("")}</div></article>
      <article class="card"><h3>QR Code de presen\u00e7a</h3><p class="muted">Use o c\u00f3digo do pr\u00f3ximo evento para check-in de presen\u00e7a.</p>${qrCode(firstEvent?.id || "sportflow")}<p><strong>${escapeHtml(firstEvent?.title || "Nenhum evento")}</strong></p></article>
      <article class="card"><h3>Hist\u00f3rico de treinos</h3><div class="list">${state.data.workouts.map((workout) => `<div class="list-item"><span>${escapeHtml(workout.title)}</span><span class="chip">${workout.completedBy.length} conclu\u00eddos</span></div>`).join("")}</div></article>
      <article class="card"><h3>Resumo operacional</h3>${metricsMini([["Alunos", state.data.students.length], ["Modalidades", state.data.sports.length], ["Treinos", state.data.workouts.length], ["Avisos", state.data.messages.length]])}</article>
    </div>`;
}

function metricsMini(items) {
  return `<div class="grid cols-2">${items.map(([label, value]) => `<div class="card metric"><span class="muted">${label}</span><strong>${value}</strong></div>`).join("")}</div>`;
}

function studentDashboard() {
  const d = state.dashboard;
  return `
    <section class="section-head"><div><h2>Ol\u00e1, ${escapeHtml(d.student?.name || state.user.name)}</h2><p class="muted">Seus pr\u00f3ximos treinos, avisos e equipe em um s\u00f3 lugar.</p></div></section>
    ${metrics([
      { label: "Treinos recebidos", value: d.workouts.length, detail: "plano atual" },
      { label: "Pr\u00f3ximos hor\u00e1rios", value: d.events.length, detail: "agenda" },
      { label: "Avisos", value: d.messages.length, detail: "comunica\u00e7\u00e3o" },
      { label: "Equipe", value: d.groups[0]?.name || "Individual", detail: d.student?.sportName || "modalidade" }
    ])}
    <div class="grid cols-2" style="margin-top:16px">
      <article class="card"><h3>Pr\u00f3ximos treinos</h3><div class="list">${d.workouts.slice(0, 3).map((workout) => workoutCard(workout, true)).join("")}</div></article>
      <article class="card"><h3>Avisos</h3><div class="list">${d.messages.map((message) => `<div class="list-item"><div><strong>${escapeHtml(message.title)}</strong><div class="muted">${escapeHtml(message.body)}</div></div></div>`).join("")}</div></article>
    </div>`;
}

function myWorkoutsView() {
  return `<section class="section-head"><div><h2>Meus treinos</h2><p class="muted">Visualize e marque treinos como conclu\u00eddos.</p></div></section><div class="grid cols-2">${state.dashboard.workouts.map((workout) => workoutCard(workout, true)).join("")}</div>`;
}

function profileView() {
  const student = state.dashboard.student;
  return `
    <section class="section-head"><div><h2>Perfil</h2><p class="muted">Informa\u00e7\u00f5es pessoais, modalidade, grupo e objetivo.</p></div></section>
    <article class="card">
      <div class="student-cell">${student.photo ? `<img class="photo" src="${student.photo}" alt="">` : `<span class="photo">${initials(student.name)}</span>`}<div><h2>${escapeHtml(student.name)}</h2><p class="muted">${escapeHtml(student.email)} - ${escapeHtml(student.phone || "")}</p></div></div>
      <div class="grid cols-3" style="margin-top:18px">
        <div><span class="muted">Modalidade</span><h3>${escapeHtml(student.sportName)}</h3></div>
        <div><span class="muted">Grupo/equipe</span><h3>${escapeHtml(student.groupName)}</h3></div>
        <div><span class="muted">Objetivo</span><h3>${escapeHtml(student.goal || "N\u00e3o informado")}</h3></div>
      </div>
    </article>`;
}

function nextDays(total) {
  const formatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
  return Array.from({ length: total }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return { iso: date.toISOString().slice(0, 10), label: formatter.format(date) };
  });
}

function qrCode(text) {
  let seed = [...String(text)].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const cells = Array.from({ length: 441 }, (_, index) => {
    seed = (seed * 9301 + 49297 + index) % 233280;
    const row = Math.floor(index / 21);
    const col = index % 21;
    const finder = (row < 7 && col < 7) || (row < 7 && col > 13) || (row > 13 && col < 7);
    const on = finder ? (row % 6 === 0 || col % 6 === 0 || (row > 1 && row < 5 && col > 1 && col < 5) || (col > 15 && col < 19 && row > 1 && row < 5) || (row > 15 && row < 19 && col > 1 && col < 5)) : seed % 3 === 0;
    return `<span class="${on ? "on" : ""}"></span>`;
  }).join("");
  return `<div class="qr" title="C\u00f3digo de presen\u00e7a ${escapeHtml(text)}">${cells}</div>`;
}

function pdfPreviewModal() {
  const title = state.pdfPreview.title || "Visualizar PDF do Treino";
  const description = state.pdfPreview.description || "Confira a ficha antes de baixar, imprimir ou compartilhar.";
  return `
    <div class="modal">
      <div class="modal-card pdf-modal-card">
        <section class="section-head">
          <div><h2>${escapeHtml(title)}</h2><p class="muted">${escapeHtml(description)}</p></div>
          <button class="btn secondary" data-action="close-pdf">Fechar</button>
        </section>
        <iframe class="pdf-frame" src="${state.pdfPreview.url}" title="Pr\u00e9via do PDF"></iframe>
        <div class="actions" style="margin-top:16px">
          <button class="btn" data-action="download-pdf">Baixar PDF</button>
          <button class="btn secondary" data-action="share-pdf">Compartilhar PDF</button>
          <button class="btn secondary" data-action="print-pdf">Imprimir</button>
        </div>
      </div>
    </div>`;
}

function workoutPdfDetails(workout) {
  const student = workout.targetType === "student" ? state.data.students.find((item) => item.id === workout.targetId) : null;
  const group = workout.targetType === "group" ? state.data.groups.find((item) => item.id === workout.targetId) : null;
  const sportId = student?.sportId || group?.sportId || "";
  return {
    athleteLabel: student ? "Aluno" : "Grupo/Equipe",
    athleteName: student?.name || group?.name || "Destino n\u00e3o informado",
    modality: sportName(sportId),
    trainerName: state.user?.name || "Personal trainer",
    teamName: group?.name || BRAND_FULL,
    date: workout.date ? new Date(`${workout.date}T12:00:00`).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR")
  };
}

function pdfSafe(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E\n]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function pdfEscape(value = "") {
  return pdfSafe(value).replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function dataUrlToJpegImage(dataUrl = "") {
  const match = String(dataUrl).match(/^data:image\/jpe?g;base64,(.+)$/i);
  if (!match) return null;
  const binary = atob(match[1]);
  let hex = "";
  for (let index = 0; index < binary.length; index += 1) {
    hex += binary.charCodeAt(index).toString(16).padStart(2, "0");
  }
  return { hex, width: 512, height: 512 };
}

function wrapPdfText(value, maxChars) {
  const words = pdfSafe(value).split(" ").filter(Boolean);
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function createWorkoutPdf(workout, pdfSettingsOverride = null) {
  const details = workoutPdfDetails(workout);
  const settings = pdfSettingsOverride || currentPdfSettings();
  const logoImage = dataUrlToJpegImage(settings.logo);
  const student = workout.targetType === "student" ? state.data.students.find((item) => item.id === workout.targetId) : null;
  const payments = student ? (state.data.payments || []).filter((payment) => payment.studentId === student.id) : [];
  const activePayment = payments.find((payment) => payment.status === "paid") || payments[0];
  const activePlan = activePayment ? (state.data.financialPlans || []).find((plan) => plan.id === activePayment.planId) : null;
  const accent = settings.primaryColor || "#00C2A8";
  const dark = "#0D1117";
  const headerBlue = "#3DE6C1";
  const pageWidth = 842;
  const pageHeight = 595;
  const pages = [];
  let ops = [];

  const rgb = (hex) => {
    const clean = /^#[0-9a-f]{6}$/i.test(hex) ? hex.replace("#", "") : "00C2A8";
    return [0, 2, 4].map((index) => parseInt(clean.slice(index, index + 2), 16) / 255);
  };
  const setFill = (color) => `${rgb(color).join(" ")} rg`;
  const setStroke = (color) => `${rgb(color).join(" ")} RG`;
  const rect = (x, top, width, height, color) => ops.push(`${setFill(color)} ${x} ${pageHeight - top - height} ${width} ${height} re f`);
  const strokeRect = (x, top, width, height, color = "#111111", widthPt = 1) => ops.push(`${setStroke(color)} ${widthPt} w ${x} ${pageHeight - top - height} ${width} ${height} re S`);
  const text = (value, x, top, size = 11, font = "F1", color = "#111111") => {
    ops.push(`BT /${font} ${size} Tf ${setFill(color)} ${x} ${pageHeight - top} Td (${pdfEscape(value)}) Tj ET`);
  };
  const approxWidth = (value, size) => pdfSafe(value).length * size * 0.52;
  const centerText = (value, x, top, width, size = 10, font = "F1", color = "#111111") => {
    text(value, x + Math.max(2, (width - approxWidth(value, size)) / 2), top, size, font, color);
  };
  const fit = (value, maxChars) => {
    const clean = pdfSafe(value || "-");
    return clean.length > maxChars ? `${clean.slice(0, Math.max(0, maxChars - 3))}...` : clean;
  };
  const age = (birthDate) => {
    if (!birthDate) return "-";
    const birth = new Date(`${birthDate}T12:00:00`);
    if (Number.isNaN(birth.getTime())) return "-";
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) years -= 1;
    return String(years);
  };
  const line = (x1, y1, x2, y2, color = "#111111", widthPt = 1) => {
    ops.push(`${setStroke(color)} ${widthPt} w ${x1} ${pageHeight - y1} m ${x2} ${pageHeight - y2} l S`);
  };
  const drawLogo = (x, top, size) => {
    if (logoImage) {
      ops.push(`q ${size} 0 0 ${size} ${x} ${pageHeight - top - size} cm /Logo Do Q`);
      return;
    }
    rect(x, top, size, size, "#F4F6F5");
    strokeRect(x, top, size, size, "#C8D0CA");
    centerText(initials(settings.displayName || details.trainerName), x, top + size / 2 + 5, size, 16, "F2", accent);
  };
  const drawContactIcon = (type, x, top, color) => {
    rect(x, top, 14, 14, color);
    if (type === "phone") {
      line(x + 4, top + 4, x + 6, top + 9, "#FFFFFF", 1.2);
      line(x + 6, top + 9, x + 11, top + 11, "#FFFFFF", 1.2);
      line(x + 4, top + 4, x + 6, top + 3, "#FFFFFF", 1.2);
      line(x + 11, top + 11, x + 12, top + 9, "#FFFFFF", 1.2);
      return;
    }
    if (type === "instagram") {
      strokeRect(x + 3, top + 3, 8, 8, "#FFFFFF", 1);
      strokeRect(x + 5.5, top + 5.5, 3, 3, "#FFFFFF", 1);
      rect(x + 9, top + 4, 1.4, 1.4, "#FFFFFF");
      return;
    }
    centerText("C", x, top + 10, 14, 8, "F2", "#FFFFFF");
  };
  const drawContactChip = (type, label, value, x, top, width) => {
    rect(x, top, width, 20, "#FFFFFF");
    strokeRect(x, top, width, 20, "#D4D9D6", 0.7);
    drawContactIcon(type, x + 4, top + 3, accent);
    text(`${label}: ${fit(value, Math.max(8, Math.floor((width - 28) / 4)))}`, x + 23, top + 13, 7, "F1", "#1B2520");
  };
  const exercises = workoutExercises(workout);
  const rowsPerPage = 12;
  const totalPages = Math.max(1, Math.ceil(exercises.length / rowsPerPage));
  const field = (label, value, x, y, width, height = 18) => {
    rect(x, y, width, height, "#FFFFFF");
    strokeRect(x, y, width, height, "#111111", 0.8);
    rect(x, y, width, 12, dark);
    centerText(label, x, y + 8, width, 7, "F2", "#FFFFFF");
    centerText(value || "-", x, y + height - 4, width, 8, "F2", "#111111");
  };
  const twoRowField = (labelA, valueA, labelB, valueB, x, y, width, height = 36) => {
    rect(x, y, width, height, "#FFFFFF");
    strokeRect(x, y, width, height, "#111111", 0.8);
    rect(x, y, width, 12, dark);
    centerText(labelA, x, y + 8, width / 2, 7, "F2", "#FFFFFF");
    centerText(labelB, x + width / 2, y + 8, width / 2, 7, "F2", "#FFFFFF");
    line(x + width / 2, y, x + width / 2, y + height, "#111111", 0.8);
    centerText(valueA || "-", x, y + 25, width / 2, 8, "F2", "#111111");
    centerText(valueB || "-", x + width / 2, y + 25, width / 2, 8, "F2", "#111111");
  };
  const drawBase = (pageIndex) => {
    ops = [];
    rect(0, 0, pageWidth, pageHeight, "#FFFFFF");
    rect(220, 14, 402, 96, "#FFFFFF");
    strokeRect(220, 14, 402, 96, "#D6D6D6", 0.7);
    rect(220, 14, 402, 5, accent);
    rect(240, 31, 64, 54, "#F7FAF7");
    strokeRect(240, 31, 64, 54, "#E0E5E1", 0.7);
    drawLogo(247, 35, 42);
    rect(322, 43, 6, 28, accent);
    text(">>", 337, 62, 19, "F2", accent);
    text(fit(settings.displayName || details.teamName || BRAND_FULL, 31), 380, 50, 19, "F2", "#262A2D");
    text(settings.headerSubtitle || "CONSULTORIA ONLINE", 383, 71, 10, "F2", "#47606A");
    line(380, 77, 570, 77, accent, 1.4);
    const contacts = [
      settings.showPhone && settings.phone ? { type: "phone", label: "WhatsApp", value: settings.phone } : null,
      settings.showInstagram && settings.instagram ? { type: "instagram", label: "Instagram", value: settings.instagram } : null,
      settings.showCref && settings.cref ? { type: "cref", label: "CREF", value: settings.cref } : null
    ].filter(Boolean);
    const chipWidths = contacts.map((item) => Math.min(150, Math.max(92, approxWidth(`${item.label}: ${item.value}`, 7) + 34)));
    const totalChipWidth = chipWidths.reduce((sum, width) => sum + width, 0) + Math.max(0, contacts.length - 1) * 8;
    let chipX = 421 - totalChipWidth / 2;
    contacts.forEach((item, index) => {
      drawContactChip(item.type, item.label, item.value, chipX, 90, chipWidths[index]);
      chipX += chipWidths[index] + 8;
    });

    const boxX = 18;
    const boxY = 128;
    const boxW = 806;
    strokeRect(boxX, boxY, boxW, 448, "#111111", 2);
    field("Id", student?.id?.replace(/^s-/, "").slice(0, 6).toUpperCase() || "-", 30, 142, 44, 32);
    field("Data de Inicio", details.date, 668, 142, 108, 32);
    field("Data de Termino", "-", 668, 190, 108, 32);
    field("Preferencia", details.modality || "-", 636, 244, 140, 32);

    const mainX = 96;
    const mainW = 504;
    const cellY = 142;
    rect(mainX, cellY, mainW, 132, "#FFFFFF");
    strokeRect(mainX, cellY, mainW, 132, "#111111", 1);
    rect(mainX, cellY, mainW, 14, dark);
    centerText("Nome", mainX, cellY + 10, 158, 8, "F2", "#FFFFFF");
    centerText("Nascimento", mainX + 158, cellY + 10, 108, 8, "F2", "#FFFFFF");
    centerText("Idade", mainX + 266, cellY + 10, 86, 8, "F2", "#FFFFFF");
    centerText("Genero", mainX + 352, cellY + 10, 86, 8, "F2", "#FFFFFF");
    centerText("Plano", mainX + 438, cellY + 10, 66, 8, "F2", "#FFFFFF");
    [158, 266, 352, 438].forEach((offset) => line(mainX + offset, cellY, mainX + offset, cellY + 34, "#111111", 0.8));
    line(mainX, cellY + 14, mainX + mainW, cellY + 14, "#111111", 0.8);
    centerText(fit(details.athleteName, 25), mainX, cellY + 28, 158, 8, "F2", "#111111");
    centerText(student?.birthDate ? dateBR(student.birthDate) : "-", mainX + 158, cellY + 28, 108, 8, "F2", "#111111");
    centerText(age(student?.birthDate), mainX + 266, cellY + 28, 86, 8, "F2", "#111111");
    centerText(student?.gender || "-", mainX + 352, cellY + 28, 86, 8, "F2", "#111111");
    centerText(fit(activePlan?.name || "-", 12), mainX + 438, cellY + 28, 66, 8, "F2", "#111111");
    twoRowField("Intensidade", "Moderado ativo", "Objetivo", fit(student?.goal || workout.notes || "-", 38), mainX, cellY + 34, mainW, 36);
    field("Observa\u00e7\u00e3o", fit(workout.notes || student?.notes || "-", 62), mainX, cellY + 70, mainW, 36);
    rect(mainX, cellY + 106, mainW, 14, dark);
    centerText("Mesociclo de Treinamento", mainX, cellY + 116, 158, 8, "F2", "#FFFFFF");
    centerText("Semanas", mainX + 158, cellY + 116, 108, 8, "F2", "#FFFFFF");
    centerText("Treino", mainX + 266, cellY + 116, 124, 8, "F2", "#FFFFFF");
    centerText("Frequencia", mainX + 390, cellY + 116, 114, 8, "F2", "#FFFFFF");
    [158, 266, 390].forEach((offset) => line(mainX + offset, cellY + 106, mainX + offset, cellY + 132, "#111111", 0.8));
    line(mainX, cellY + 120, mainX + mainW, cellY + 120, "#111111", 0.8);
    centerText(workout.distance || "-", mainX, cellY + 129, 158, 8, "F2", "#111111");
    centerText("Semana - 1", mainX + 158, cellY + 129, 108, 8, "F2", "#111111");
    centerText(fit(workout.title || "Treino", 18), mainX + 266, cellY + 129, 124, 8, "F2", "#111111");
    centerText(workout.time || "4x semana", mainX + 390, cellY + 129, 114, 8, "F2", "#111111");

    rect(18, 282, 806, 22, dark);
    centerText(`${workout.date ? new Date(`${workout.date}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long" }) : "Treino"}  ( ${workout.title || "Treino"} )`, 18, 298, 806, 15, "F2", "#FFFFFF");
    if (totalPages > 1) text(`Pagina ${pageIndex + 1}/${totalPages}`, 756, 298, 8, "F2", "#FFFFFF");
  };
  const drawTable = (chunk, pageIndex) => {
    const tableX = 18;
    const tableY = 314;
    const rowH = 17;
    const cols = [
      ["Musculos", 98],
      ["Exerc\u00edcios", 204],
      ["S\u00e9ries", 62],
      ["Repeti\u00e7\u00f5es", 78],
      ["Intervalo", 70],
      ["Cadencia", 70],
      ["Carga", 70],
      ["Metodo", 106],
      ["Video", 48]
    ];
    rect(tableX, tableY, 806, rowH, headerBlue);
    strokeRect(tableX, tableY, 806, rowH * (rowsPerPage + 1), "#B9B9B9", 0.8);
    let x = tableX;
    cols.forEach(([label, width]) => {
      centerText(label, x, tableY + 12, width, 8, "F2", "#111111");
      line(x, tableY, x, tableY + rowH * (rowsPerPage + 1), "#B9B9B9", 0.7);
      x += width;
    });
    line(tableX + 806, tableY, tableX + 806, tableY + rowH * (rowsPerPage + 1), "#B9B9B9", 0.7);
    for (let row = 0; row < rowsPerPage; row += 1) {
      const y = tableY + rowH * (row + 1);
      line(tableX, y, tableX + 806, y, "#B9B9B9", 0.7);
      const exercise = chunk[row];
      if (!exercise) continue;
      let cx = tableX;
      const values = [
        exercise.muscle || exercise.group || "-",
        fit(exercise.name || "Exerc\u00edcio", 38),
        exercise.sets || "-",
        exercise.reps || "-",
        exercise.rest || workout.rest || "-",
        exercise.cadence || "",
        exercise.load || "",
        exercise.method || "",
        exercise.video ? "Video" : ""
      ];
      cols.forEach(([, width], index) => {
        centerText(values[index], cx, y + 12, width, index === 1 ? 7 : 8, index === 1 ? "F2" : "F1", index === 8 ? "#006AC7" : "#111111");
        cx += width;
      });
    }
    line(tableX, tableY + rowH * (rowsPerPage + 1), tableX + 806, tableY + rowH * (rowsPerPage + 1), "#B9B9B9", 0.7);
    const obsY = tableY + rowH * (rowsPerPage + 1) + 14;
    rect(tableX, obsY, 806, 22, "#F0F0F0");
    centerText("Observa\u00e7\u00e3o do Professor", tableX, obsY + 16, 806, 15, "F2", "#111111");
    strokeRect(tableX, obsY, 806, 78, "#B9B9B9", 0.8);
    wrapPdfText(workout.notes || "Priorizar tecnica de execucao. Depois carga.", 110).slice(0, 3).forEach((lineText, index) => {
      centerText(lineText, tableX, obsY + 42 + index * 16, 806, 8, "F2", "#111111");
    });
    text(settings.footerText || "Documento gerado automaticamente pelo Relay by Bentus", 24, 574, 7, "F1", "#555555");
  };

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    drawBase(pageIndex);
    drawTable(exercises.slice(pageIndex * rowsPerPage, pageIndex * rowsPerPage + rowsPerPage), pageIndex);
    pages.push(ops.join("\n"));
  }

  const objects = [];
  const addObj = (body) => {
    objects.push(body);
    return objects.length;
  };
  const catalog = addObj("");
  const pagesObj = addObj("");
  const fontRegular = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBold = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const logoObj = logoImage ? addObj(`<< /Type /XObject /Subtype /Image /Width ${logoImage.width} /Height ${logoImage.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${logoImage.hex.length + 2} >>\nstream\n${logoImage.hex}>\nendstream`) : null;
  const pageRefs = [];
  pages.forEach((content) => {
    const contentObj = addObj(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const imageResource = logoObj ? `/XObject << /Logo ${logoObj} 0 R >>` : "";
    const pageObj = addObj(`<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> ${imageResource} >> /Contents ${contentObj} 0 R >>`);
    pageRefs.push(pageObj);
  });
  objects[catalog - 1] = `<< /Type /Catalog /Pages ${pagesObj} 0 R >>`;
  objects[pagesObj - 1] = `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const filename = `${pdfSafe(workout.title || "treino").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "treino"}.pdf`;
  return { blob, filename };
}

function createWorkoutPdf(workout, pdfSettingsOverride = null) {
  const details = workoutPdfDetails(workout);
  const settings = pdfSettingsOverride || currentPdfSettings();
  const logoImage = dataUrlToJpegImage(settings.logo);
  const student = workout.targetType === "student" ? state.data.students.find((item) => item.id === workout.targetId) : null;
  const accent = settings.primaryColor || "#00C2A8";
  const dark = "#07100C";
  const deepGreen = "#0D1117";
  const softGreen = "#E8FFFA";
  const muted = "#A3A8B3";
  const lineColor = "#D8E1E8";
  const pageWidth = 595;
  const pageHeight = 842;
  const pages = [];
  let ops = [];
  let y = 0;

  const rgb = (hex) => {
    const clean = /^#[0-9a-f]{6}$/i.test(hex) ? hex.replace("#", "") : "00C2A8";
    return [0, 2, 4].map((index) => parseInt(clean.slice(index, index + 2), 16) / 255);
  };
  const setFill = (color) => `${rgb(color).join(" ")} rg`;
  const setStroke = (color) => `${rgb(color).join(" ")} RG`;
  const rect = (x, top, width, height, color) => ops.push(`${setFill(color)} ${x} ${pageHeight - top - height} ${width} ${height} re f`);
  const strokeRect = (x, top, width, height, color = lineColor, widthPt = 0.8) => ops.push(`${setStroke(color)} ${widthPt} w ${x} ${pageHeight - top - height} ${width} ${height} re S`);
  const text = (value, x, top, size = 11, font = "F1", color = dark) => {
    ops.push(`BT /${font} ${size} Tf ${setFill(color)} ${x} ${pageHeight - top} Td (${pdfEscape(value)}) Tj ET`);
  };
  const approxWidth = (value, size) => pdfSafe(value).length * size * 0.52;
  const centerText = (value, x, top, width, size = 10, font = "F1", color = dark) => {
    text(value, x + Math.max(2, (width - approxWidth(value, size)) / 2), top, size, font, color);
  };
  const fit = (value, maxChars) => {
    const clean = pdfSafe(value || "-");
    return clean.length > maxChars ? `${clean.slice(0, Math.max(0, maxChars - 3))}...` : clean;
  };
  const line = (x1, y1, x2, y2, color = lineColor, widthPt = 0.8) => {
    ops.push(`${setStroke(color)} ${widthPt} w ${x1} ${pageHeight - y1} m ${x2} ${pageHeight - y2} l S`);
  };
  const pill = (value, x, top, width, color = softGreen, textColor = deepGreen) => {
    rect(x, top, width, 22, color);
    strokeRect(x, top, width, 22, lineColor, 0.6);
    centerText(value, x, top + 14, width, 8, "F2", textColor);
  };
  const drawLogo = (x, top, size) => {
    if (logoImage) {
      ops.push(`q ${size} 0 0 ${size} ${x} ${pageHeight - top - size} cm /Logo Do Q`);
      return;
    }
    rect(x, top, size, size, softGreen);
    strokeRect(x, top, size, size, lineColor, 0.8);
    centerText(initials(settings.displayName || details.trainerName), x, top + size / 2 + 6, size, 16, "F2", accent);
  };
  const drawContactIcon = (type, x, top, color) => {
    if (type === "phone") {
      line(x + 4, top + 4, x + 6, top + 10, color, 1.4);
      line(x + 6, top + 10, x + 12, top + 12, color, 1.4);
      line(x + 4, top + 4, x + 6, top + 3, color, 1.4);
      line(x + 12, top + 12, x + 13, top + 9, color, 1.4);
      return;
    }
    if (type === "instagram") {
      strokeRect(x + 3.5, top + 3.5, 8, 8, color, 1);
      strokeRect(x + 6, top + 6, 3, 3, color, 1);
      rect(x + 10, top + 4.5, 1.2, 1.2, color);
      return;
    }
    centerText("C", x, top + 10.5, 15, 8, "F2", color);
  };
  const drawContact = (type, label, value, x, top) => {
    drawContactIcon(type, x, top - 11, accent);
    text(`${label}: ${fit(value, 28)}`, x + 21, top, 8, "F1", "#D4E7DA");
  };

  const startPage = (first = false) => {
    if (ops.length) pages.push(ops.join("\n"));
    ops = [];
    rect(0, 0, pageWidth, pageHeight, "#FFFFFF");
    rect(0, 0, pageWidth, 122, dark);
    rect(0, 120, pageWidth, 5, accent);
    drawLogo(42, 32, 60);
    text(fit(settings.displayName || details.teamName || BRAND_FULL, 31), 120, 48, 18, "F2", "#FFFFFF");
    text(settings.headerSubtitle || "Ficha profissional de treino", 120, 70, 9, "F1", "#D4E7DA");
    const contacts = [
      settings.showPhone && settings.phone ? ["phone", "WhatsApp", settings.phone] : null,
      settings.showInstagram && settings.instagram ? ["instagram", "Instagram", settings.instagram] : null,
      settings.showCref && settings.cref ? ["cref", "CREF", settings.cref] : null
    ].filter(Boolean);
    let contactX = 120;
    contacts.forEach(([type, label, value]) => {
      drawContact(type, label, value, contactX, 98);
      contactX += Math.min(150, Math.max(112, approxWidth(`${label}: ${value}`, 8) + 34));
    });
    pill("TREINO", 436, 40, 86, accent, "#FFFFFF");
    text(fit(workout.title || "Treino", 18), 400, 85, 18, "F2", "#FFFFFF");
    y = first ? 158 : 154;
  };
  const ensureSpace = (height) => {
    if (y + height > 770) startPage(false);
  };
  const infoCard = (label, value, x, top, width) => {
    rect(x, top, width, 62, "#FFFFFF");
    strokeRect(x, top, width, 62, lineColor, 0.8);
    rect(x, top, 5, 62, accent);
    text(label, x + 18, top + 22, 8, "F2", muted);
    wrapPdfText(value || "-", Math.max(14, Math.floor(width / 5.8))).slice(0, 2).forEach((lineText, index) => {
      text(lineText, x + 18, top + 42 + index * 12, index ? 9 : 11, "F2", dark);
    });
  };
  const metric = (label, value, x, top, width) => {
    rect(x, top, width, 44, softGreen);
    strokeRect(x, top, width, 44, "#D7EADC", 0.7);
    text(label, x + 14, top + 17, 7, "F2", muted);
    text(value || "-", x + 14, top + 34, 12, "F2", deepGreen);
  };
  const drawExerciseCard = (exercise, index) => {
    const nameLines = wrapPdfText(exercise.name || "Exerc\u00edcio n\u00e3o informado", 48).slice(0, 2);
    const noteLines = wrapPdfText(exercise.notes || exercise.observation || "", 60).slice(0, 2).filter(Boolean);
    const height = 108 + Math.max(0, nameLines.length - 1) * 13 + noteLines.length * 12;
    ensureSpace(height + 14);
    rect(42, y, 511, height, "#FFFFFF");
    strokeRect(42, y, 511, height, lineColor, 0.8);
    rect(42, y, 7, height, accent);
    rect(62, y + 22, 38, 30, softGreen);
    centerText(String(index + 1).padStart(2, "0"), 62, y + 42, 38, 13, "F2", accent);
    nameLines.forEach((lineText, lineIndex) => text(lineText, 116, y + 30 + lineIndex * 14, 15, "F2", dark));
    const metricY = y + 62 + Math.max(0, nameLines.length - 1) * 13;
    metric("SERIES", exercise.sets || "-", 116, metricY, 92);
    metric("REPETICOES", exercise.reps || "-", 220, metricY, 108);
    metric("DESCANSO", exercise.rest || workout.rest || "-", 340, metricY, 116);
    if (noteLines.length) {
      text("Observa\u00e7\u00f5es", 116, metricY + 62, 8, "F2", muted);
      noteLines.forEach((lineText, lineIndex) => text(lineText, 116, metricY + 78 + lineIndex * 12, 9, "F1", "#38483F"));
    }
    y += height + 14;
  };

  const exercises = workoutExercises(workout);
  startPage(true);
  text("Dados do aluno", 42, y, 16, "F2", dark);
  y += 16;
  infoCard("ALUNO", details.athleteName, 42, y, 160);
  infoCard("OBJETIVO", student?.goal || workout.notes || "N\u00e3o informado", 218, y, 176);
  infoCard("MODALIDADE", details.modality, 410, y, 143);
  y += 78;
  infoCard("FREQUENCIA", workout.time || "Conforme orientacao", 42, y, 160);
  infoCard("DATA DO TREINO", details.date, 218, y, 160);
  infoCard("PERSONAL", details.trainerName, 394, y, 159);
  y += 92;
  text("Exerc\u00edcios", 42, y, 17, "F2", dark);
  text(`${exercises.length} itens no treino`, 438, y, 9, "F1", muted);
  y += 18;
  exercises.forEach(drawExerciseCard);

  if (workout.notes) {
    ensureSpace(92);
    rect(42, y + 4, 511, 74, softGreen);
    strokeRect(42, y + 4, 511, 74, "#D7EADC", 0.7);
    text("Observa\u00e7\u00f5es do professor", 62, y + 28, 12, "F2", deepGreen);
    wrapPdfText(workout.notes, 72).slice(0, 3).forEach((lineText, index) => text(lineText, 62, y + 48 + index * 12, 9, "F1", "#38483F"));
    y += 94;
  }
  ensureSpace(48);
  line(42, y, 553, y, lineColor, 0.8);
  text(settings.footerText || "Documento gerado automaticamente pelo Relay by Bentus", 42, y + 22, 8, "F1", muted);
  pages.push(ops.join("\n"));

  const objects = [];
  const addObj = (body) => {
    objects.push(body);
    return objects.length;
  };
  const catalog = addObj("");
  const pagesObj = addObj("");
  const fontRegular = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBold = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const logoObj = logoImage ? addObj(`<< /Type /XObject /Subtype /Image /Width ${logoImage.width} /Height ${logoImage.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${logoImage.hex.length + 2} >>\nstream\n${logoImage.hex}>\nendstream`) : null;
  const pageRefs = [];
  pages.forEach((content) => {
    const contentObj = addObj(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const imageResource = logoObj ? `/XObject << /Logo ${logoObj} 0 R >>` : "";
    const pageObj = addObj(`<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> ${imageResource} >> /Contents ${contentObj} 0 R >>`);
    pageRefs.push(pageObj);
  });
  objects[catalog - 1] = `<< /Type /Catalog /Pages ${pagesObj} 0 R >>`;
  objects[pagesObj - 1] = `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const filename = `${pdfSafe(workout.title || "treino").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "treino"}.pdf`;
  return { blob, filename };
}

function openWorkoutPdf(workoutId) {
  const workout = state.data.workouts.find((item) => item.id === workoutId);
  if (!workout) return toast("Treino n\u00e3o encontrado.");
  if (state.pdfPreview?.url) URL.revokeObjectURL(state.pdfPreview.url);
  normalizePdfLogo(currentPdfSettings()).then((settings) => {
    const pdf = createWorkoutPdf(workout, settings);
    state.pdfPreview = { ...pdf, url: URL.createObjectURL(pdf.blob) };
    render();
  }).catch((error) => toast(error.message));
}

function createNutritionPdf(plan, pdfSettingsOverride = null) {
  const settings = pdfSettingsOverride || currentPdfSettings();
  const logoImage = dataUrlToJpegImage(settings.logo);
  const student = state.data.students.find((item) => item.id === plan.studentId);
  const accent = settings.primaryColor || "#00C2A8";
  const dark = "#07100C";
  const softGreen = "#E8FFFA";
  const muted = "#A3A8B3";
  const lineColor = "#D8E1E8";
  const pageWidth = 595;
  const pageHeight = 842;
  const pages = [];
  let ops = [];
  let y = 0;

  const rgb = (hex) => {
    const clean = /^#[0-9a-f]{6}$/i.test(hex) ? hex.replace("#", "") : "00C2A8";
    return [0, 2, 4].map((index) => parseInt(clean.slice(index, index + 2), 16) / 255);
  };
  const setFill = (color) => `${rgb(color).join(" ")} rg`;
  const setStroke = (color) => `${rgb(color).join(" ")} RG`;
  const rect = (x, top, width, height, color) => ops.push(`${setFill(color)} ${x} ${pageHeight - top - height} ${width} ${height} re f`);
  const strokeRect = (x, top, width, height, color = lineColor, widthPt = 0.8) => ops.push(`${setStroke(color)} ${widthPt} w ${x} ${pageHeight - top - height} ${width} ${height} re S`);
  const text = (value, x, top, size = 11, font = "F1", color = dark) => ops.push(`BT /${font} ${size} Tf ${setFill(color)} ${x} ${pageHeight - top} Td (${pdfEscape(value)}) Tj ET`);
  const approxWidth = (value, size) => pdfSafe(value).length * size * 0.52;
  const centerText = (value, x, top, width, size = 10, font = "F1", color = dark) => text(value, x + Math.max(2, (width - approxWidth(value, size)) / 2), top, size, font, color);
  const fit = (value, maxChars) => {
    const clean = pdfSafe(value || "-");
    return clean.length > maxChars ? `${clean.slice(0, Math.max(0, maxChars - 3))}...` : clean;
  };
  const line = (x1, y1, x2, y2, color = lineColor, widthPt = 0.8) => ops.push(`${setStroke(color)} ${widthPt} w ${x1} ${pageHeight - y1} m ${x2} ${pageHeight - y2} l S`);
  const drawLogo = (x, top, size) => {
    if (logoImage) {
      ops.push(`q ${size} 0 0 ${size} ${x} ${pageHeight - top - size} cm /Logo Do Q`);
      return;
    }
    rect(x, top, size, size, softGreen);
    strokeRect(x, top, size, size, lineColor, 0.8);
    centerText(initials(settings.displayName || state.user?.name), x, top + size / 2 + 6, size, 16, "F2", accent);
  };
  const startPage = () => {
    if (ops.length) pages.push(ops.join("\n"));
    ops = [];
    rect(0, 0, pageWidth, pageHeight, "#FFFFFF");
    rect(0, 0, pageWidth, 120, dark);
    rect(0, 118, pageWidth, 5, accent);
    drawLogo(42, 30, 60);
    text(fit(settings.displayName || state.user?.name || BRAND_FULL, 32), 120, 48, 18, "F2", "#FFFFFF");
    text(settings.headerSubtitle || "Plano alimentar profissional", 120, 70, 9, "F1", "#D4E7DA");
    text("PLANO", 414, 50, 18, "F2", "#FFFFFF");
    text("ALIMENTAR", 394, 72, 18, "F2", "#FFFFFF");
    text(`Data: ${dateBR(plan.createdDate || todayISO())}`, 394, 98, 9, "F1", "#D4E7DA");
    y = 154;
  };
  const ensureSpace = (height) => {
    if (y + height > 780) startPage();
  };
  const infoCard = (label, value, x, top, width) => {
    rect(x, top, width, 58, "#FFFFFF");
    strokeRect(x, top, width, 58, lineColor, 0.8);
    rect(x, top, 5, 58, accent);
    text(label, x + 16, top + 21, 8, "F2", muted);
    wrapPdfText(value || "-", Math.max(14, Math.floor(width / 5.8))).slice(0, 2).forEach((lineText, index) => text(lineText, x + 16, top + 39 + index * 11, index ? 8 : 11, "F2", dark));
  };
  const drawMeal = (meal) => {
    const foodLines = wrapPdfText(meal.foods || "Alimentos n\u00e3o informados", 74).slice(0, 4);
    const noteLines = wrapPdfText(meal.notes || "", 74).slice(0, 3).filter(Boolean);
    const foodTop = 106;
    const lastFoodBaseline = foodTop + Math.max(0, foodLines.length - 1) * 12;
    const notesLabelTop = lastFoodBaseline + 24;
    const lastNoteBaseline = noteLines.length ? notesLabelTop + 15 + (noteLines.length - 1) * 12 : lastFoodBaseline;
    const height = Math.max(132, lastNoteBaseline + 20);
    ensureSpace(height + 12);
    rect(42, y, 511, height, "#FFFFFF");
    strokeRect(42, y, 511, height, lineColor, 0.8);
    rect(42, y, 8, height, accent);
    text(`${String(meal.order || "").padStart(2, "0")} - ${meal.label}`, 64, y + 28, 15, "F2", dark);
    rect(446, y + 14, 82, 26, softGreen);
    strokeRect(446, y + 14, 82, 26, "#D7EADC", 0.6);
    centerText(meal.time || "--:--", 446, y + 31, 82, 11, "F2", accent);
    rect(64, y + 46, 464, 30, softGreen);
    strokeRect(64, y + 46, 464, 30, "#D7EADC", 0.6);
    text("Quantidade", 76, y + 55, 7, "F2", muted);
    text(fit(meal.quantity || "-", 76), 76, y + 69, 9, "F2", dark);
    line(64, y + 88, 528, y + 88, lineColor, 0.7);
    text("Alimentos", 64, y + 92, 8, "F2", muted);
    foodLines.forEach((lineText, index) => text(lineText, 64, y + foodTop + index * 12, 9, "F1", "#38483F"));
    if (noteLines.length) {
      const noteY = y + notesLabelTop;
      line(64, noteY - 12, 528, noteY - 12, lineColor, 0.7);
      text("Observa\u00e7\u00f5es", 64, noteY, 8, "F2", muted);
      noteLines.forEach((lineText, index) => text(lineText, 64, noteY + 15 + index * 12, 8, "F1", "#38483F"));
    }
    y += height + 12;
  };

  const meals = nutritionPlanMeals(plan).filter((meal) => meal.time || meal.foods || meal.quantity || meal.notes);
  startPage();
  text("Dados do plano", 42, y, 16, "F2", dark);
  y += 16;
  infoCard("ALUNO", student?.name || "Aluno n\u00e3o encontrado", 42, y, 160);
  infoCard("OBJETIVO", plan.objective || "N\u00e3o informado", 218, y, 160);
  infoCard("PERSONAL", state.user?.name || "Personal trainer", 394, y, 159);
  y += 82;
  if (plan.notes) {
    rect(42, y, 511, 72, softGreen);
    strokeRect(42, y, 511, 72, "#D7EADC", 0.7);
    text("Observa\u00e7\u00f5es gerais", 62, y + 25, 12, "F2", dark);
    wrapPdfText(plan.notes, 78).slice(0, 3).forEach((lineText, index) => text(lineText, 62, y + 45 + index * 12, 9, "F1", "#38483F"));
    y += 92;
  }
  text("Refeicoes", 42, y, 17, "F2", dark);
  text(`${meals.length} refei\u00e7\u00f5es preenchidas`, 410, y, 9, "F1", muted);
  y += 18;
  (meals.length ? meals : nutritionPlanMeals(plan)).forEach(drawMeal);
  ensureSpace(28);
  line(42, y, 553, y, lineColor, 0.8);
  text(settings.footerText || "Documento gerado automaticamente pelo Relay by Bentus", 42, y + 22, 8, "F1", muted);
  pages.push(ops.join("\n"));

  const objects = [];
  const addObj = (body) => {
    objects.push(body);
    return objects.length;
  };
  const catalog = addObj("");
  const pagesObj = addObj("");
  const fontRegular = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBold = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const logoObj = logoImage ? addObj(`<< /Type /XObject /Subtype /Image /Width ${logoImage.width} /Height ${logoImage.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${logoImage.hex.length + 2} >>\nstream\n${logoImage.hex}>\nendstream`) : null;
  const pageRefs = [];
  pages.forEach((content) => {
    const contentObj = addObj(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const imageResource = logoObj ? `/XObject << /Logo ${logoObj} 0 R >>` : "";
    const pageObj = addObj(`<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> ${imageResource} >> /Contents ${contentObj} 0 R >>`);
    pageRefs.push(pageObj);
  });
  objects[catalog - 1] = `<< /Type /Catalog /Pages ${pagesObj} 0 R >>`;
  objects[pagesObj - 1] = `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`;
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => pdf += `${String(offset).padStart(10, "0")} 00000 n \n`);
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const filename = `plano-alimentar-${pdfSafe(student?.name || "aluno").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "aluno"}.pdf`;
  return { blob: new Blob([pdf], { type: "application/pdf" }), filename };
}

function openNutritionPdf(planId, shareAfterOpen = false) {
  const plan = (state.data.nutritionPlans || []).find((item) => item.id === planId);
  if (!plan) return toast("Plano alimentar n\u00e3o encontrado.");
  if (state.pdfPreview?.url) URL.revokeObjectURL(state.pdfPreview.url);
  normalizePdfLogo(currentPdfSettings()).then((settings) => {
    const pdf = createNutritionPdf(plan, settings);
    state.pdfPreview = {
      ...pdf,
      title: "Visualizar PDF do Plano Alimentar",
      description: "Confira o plano alimentar antes de baixar, imprimir ou compartilhar.",
      shareTitle: "Plano alimentar em PDF",
      shareText: "Plano alimentar gerado pelo Relay by Bentus.",
      url: URL.createObjectURL(pdf.blob)
    };
    render();
    if (shareAfterOpen) setTimeout(() => shareCurrentPdf().catch((error) => toast(error.message)), 150);
  }).catch((error) => toast(error.message));
}

function downloadCurrentPdf() {
  if (!state.pdfPreview) return;
  const link = document.createElement("a");
  link.href = state.pdfPreview.url;
  link.download = state.pdfPreview.filename;
  link.click();
}

async function shareCurrentPdf() {
  if (!state.pdfPreview) return;
  const file = new File([state.pdfPreview.blob], state.pdfPreview.filename, { type: "application/pdf" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title: state.pdfPreview.shareTitle || `PDF ${BRAND_FULL}`, text: state.pdfPreview.shareText || `Documento gerado pelo ${BRAND_FULL}.`, files: [file] });
    return;
  }
  downloadCurrentPdf();
  toast("Compartilhamento direto indispon\u00edvel neste navegador. O PDF foi baixado para enviar pelo WhatsApp.");
}

function printCurrentPdf() {
  if (!state.pdfPreview) return;
  document.querySelector(".pdf-frame")?.contentWindow?.print();
}

function createSimplePdf(title, lines) {
  const pageWidth = 595;
  const pageHeight = 842;
  const esc = (value) => pdfEscape(value);
  const ops = [
    "0.968 0.98 0.968 rg 0 0 595 842 re f",
    "0.027 0.063 0.047 rg 0 742 595 100 re f",
    "0.714 1 0.302 rg 0 734 595 8 re f",
    `BT /F2 22 Tf 0.714 1 0.302 rg 42 790 Td (${esc(title)}) Tj ET`,
    `BT /F1 10 Tf 1 1 1 rg 42 764 Td (${esc(`${BRAND_FULL} - Relat\u00f3rio financeiro`)}) Tj ET`
  ];
  let y = 700;
  lines.forEach((line) => {
    if (y < 60) return;
    ops.push(`BT /F1 11 Tf 0.06 0.09 0.07 rg 42 ${y} Td (${esc(line)}) Tj ET`);
    y -= 20;
  });
  const content = ops.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [5 0 R] /Count 1 >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 6 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => pdf += `${String(offset).padStart(10, "0")} 00000 n \n`);
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function openFinancePdf() {
  const summary = financeSummary(state.data.payments || []);
  const lines = [
    `Personal: ${state.user.name}`,
    `M\u00eas: ${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
    `Faturamento previsto: ${brl(summary.monthTotal)}`,
    `Recebido: ${brl(summary.received)}`,
    `Pendente: ${brl(summary.pending)}`,
    `Alunos pagantes: ${summary.payingStudents}`,
    `Alunos inadimplentes: ${summary.overdueStudents}`,
    "",
    "Pagamentos:",
    ...(state.data.payments || []).slice(0, 24).map((payment) => `${studentName(payment.studentId)} | ${planName(payment.planId)} | ${brl(payment.amount)} | ${dateBR(payment.dueDate)} | ${paymentStatusLabel(paymentStatus(payment))}`)
  ];
  if (state.pdfPreview?.url) URL.revokeObjectURL(state.pdfPreview.url);
  const blob = createSimplePdf("Relat\u00f3rio Financeiro", lines);
  state.pdfPreview = { blob, filename: `relatorio-financeiro-${todayISO()}.pdf`, url: URL.createObjectURL(blob) };
  render();
}

function modal() {
  const { type, item } = state.editing;
  const title = item ? "Editar" : "Adicionar";
  const sportsOptions = state.data.sports.map((sport) => `<option value="${sport.id}">${escapeHtml(sport.name)}</option>`).join("");
  const studentsChecks = state.data.students.map((student) => `<label class="check"><input type="checkbox" name="studentIds" value="${student.id}" ${(item?.studentIds || []).includes(student.id) ? "checked" : ""}> ${escapeHtml(student.name)}</label>`).join("");
  const targetOptions = `
    <optgroup label="Alunos">${state.data.students.map((student) => `<option value="student:${student.id}">${escapeHtml(student.name)}</option>`).join("")}</optgroup>
    <optgroup label="Grupos">${state.data.groups.map((group) => `<option value="group:${group.id}">${escapeHtml(group.name)}</option>`).join("")}</optgroup>`;
  const planOptions = (state.data.financialPlans || []).map((plan) => `<option value="${plan.id}">${escapeHtml(plan.name)}</option>`).join("");
  const studentOptions = state.data.students.map((student) => `<option value="${student.id}">${escapeHtml(student.name)}</option>`).join("");
  const assessmentStudentId = item?.studentId || state.editing.studentId || state.data.students[0]?.id || "";
  const currentTarget = item?.targetType ? `${item.targetType}:${item.targetId}` : "";
  const nutritionOrderOptions = (selected) => Array.from({ length: nutritionMeals.length }, (_, index) => {
    const value = String(index + 1);
    return `<option value="${value}" ${String(selected || "") === value ? "selected" : ""}>${value}</option>`;
  }).join("");
  const nutritionMealFields = nutritionMeals.map(([key, label], index) => `
    <div class="nutrition-meal-form span-2">
      <h4>${escapeHtml(label)}</h4>
      <div class="form-grid">
        <label class="field"><span>Ordem no plano</span><select name="${key}Order">${nutritionOrderOptions(item?.meals?.[key]?.order || index + 1)}</select></label>
        <label class="field"><span>Hor\u00e1rio</span><input type="time" name="${key}Time" value="${escapeHtml(item?.meals?.[key]?.time || "")}"></label>
        <label class="field"><span>Quantidade</span><input name="${key}Quantity" value="${escapeHtml(item?.meals?.[key]?.quantity || "")}" placeholder="Ex: 2 ovos, 120g, 1 unidade"></label>
        <label class="field span-2"><span>Alimentos</span><textarea name="${key}Foods" placeholder="Liste os alimentos desta refei\u00e7\u00e3o">${escapeHtml(item?.meals?.[key]?.foods || "")}</textarea></label>
        <label class="field span-2"><span>Observa\u00e7\u00f5es</span><textarea name="${key}Notes" placeholder="Ajustes, substitui\u00e7\u00f5es ou preparo">${escapeHtml(item?.meals?.[key]?.notes || "")}</textarea></label>
      </div>
    </div>`).join("");
  const forms = {
    student: `
      <label class="field"><span>Foto do aluno</span><input type="file" name="photoFile" accept="image/*"></label>
      <label class="field"><span>Nome completo</span><input name="name" required value="${escapeHtml(item?.name || "")}"></label>
      <label class="field"><span>Data de nascimento</span><input type="date" name="birthDate" value="${item?.birthDate || ""}"></label>
      <label class="field"><span>Telefone</span><input name="phone" value="${escapeHtml(item?.phone || "")}"></label>
      <label class="field"><span>E-mail</span><input type="email" name="email" value="${escapeHtml(item?.email || "")}"></label>
      <label class="field"><span>Modalidade esportiva</span><select name="sportId">${sportsOptions}</select></label>
      <label class="field span-2"><span>Objetivo</span><input name="goal" value="${escapeHtml(item?.goal || "")}"></label>
      <label class="field span-2"><span>Observa\u00e7\u00f5es</span><textarea name="notes">${escapeHtml(item?.notes || "")}</textarea></label>`,
    sport: `
      <label class="field"><span>Nome da modalidade</span><input name="name" required value="${escapeHtml(item?.name || "")}"></label>
      <label class="field"><span>Cor de destaque</span><input type="color" name="color" value="${item?.color || "#00C2A8"}"></label>`,
    group: `
      <label class="field"><span>Nome do grupo/time</span><input name="name" required value="${escapeHtml(item?.name || "")}"></label>
      <label class="field"><span>Modalidade</span><select name="sportId">${sportsOptions}</select></label>
      <label class="field"><span>Hor\u00e1rios</span><input name="schedule" value="${escapeHtml(item?.schedule || "")}"></label>
      <label class="field"><span>Local de treino</span><input name="location" value="${escapeHtml(item?.location || "")}"></label>
      <div class="field span-2"><span>Alunos</span><div class="grid cols-2">${studentsChecks}</div></div>`,
    workout: `
      <label class="field"><span>T\u00edtulo</span><input name="title" required value="${escapeHtml(item?.title || "")}"></label>
      <label class="field"><span>Enviar para</span><select name="target">${targetOptions}</select></label>
      <label class="field"><span>Data</span><input type="date" name="date" value="${item?.date || todayISO()}"></label>
      <label class="field"><span>Tempo</span><input name="time" value="${escapeHtml(item?.time || "")}"></label>
      <label class="field"><span>Descanso</span><input name="rest" placeholder="60 segundos entre s\u00e9ries" value="${escapeHtml(item?.rest || "")}"></label>
      <div class="field span-2"><span>Exerc\u00edcios</span><div class="exercise-builder" id="exerciseBuilder">${exerciseRows(item)}</div><button class="btn secondary" type="button" data-action="add-exercise">Adicionar exerc\u00edcio</button></div>
      <label class="field"><span>Dist\u00e2ncia</span><input name="distance" value="${escapeHtml(item?.distance || "")}"></label>
      <label class="field span-2"><span>Observa\u00e7\u00f5es</span><textarea name="notes">${escapeHtml(item?.notes || "")}</textarea></label>`,
    event: `
      <label class="field"><span>T\u00edtulo</span><input name="title" required></label>
      <label class="field"><span>Tipo</span><input name="type" value="Treino"></label>
      <label class="field"><span>Data</span><input type="date" name="date" value="${todayISO()}"></label>
      <label class="field"><span>Hor\u00e1rio</span><input type="time" name="time"></label>
      <label class="field"><span>Local</span><input name="location"></label>
      <label class="field"><span>Grupo</span><select name="groupId"><option value="">Sem grupo</option>${state.data.groups.map((group) => `<option value="${group.id}">${escapeHtml(group.name)}</option>`).join("")}</select></label>`,
    message: `
      <label class="field"><span>T\u00edtulo</span><input name="title" required value="${escapeHtml(item?.title || "")}"></label>
      <label class="field"><span>Destino</span><select name="target"><option value="all:">Todos</option>${targetOptions}</select></label>
      <label class="field span-2"><span>Mensagem</span><textarea name="body">${escapeHtml(item?.body || "")}</textarea></label>`,
    financialPlan: `
      <label class="field"><span>Nome do plano</span><input name="name" required value="${escapeHtml(item?.name || "")}" placeholder="Plano Academia Individual"></label>
      <label class="field"><span>Valor mensal</span><input name="monthlyValue" required inputmode="decimal" value="${escapeHtml(item?.monthlyValue || "")}" placeholder="250,00"></label>
      <label class="field"><span>Modalidade</span><select name="sportId">${sportsOptions}</select></label>
      <label class="field"><span>Status</span><select name="status"><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label>
      <label class="field span-2"><span>Descri\u00e7\u00e3o</span><textarea name="description">${escapeHtml(item?.description || "")}</textarea></label>`,
    payment: `
      <label class="field"><span>Aluno</span><select name="studentId" required>${studentOptions}</select></label>
      <label class="field"><span>Plano</span><select name="planId" required>${planOptions}</select></label>
      <label class="field"><span>Valor</span><input name="amount" required inputmode="decimal" value="${escapeHtml(item?.amount || "")}" placeholder="180,00"></label>
      <label class="field"><span>Vencimento</span><input type="date" name="dueDate" required value="${item?.dueDate || todayISO()}"></label>
      <label class="field"><span>Data de pagamento</span><input type="date" name="paidDate" value="${item?.paidDate || ""}"></label>
      <label class="field"><span>Status</span><select name="status"><option value="pending">Pendente</option><option value="paid">Pago</option><option value="overdue">Atrasado</option></select></label>
      <label class="field span-2"><span>Observa\u00e7\u00f5es</span><textarea name="notes">${escapeHtml(item?.notes || "")}</textarea></label>`,
    nutritionPlan: `
      <label class="field"><span>Nome do aluno</span><select name="studentId" required>${studentOptions}</select></label>
      <label class="field"><span>Objetivo</span><input name="objective" required value="${escapeHtml(item?.objective || "")}" placeholder="Emagrecimento, ganho de massa, performance"></label>
      <label class="field"><span>Data de cria\u00e7\u00e3o</span><input type="date" name="createdDate" value="${item?.createdDate || todayISO()}"></label>
      <label class="field span-2"><span>Observa\u00e7\u00f5es gerais</span><textarea name="notes" placeholder="Prefer\u00eancias, restri\u00e7\u00f5es, estrat\u00e9gia geral">${escapeHtml(item?.notes || "")}</textarea></label>
      ${nutritionMealFields}`,
    physicalAssessment: `
      <label class="field"><span>Aluno</span><select name="studentId" required>${studentOptions}</select></label>
      <label class="field"><span>Data da avalia\u00e7\u00e3o</span><input type="date" name="assessmentDate" required value="${item?.assessmentDate || todayISO()}"></label>
      <label class="field"><span>Peso (kg)</span><input name="weight" inputmode="decimal" value="${escapeHtml(item?.weight || "")}" placeholder="78,5"></label>
      <label class="field"><span>Altura (cm)</span><input name="height" inputmode="decimal" value="${escapeHtml(item?.height || "")}" placeholder="178"></label>
      <label class="field"><span>IMC</span><input name="imc" inputmode="decimal" value="${escapeHtml(item?.imc || "")}" placeholder="Calculado automaticamente"></label>
      <label class="field"><span>Percentual de gordura (%)</span><input name="bodyFat" inputmode="decimal" value="${escapeHtml(item?.bodyFat || "")}" placeholder="18"></label>
      <label class="field"><span>Massa muscular (kg)</span><input name="muscleMass" inputmode="decimal" value="${escapeHtml(item?.muscleMass || "")}" placeholder="34"></label>
      <label class="field"><span>Circ. abdominal (cm)</span><input name="waist" inputmode="decimal" value="${escapeHtml(item?.waist || "")}" placeholder="86"></label>
      <label class="field"><span>Circ. bra\u00e7o (cm)</span><input name="arm" inputmode="decimal" value="${escapeHtml(item?.arm || "")}" placeholder="34"></label>
      <label class="field"><span>Circ. perna (cm)</span><input name="leg" inputmode="decimal" value="${escapeHtml(item?.leg || "")}" placeholder="58"></label>
      <label class="field"><span>Circ. quadril (cm)</span><input name="hip" inputmode="decimal" value="${escapeHtml(item?.hip || "")}" placeholder="96"></label>
      <label class="field span-2"><span>Objetivo do aluno</span><input name="goal" value="${escapeHtml(item?.goal || state.data.students.find((student) => student.id === assessmentStudentId)?.goal || "")}"></label>
      <label class="field span-2"><span>Observa\u00e7\u00f5es do personal</span><textarea name="notes">${escapeHtml(item?.notes || "")}</textarea></label>`
  };
  setTimeout(() => {
    const form = document.querySelector("#entityForm");
    if (!form) return;
    if (item?.sportId) form.sportId && (form.sportId.value = item.sportId);
    if (currentTarget) form.target && (form.target.value = currentTarget);
    if (item?.status) form.status && (form.status.value = item.status);
    if (item?.studentId) form.studentId && (form.studentId.value = item.studentId);
    if (!item?.studentId && assessmentStudentId) form.studentId && (form.studentId.value = assessmentStudentId);
    if (item?.planId) form.planId && (form.planId.value = item.planId);
  });
  return `
    <div class="modal" data-close="true">
      <div class="modal-card">
        <section class="section-head"><div><h2>${title} ${labelFor(type)}</h2><p class="muted">As altera\u00e7\u00f5es s\u00e3o salvas no banco local.</p></div><button class="btn secondary" data-action="close">Fechar</button></section>
        <form class="form" id="entityForm" data-type="${type}" autocomplete="off">
          <div class="form-grid">${forms[type]}</div>
          <div class="actions" style="margin-top:16px"><button class="btn" type="submit">Salvar</button><button class="btn secondary" type="button" data-action="close">Cancelar</button></div>
        </form>
      </div>
    </div>`;
}

function labelFor(type) {
  if (type === "nutritionPlan") return "plano alimentar";
  return ({ student: "aluno", sport: "modalidade", group: "grupo", workout: "treino", event: "evento", message: "aviso", financialPlan: "plano", payment: "pagamento", physicalAssessment: "avalia\u00e7\u00e3o f\u00edsica" })[type] || "registro";
}

async function saveEntity(form) {
  const type = form.dataset.type;
  const data = Object.fromEntries(new FormData(form).entries());
  if (type === "student") {
    const file = form.photoFile.files[0];
    if (file) data.photo = await fileToBase64(file);
    else if (state.editing.item?.photo) data.photo = state.editing.item.photo;
    delete data.photoFile;
    data.status = "active";
  }
  if (type === "group") data.studentIds = [...form.querySelectorAll("input[name='studentIds']:checked")].map((input) => input.value);
  if (type === "workout") {
    const names = new FormData(form).getAll("exerciseName");
    const sets = new FormData(form).getAll("exerciseSets");
    const reps = new FormData(form).getAll("exerciseReps");
    const rests = new FormData(form).getAll("exerciseRest");
    data.exercises = names.map((name, index) => ({
      name: String(name || "").trim(),
      sets: String(sets[index] || "").trim(),
      reps: String(reps[index] || "").trim(),
      rest: String(rests[index] || "").trim()
    })).filter((exercise) => exercise.name);
    data.exercise = data.exercises.map((exercise) => exercise.name).join("\n");
    data.sets = "";
    data.reps = "";
    delete data.exerciseName;
    delete data.exerciseSets;
    delete data.exerciseReps;
    delete data.exerciseRest;
  }
  if (type === "financialPlan") {
    data.monthlyValue = parseMoney(data.monthlyValue);
  }
  if (type === "payment") {
    data.amount = parseMoney(data.amount);
    if (data.status === "paid" && !data.paidDate) data.paidDate = todayISO();
  }
  if (type === "nutritionPlan") {
    data.meals = {};
    nutritionMeals.forEach(([key]) => {
      data.meals[key] = {
        order: Number(data[`${key}Order`] || 99),
        time: String(data[`${key}Time`] || "").trim(),
        foods: String(data[`${key}Foods`] || "").trim(),
        quantity: String(data[`${key}Quantity`] || "").trim(),
        notes: String(data[`${key}Notes`] || "").trim()
      };
      delete data[`${key}Order`];
      delete data[`${key}Time`];
      delete data[`${key}Foods`];
      delete data[`${key}Quantity`];
      delete data[`${key}Notes`];
    });
    data.createdDate = data.createdDate || todayISO();
  }
  if (type === "physicalAssessment") {
    updateAssessmentImc(form);
    const refreshed = Object.fromEntries(new FormData(form).entries());
    Object.assign(data, refreshed);
    ["weight", "height", "imc", "bodyFat", "muscleMass", "waist", "arm", "leg", "hip"].forEach((key) => {
      data[key] = String(data[key] || "").replace(",", ".");
    });
    data.imc = data.imc || calculateImc(data.weight, data.height);
  }
  if (["workout", "message"].includes(type)) {
    const [targetType, targetId] = data.target.split(":");
    data.targetType = targetType;
    data.targetId = targetId;
    delete data.target;
  }
  const endpoint = { student: "students", sport: "sports", group: "groups", workout: "workouts", event: "events", message: "messages", financialPlan: "financialPlans", payment: "payments", nutritionPlan: "nutritionPlans", physicalAssessment: "physicalAssessments" }[type];
  const editingId = state.editing.item?.id;
  await api(editingId ? `${endpoint}/${editingId}` : endpoint, { method: editingId ? "PUT" : "POST", body: JSON.stringify(data) });
  state.editing = null;
  await loadAll();
  toast("Registro salvo com sucesso.");
  render();
}

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function logoFileToJpegDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!/^image\/(png|jpe?g)$/i.test(file.type)) {
      reject(new Error("Envie uma logo em PNG, JPG ou JPEG."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const size = 512;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        const padding = 46;
        const scale = Math.min((size - padding * 2) / image.width, (size - padding * 2) / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        ctx.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      image.onerror = () => reject(new Error("N\u00e3o foi poss\u00edvel ler a logo enviada."));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error("N\u00e3o foi poss\u00edvel carregar a logo."));
    reader.readAsDataURL(file);
  });
}

function imageDataUrlToJpegDataUrl(dataUrl = "") {
  return new Promise((resolve, reject) => {
    const value = String(dataUrl || "");
    if (!value) {
      resolve("");
      return;
    }
    if (/^data:image\/jpe?g;base64,/i.test(value)) {
      resolve(value);
      return;
    }
    if (!/^data:image\/(png|svg\+xml);base64,/i.test(value)) {
      resolve("");
      return;
    }
    const image = new Image();
    image.onload = () => {
      const size = 512;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      const padding = 46;
      const scale = Math.min((size - padding * 2) / image.width, (size - padding * 2) / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      ctx.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    image.onerror = () => reject(new Error("N\u00e3o foi poss\u00edvel preparar a logo para o PDF."));
    image.src = value;
  });
}

async function normalizePdfLogo(settings) {
  const logo = await imageDataUrlToJpegDataUrl(settings.logo || "");
  return { ...settings, logo };
}

async function savePdfSettings(settings) {
  const existingId = state.data.pdfSettings?.id;
  const saved = await api(existingId ? `pdfSettings/${existingId}` : "pdfSettings", {
    method: existingId ? "PUT" : "POST",
    body: JSON.stringify(settings)
  });
  state.data.pdfSettings = saved;
  await loadAll();
}

function currentContent() {
  if (state.user.role === "student") {
    return {
      dashboard: studentDashboard,
      "my-workouts": myWorkoutsView,
      "student-schedule": () => scheduleView(true),
      profile: profileView
    }[state.view]?.() || studentDashboard();
  }
  return {
    dashboard: trainerDashboard,
    students: studentsView,
    sports: sportsView,
    groups: groupsView,
    workouts: workoutsView,
    nutrition: nutritionView,
    schedule: () => scheduleView(false),
    finance: financeView,
    settings: settingsView
  }[state.view]?.() || trainerDashboard();
}

async function render() {
  if (!state.token || !state.user) return authScreen();
  try {
    if (!state.data || !state.dashboard) await loadAll();
    layout(currentContent());
  } catch (error) {
    toast(error.message);
    logout();
  }
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.auth) {
    state.authMode = button.dataset.auth;
    return render();
  }
  if (button.dataset.role) {
    state.roleChoice = button.dataset.role;
    return render();
  }
  if (button.dataset.view) {
    state.view = button.dataset.view;
    state.sidebarOpen = false;
    if (state.view !== "students") state.selectedAssessmentStudentId = "";
    return render();
  }
  if (button.dataset.action === "logout") return logout();
  if (button.dataset.action === "menu") {
    state.sidebarOpen = !state.sidebarOpen;
    return render();
  }
  if (button.dataset.action === "close-menu") {
    state.sidebarOpen = false;
    return render();
  }
  if (button.dataset.action === "close") {
    state.editing = null;
    return render();
  }
  if (button.dataset.action === "close-assessment") {
    state.selectedAssessmentStudentId = "";
    return render();
  }
  if (button.dataset.action === "add-exercise") {
    document.querySelector("#exerciseBuilder")?.insertAdjacentHTML("beforeend", exerciseRow({}, document.querySelectorAll("[data-exercise-row]").length));
    return;
  }
  if (button.dataset.action === "remove-exercise") {
    button.closest("[data-exercise-row]")?.remove();
    return;
  }
  if (button.dataset.action === "close-pdf") {
    if (state.pdfPreview?.url) URL.revokeObjectURL(state.pdfPreview.url);
    state.pdfPreview = null;
    return render();
  }
  if (button.dataset.action === "download-pdf") return downloadCurrentPdf();
  if (button.dataset.action === "share-pdf") return shareCurrentPdf().catch((error) => toast(error.message));
  if (button.dataset.action === "print-pdf") return printCurrentPdf();
  if (button.dataset.action === "remove-logo") {
    const current = currentPdfSettings();
    await savePdfSettings({ ...current, logo: "" });
    toast("Logo removida.");
    return render();
  }
  if (button.dataset.modal) {
    state.editing = { type: button.dataset.modal, item: null };
    return render();
  }
  if (button.dataset.assessmentStudent) {
    state.selectedAssessmentStudentId = button.dataset.assessmentStudent;
    return render();
  }
  if (button.dataset.modalAssessment) {
    state.editing = { type: "physicalAssessment", item: null, studentId: button.dataset.modalAssessment };
    return render();
  }
  if (button.dataset.pdf) return openWorkoutPdf(button.dataset.pdf);
  if (button.dataset.nutritionPdf) return openNutritionPdf(button.dataset.nutritionPdf);
  if (button.dataset.nutritionShare) return openNutritionPdf(button.dataset.nutritionShare, true);
  if (button.dataset.paid) {
    const payment = state.data.payments.find((item) => item.id === button.dataset.paid);
    if (!payment) return;
    await api(`payments/${payment.id}`, { method: "PUT", body: JSON.stringify({ ...payment, status: "paid", paidDate: todayISO() }) });
    await loadAll();
    toast("Pagamento marcado como pago.");
    return render();
  }
  if (button.dataset.action === "finance-pdf") return openFinancePdf();
  if (button.dataset.edit) {
    const [type, itemId] = button.dataset.edit.split(":");
    const collection = { student: "students", sport: "sports", group: "groups", workout: "workouts", message: "messages", financialPlan: "financialPlans", payment: "payments", nutritionPlan: "nutritionPlans", physicalAssessment: "physicalAssessments" }[type];
    state.editing = { type, item: state.data[collection].find((item) => item.id === itemId) };
    return render();
  }
  if (button.dataset.delete) {
    const [collection, itemId] = button.dataset.delete.split(":");
    if (!confirm("Remover este registro?")) return;
    await api(`${collection}/${itemId}`, { method: "DELETE" });
    await loadAll();
    toast("Registro removido.");
    return render();
  }
  if (button.dataset.complete) {
    await api("complete-workout", { method: "POST", body: JSON.stringify({ workoutId: button.dataset.complete }) });
    await loadAll();
    toast("Treino marcado como conclu\u00eddo.");
    return render();
  }
});

document.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  try {
    if (form.id === "authForm") {
      const body = Object.fromEntries(new FormData(form).entries());
      body.role = state.roleChoice;
      if (state.authMode === "register") {
        await api("register", { method: "POST", body: JSON.stringify(body) });
        state.authMode = "login";
        toast("Conta criada. Fa\u00e7a login para continuar.");
        return render();
      }
      const payload = await api("login", { method: "POST", body: JSON.stringify(body) });
      setSession(payload);
      state.view = "dashboard";
      state.data = null;
      state.dashboard = null;
      toast("Login realizado com sucesso.");
      return render();
    }
    if (form.id === "pdfSettingsForm") {
      const data = Object.fromEntries(new FormData(form).entries());
      const file = form.logoFile.files[0];
      data.logo = file ? await logoFileToJpegDataUrl(file) : data.logo;
      data.showPhone = Boolean(form.showPhone?.checked);
      data.showInstagram = Boolean(form.showInstagram?.checked);
      data.showCref = Boolean(form.showCref?.checked);
      delete data.logoFile;
      await savePdfSettings(data);
      toast("Personaliza\u00e7\u00e3o do PDF salva.");
      return render();
    }
    if (form.id === "entityForm") return saveEntity(form);
  } catch (error) {
    toast(error.message);
  }
});

document.addEventListener("input", (event) => {
  if (event.target.dataset.financeFilter) {
    state.financeFilters[event.target.dataset.financeFilter] = event.target.value;
    return render();
  }
  if (event.target.dataset.nutritionFilter) {
    state.nutritionFilters[event.target.dataset.nutritionFilter] = event.target.value;
    return render();
  }
  const form = event.target.closest("#entityForm");
  if (!form) return;
  if (form.dataset.type === "physicalAssessment" && ["weight", "height"].includes(event.target.name)) {
    updateAssessmentImc(form);
  }
  localStorage.setItem("sportflow_draft", JSON.stringify(Object.fromEntries(new FormData(form).entries())));
});

document.addEventListener("change", (event) => {
  if (event.target.name === "logoFile") {
    const form = event.target.closest("#pdfSettingsForm");
    const file = event.target.files?.[0];
    if (!form || !file) return;
    logoFileToJpegDataUrl(file).then((logo) => {
      form.logo.value = logo;
      state.data.pdfSettings = {
        ...currentPdfSettings(),
        ...Object.fromEntries(new FormData(form).entries()),
        logo,
        showPhone: Boolean(form.showPhone?.checked),
        showInstagram: Boolean(form.showInstagram?.checked),
        showCref: Boolean(form.showCref?.checked)
      };
      render();
    }).catch((error) => toast(error.message));
    return;
  }
  if (event.target.dataset.financeFilter) {
    state.financeFilters[event.target.dataset.financeFilter] = event.target.value;
    render();
  }
  if (event.target.dataset.nutritionFilter) {
    state.nutritionFilters[event.target.dataset.nutritionFilter] = event.target.value;
    render();
  }
});

render();




