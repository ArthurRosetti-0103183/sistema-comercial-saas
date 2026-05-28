/**
 * Controller: Usuários
 * CRUD completo de usuários do sistema
 */
const Usuario = require('../models/usuario');

exports.list = (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const result = Usuario.getAll(search, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar usuários: ' + err.message });
  }
};

exports.getById = (req, res) => {
  try {
    const user = Usuario.getById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário: ' + err.message });
  }
};

exports.create = (req, res) => {
  try {
    const { nome, usuario, senha, tipo } = req.body;
    if (!nome || !usuario || !senha) {
      return res.status(400).json({ error: 'Nome, usuário e senha são obrigatórios' });
    }
    // Verifica se usuário já existe
    const existing = Usuario.findByUsername(usuario);
    if (existing) {
      return res.status(400).json({ error: 'Nome de usuário já existe' });
    }
    const user = Usuario.create({ nome, usuario, senha, tipo });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar usuário: ' + err.message });
  }
};

exports.update = (req, res) => {
  try {
    const { nome, usuario, senha, tipo } = req.body;
    if (!nome || !usuario) {
      return res.status(400).json({ error: 'Nome e usuário são obrigatórios' });
    }
    const user = Usuario.update(req.params.id, { nome, usuario, senha, tipo });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário: ' + err.message });
  }
};

exports.delete = (req, res) => {
  try {
    if (parseInt(req.params.id) === req.userId) {
      return res.status(400).json({ error: 'Você não pode excluir seu próprio usuário' });
    }
    const result = Usuario.delete(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir usuário: ' + err.message });
  }
};
