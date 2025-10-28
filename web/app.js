const USERNAME_VALIDO = "professor";
const SENHA_VALIDA = "senha123";

const loginDiv = document.getElementById("loginDiv");
const appDiv = document.getElementById("appDiv");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginMsg = document.getElementById("loginMsg");
const professorName = document.getElementById("professorName");

const novaTurmaNome = document.getElementById("novaTurmaNome");
const criarTurmaBtn = document.getElementById("criarTurmaBtn");
const turmasList = document.getElementById("turmasList");

// Carrega turmas do localStorage ou cria array vazio
let turmas = JSON.parse(localStorage.getItem("turmas")) || [];

// Login
loginBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === USERNAME_VALIDO && password === SENHA_VALIDA) {
    localStorage.setItem("usuario", JSON.stringify({ username }));
    mostrarApp();
  } else {
    loginMsg.textContent = "Usuário ou senha incorretos!";
  }
});

// Mostrar app
function mostrarApp() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario) {
    loginDiv.classList.add("hidden");
    appDiv.classList.remove("hidden");
    professorName.textContent = "Bem-vindo, " + usuario.username + "!";
    renderizarTurmas();
  }
}

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("usuario");
  window.location.reload();
});

// Criar turma
criarTurmaBtn.addEventListener("click", () => {
  const nome = novaTurmaNome.value.trim();
  if (!nome) return alert("Digite um nome válido para a turma!");

  const novaTurma = { id: Date.now(), nome, atividades: [] };
  turmas.push(novaTurma);
  localStorage.setItem("turmas", JSON.stringify(turmas));
  renderizarTurmas();
  novaTurmaNome.value = "";
});

// Renderizar turmas
function renderizarTurmas() {
  turmasList.innerHTML = "";
  turmas.forEach(turma => {
    const div = document.createElement("div");
    div.className = "turma";
    div.innerHTML = `<strong>${turma.nome}</strong>
                     <div class="atividade">Nenhuma atividade cadastrada</div>`;
    
    div.addEventListener("click", () => {
      localStorage.setItem("turmaSelecionada", JSON.stringify(turma));
      window.location.href = "turma.html";
    });

    turmasList.appendChild(div);
  });
}

// Verifica login ao carregar
window.onload = () => {
  if (localStorage.getItem("usuario")) mostrarApp();
};
