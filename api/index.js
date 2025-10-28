const express = require('express');
const cors = require('cors');
const { Low, JSONFile } = require('lowdb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'db.json');
const adapter = new JSONFile(DB_FILE);
const db = new Low(adapter);

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const PORT = process.env.PORT || 3000;

async function initDb() {
  await db.read();
  db.data = db.data || { professors: [], turmas: [], atividades: [] };

  // Seed professor caso não exista
  if (db.data.professors.length === 0) {
    const passwordHash = bcrypt.hashSync('senha123', 10);
    db.data.professors.push({
      id: nanoid(),
      username: 'professor',
      name: 'Professor Seed',
      password: passwordHash
    });
    await db.write();
    console.log('Usuário seed criado -> username: professor, password: senha123');
  }
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token ausente' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token mal formatado' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

// Autenticação
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  await db.read();
  const prof = db.data.professors.find(p => p.username === username);
  if (!prof) return res.status(401).json({ message: 'Usuário ou senha inválidos' });
  const match = bcrypt.compareSync(password, prof.password);
  if (!match) return res.status(401).json({ message: 'Usuário ou senha inválidos' });

  const token = jwt.sign({ id: prof.id, username: prof.username }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, professor: { id: prof.id, username: prof.username, name: prof.name } });
});

// Turmas
app.get('/turmas', authMiddleware, async (req, res) => {
  await db.read();
  const turmas = db.data.turmas.filter(t => t.professorId === req.user.id);
  res.json(turmas);
});

app.post('/turmas', authMiddleware, async (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ message: 'nome é obrigatório' });
  await db.read();
  const turma = { id: nanoid(), nome, professorId: req.user.id, createdAt: new Date().toISOString() };
  db.data.turmas.push(turma);
  await db.write();
  res.status(201).json(turma);
});

app.delete('/turmas/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  await db.read();
  const turmaIndex = db.data.turmas.findIndex(t => t.id === id && t.professorId === req.user.id);
  if (turmaIndex === -1) return res.status(404).json({ message: 'Turma não encontrada' });

  // remover atividades associadas
  db.data.atividades = db.data.atividades.filter(a => a.turmaId !== id);
  const deleted = db.data.turmas.splice(turmaIndex, 1);
  await db.write();
  res.json({ message: 'Turma removida', turma: deleted[0] });
});

// Atividades
app.get('/turmas/:id/atividades', authMiddleware, async (req, res) => {
  const turmaId = req.params.id;
  await db.read();
  const turma = db.data.turmas.find(t => t.id === turmaId && t.professorId === req.user.id);
  if (!turma) return res.status(404).json({ message: 'Turma não encontrada' });
  const atividades = db.data.atividades.filter(a => a.turmaId === turmaId);
  res.json(atividades);
});

app.post('/turmas/:id/atividades', authMiddleware, async (req, res) => {
  const turmaId = req.params.id;
  const { titulo, descricao, data } = req.body;
  if (!titulo) return res.status(400).json({ message: 'titulo é obrigatório' });
  await db.read();
  const turma = db.data.turmas.find(t => t.id === turmaId && t.professorId === req.user.id);
  if (!turma) return res.status(404).json({ message: 'Turma não encontrada' });
  const atividade = {
    id: nanoid(),
    turmaId,
    titulo,
    descricao: descricao || '',
    data: data || new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  db.data.atividades.push(atividade);
  await db.write();
  res.status(201).json(atividade);
});

app.delete('/atividades/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  await db.read();
  const idx = db.data.atividades.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Atividade não encontrada' });
  const atividade = db.data.atividades[idx];
  // verificar propriedade da turma
  const turma = db.data.turmas.find(t => t.id === atividade.turmaId && t.professorId === req.user.id);
  if (!turma) return res.status(403).json({ message: 'Sem permissão para remover esta atividade' });
  db.data.atividades.splice(idx, 1);
  await db.write();
  res.json({ message: 'Atividade removida' });
});

// inicializa DB e inicia servidor
initDb().then(() => {
  app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
}).catch(err => {
  console.error('Erro ao iniciar DB', err);
  process.exit(1);
});