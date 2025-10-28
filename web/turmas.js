// Recupera a turma selecionada e todas as turmas
let turma = JSON.parse(localStorage.getItem("turmaSelecionada"));
let turmas = JSON.parse(localStorage.getItem("turmas")) || [];

// Elementos da página
const nomeTurma = document.getElementById("nomeTurma");
const novaAtividade = document.getElementById("novaAtividade");
const adicionarAtividadeBtn = document.getElementById("adicionarAtividadeBtn");
const atividadesList = document.getElementById("atividadesList");
const voltarBtn = document.getElementById("voltarBtn");

// Exibe o nome da turma
if (turma) {
  nomeTurma.textContent = turma.nome;
  renderizarAtividades();
} else {
  nomeTurma.textContent = "Turma não encontrada";
  atividadesList.textContent = "Volte para o painel principal.";
}

// Adicionar atividade
adicionarAtividadeBtn.addEventListener("click", () => {
  const texto = novaAtividade.value.trim();
  if (!texto) return alert("Digite uma atividade!");

  // Adiciona a atividade na turma selecionada
  turma.atividades.push(texto);

  // Atualiza array geral de turmas
  const index = turmas.findIndex(t => t.id === turma.id);
  if (index !== -1) turmas[index] = turma;

  // Salva no localStorage
  localStorage.setItem("turmas", JSON.stringify(turmas));
  localStorage.setItem("turmaSelecionada", JSON.stringify(turma));

  // Limpa input e renderiza novamente
  novaAtividade.value = "";
  renderizarAtividades();
});

// Renderiza atividades
function renderizarAtividades() {
  atividadesList.innerHTML = "";
  if (turma.atividades.length === 0) {
    atividadesList.textContent = "Nenhuma atividade cadastrada.";
  } else {
    turma.atividades.forEach((atividade, i) => {
      const div = document.createElement("div");
      div.textContent = `${i + 1}. ${atividade}`;
      atividadesList.appendChild(div);
    });
  }
}

// Voltar para painel
voltarBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});
