/**
 * Controller: Clientes
 * CRUD completo de clientes
 */
const Cliente = require('../models/cliente');

exports.list = (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const result = Cliente.getAll(search, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar clientes: ' + err.message });
  }
};

exports.listSimple = (req, res) => {
  try {
    res.json(Cliente.getAllSimple());
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar clientes: ' + err.message });
  }
};

exports.getById = (req, res) => {
  try {
    const cliente = Cliente.getById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar cliente: ' + err.message });
  }
};

exports.create = (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
    const cliente = Cliente.create(req.body);
    res.status(201).json(cliente);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar cliente: ' + err.message });
  }
};

exports.update = (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
    const cliente = Cliente.update(req.params.id, req.body);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar cliente: ' + err.message });
  }
};

exports.delete = (req, res) => {
  try {
    const result = Cliente.delete(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir cliente: ' + err.message });
  }
};
