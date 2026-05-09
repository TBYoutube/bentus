# SportFlow Pro

Sistema web moderno para personal trainers, assessorias esportivas e equipes de treino. A aplicação possui login por perfil, painel do personal, área do aluno, agenda, treinos, grupos, modalidades, comunicação, ranking, histórico, upload de fotos, toasts, QR Code visual de presença e banco local persistente.

## Estrutura

```text
backend/
  server.js          API HTTP, autenticação, CRUDs e servidor estático
database/
  db.json            Banco de dados local em JSON
frontend/
  index.html         Entrada da SPA
  styles.css         Design responsivo em tema escuro premium
  app.js             Interface, rotas, formulários e consumo da API
package.json         Scripts do projeto
```

## Como Executar

Instale o Node.js 18 ou superior e rode:

```bash
npm start
```

Depois acesse:

```text
http://localhost:3000
```

Contas de demonstração:

```text
Personal Trainer
E-mail: personal@demo.com
Senha: 123456

Aluno
E-mail: aluno@demo.com
Senha: 123456
```

## Como Configurar o Banco de Dados

O banco funcional fica em `database/db.json`. Ele é persistido automaticamente sempre que você cria, edita ou remove alunos, grupos, modalidades, treinos, eventos e mensagens.

Para começar do zero, edite o arquivo e limpe as listas desejadas, mantendo a estrutura principal:

```json
{
  "users": [],
  "sports": [],
  "students": [],
  "groups": [],
  "workouts": [],
  "events": [],
  "messages": [],
  "attendance": [],
  "performance": [],
  "permissions": {}
}
```

Em produção, o próximo passo natural é trocar o `db.json` por SQLite, PostgreSQL ou MySQL mantendo os mesmos contratos da API.

## Como Adicionar Novos Esportes

Pelo sistema:

1. Entre como Personal Trainer.
2. Abra `Modalidades`.
3. Clique em `Nova modalidade`.
4. Informe nome e cor de destaque.
5. Salve.

Pelo banco:

```json
{ "id": "sp-8", "name": "Natação", "color": "#7df9ff" }
```

Depois disso, a nova modalidade aparece nos cadastros de alunos e grupos.

## Como Criar Novas Permissões Futuramente

As permissões ficam em `database/db.json`, na chave `permissions`:

```json
{
  "trainer": ["manage_students", "manage_workouts"],
  "student": ["view_workouts"]
}
```

Para criar um novo perfil, adicione uma role em `permissions`, registre usuários com essa role e ajuste as regras em `backend/server.js`, principalmente no bloco que valida acesso antes dos CRUDs. Uma evolução recomendada é criar um middleware `can(permission)` para centralizar essa validação.

## Como Transformar em Aplicativo Mobile

O frontend já é responsivo e funciona bem em celular. Para virar aplicativo:

1. Transforme a interface em PWA adicionando manifest, service worker e ícones.
2. Empacote com Capacitor ou Cordova para Android e iOS.
3. Troque sessões em memória por tokens JWT persistentes.
4. Mova imagens para armazenamento próprio, como S3, Cloudflare R2 ou Firebase Storage.
5. Use um banco real, como PostgreSQL, Supabase ou Firebase.
6. Adicione notificações push para avisos, treinos e mudanças de agenda.

## Funcionalidades Implementadas

- Login e cadastro para Personal Trainer e Aluno.
- Separação multi-personal: cada personal enxerga apenas seus alunos, grupos, treinos, eventos, mensagens e relatórios.
- Dashboard do personal com alunos, grupos, próximos treinos, agenda e estatísticas.
- CRUD de alunos com upload de foto.
- CRUD de modalidades esportivas.
- CRUD de grupos/equipes com alunos, modalidade, horários e local.
- Criação e envio de treinos para aluno ou grupo, com séries, repetições e descanso individuais por exercício.
- Geração de PDF profissional do treino com prévia, download, impressão e compartilhamento quando suportado pelo navegador.
- Agenda com calendário simples.
- Comunicação com avisos rápidos.
- Área do aluno com treinos, agenda, avisos, grupo e perfil.
- Área financeira exclusiva do personal com planos, pagamentos, filtros, alertas, gráficos simples e relatório PDF.
- Marcação de treino como concluído.
- Ranking de desempenho e histórico.
- QR Code visual de presença por evento.
- Toasts de confirmação.
- Salvamento automático de rascunho local dos formulários.
- Tema escuro e layout responsivo.

## Como Funciona Com Vários Personais

Cada registro criado pelo personal recebe um `trainerId`, que aponta para o usuário dono daquele dado. Alunos também possuem `trainerIds`, permitindo que um aluno seja vinculado a um ou mais personais no futuro.

Exemplo:

```json
{
  "id": "s-123",
  "name": "Aluno Exemplo",
  "trainerId": "u-trainer",
  "trainerIds": ["u-trainer"]
}
```

Quando um personal entra, a API filtra alunos, grupos, treinos, eventos, mensagens, presença e ranking pelo `trainerId` dele. Quando um aluno entra, a API mostra apenas treinos, grupos, agenda e avisos dos personais aos quais ele está vinculado.
