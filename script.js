let currentUser = null;
let currentTurma = null;
let turmas = JSON.parse(localStorage.getItem('turmas')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [
    { email: 'emanuel@gmail.com', password: '123456' }
];

// Save users to localStorage
localStorage.setItem('users', JSON.stringify(users));

// ===== AUTHENTICATION =====
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMainApp();
    } else {
        showLoginError('Falha no login. Verifique suas credenciais.');
    }
}

function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function logout() {
    currentUser = null;
    currentTurma = null;
    localStorage.removeItem('currentUser');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainContainer').classList.remove('active');
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('emailInput').value = '';
    document.getElementById('passwordInput').value = '';
    document.getElementById('loginError').classList.remove('show');
}

// ===== UI MANAGEMENT =====
function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainContainer').classList.add('active');
    document.getElementById('logoutBtn').style.display = 'block';
    renderTurmas();
}

function renderTurmas() {
    const turmasList = document.getElementById('turmasList');
    turmasList.innerHTML = '';

    if (turmas.length === 0) {
        turmasList.innerHTML = '<p style="color: #999; text-align: center;">Nenhuma turma cadastrada</p>';
        return;
    }

    turmas.forEach((turma, index) => {
        const div = document.createElement('div');
        div.className = 'turma-item' + (currentTurma === index ? ' active' : '');
        div.innerHTML = `
            <div class="turma-item-title">${turma.name}</div>
            <div class="turma-item-actions">
                <button class="btn-small btn-delete" onclick="deleteTurma(${index})">Excluir</button>
                <button class="btn-small btn-view" onclick="selectTurma(${index})">Visualizar</button>
            </div>
        `;
        turmasList.appendChild(div);
    });
}

function selectTurma(index) {
    currentTurma = index;
    renderTurmas();
    renderAtividades();
    document.getElementById('emptyState').classList.remove('active');
    document.getElementById('turmaContent').classList.add('active');
    document.getElementById('turmaTitle').textContent = `Turma: ${turmas[index].name}`;
}

function renderAtividades() {
    const atividadesList = document.getElementById('atividadesList');
    atividadesList.innerHTML = '';

    const turma = turmas[currentTurma];
    if (!turma.atividades || turma.atividades.length === 0) {
        atividadesList.innerHTML = '<p style="color: #999;">Nenhuma atividade cadastrada</p>';
        return;
    }

    turma.atividades.forEach((atividade, index) => {
        const div = document.createElement('div');
        div.className = 'atividade-item';
        div.innerHTML = `
            <div class="atividade-item-title">${index + 1}. ${atividade}</div>
        `;
        atividadesList.appendChild(div);
    });
}

// ===== TURMA MODAL =====
function openNewTurmaModal() {
    document.getElementById('newTurmaModal').classList.add('show');
    document.getElementById('turmaNameInput').value = '';
    document.getElementById('turmaNameInput').focus();
}

function closeNewTurmaModal() {
    document.getElementById('newTurmaModal').classList.remove('show');
}

function saveTurma() {
    const name = document.getElementById('turmaNameInput').value.trim();

    if (!name) {
        showError('Por favor, informe o nome da turma.');
        return;
    }

    turmas.push({ name: name, atividades: [] });
    localStorage.setItem('turmas', JSON.stringify(turmas));
    closeNewTurmaModal();
    renderTurmas();
}

function deleteTurma(index) {
    if (confirm(`Tem certeza que deseja excluir a turma "${turmas[index].name}"?`)) {
        turmas.splice(index, 1);
        localStorage.setItem('turmas', JSON.stringify(turmas));
        if (currentTurma === index) {
            currentTurma = null;
            document.getElementById('emptyState').classList.add('active');
            document.getElementById('turmaContent').classList.remove('active');
        }
        renderTurmas();
    }
}

// ===== ATIVIDADE MODAL =====
function openNewAtividadeModal() {
    if (currentTurma === null) {
        showError('Por favor, selecione uma turma primeiro.');
        return;
    }
    document.getElementById('newAtividadeModal').classList.add('show');
    document.getElementById('atividadeDescInput').value = '';
    document.getElementById('atividadeDescInput').focus();
}

function closeNewAtividadeModal() {
    document.getElementById('newAtividadeModal').classList.remove('show');
}

function saveAtividade() {
    const desc = document.getElementById('atividadeDescInput').value.trim();

    if (!desc) {
        showError('Por favor, informe a descrição da atividade.');
        return;
    }

    if (currentTurma !== null) {
        if (!turmas[currentTurma].atividades) {
            turmas[currentTurma].atividades = [];
        }
        turmas[currentTurma].atividades.push(desc);
        localStorage.setItem('turmas', JSON.stringify(turmas));
        closeNewAtividadeModal();
        renderAtividades();
    }
}

// ===== ERROR MODAL =====
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorModal').classList.add('show');
}

function closeErrorModal() {
    document.getElementById('errorModal').classList.remove('show');
}

// ===== INITIALIZATION =====
function init() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const newTurmaModal = document.getElementById('newTurmaModal');
    const newAtividadeModal = document.getElementById('newAtividadeModal');
    const errorModal = document.getElementById('errorModal');

    if (event.target === newTurmaModal) {
        closeNewTurmaModal();
    }
    if (event.target === newAtividadeModal) {
        closeNewAtividadeModal();
    }
    if (event.target === errorModal) {
        closeErrorModal();
    }
}

// Allow Enter key to submit forms
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const newTurmaModal = document.getElementById('newTurmaModal');
        const newAtividadeModal = document.getElementById('newAtividadeModal');

        if (newTurmaModal.classList.contains('show')) {
            saveTurma();
        } else if (newAtividadeModal.classList.contains('show')) {
            saveAtividade();
        }
    }
});

// Initialize app
init();