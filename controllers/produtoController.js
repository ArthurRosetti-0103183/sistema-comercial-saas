/**
 * Controller: Produtos
 * CRUD com controle de estoque e alertas
 */
const Produto = require('../models/produto');

exports.list = (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const result = Produto.getAll(search, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar produtos: ' + err.message });
  }
};

exports.listSimple = (req, res) => {
  try {
    res.json(Produto.getAllSimple());
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar produtos: ' + err.message });
  }
};

exports.getById = (req, res) => {
  try {
    const produto = Produto.getById(req.params.id);
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(produto);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produto: ' + err.message });
  }
};

exports.create = (req, res) => {
  try {
    const { nome, preco_venda } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome do produto é obrigatório' });
    if (!preco_venda || preco_venda <= 0) return res.status(400).json({ error: 'Preço de venda deve ser maior que zero' });
    const produto = Produto.create(req.body);
    res.status(201).json(produto);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Código do produto já existe' });
    }
    res.status(500).json({ error: 'Erro ao criar produto: ' + err.message });
  }
};

exports.update = (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome do produto é obrigatório' });
    const produto = Produto.update(req.params.id, req.body);
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(produto);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Código do produto já existe' });
    }
    res.status(500).json({ error: 'Erro ao atualizar produto: ' + err.message });
  }
};

exports.delete = (req, res) => {
  try {
    const result = Produto.delete(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ message: 'Produto excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir produto: ' + err.message });
  }
};

exports.lowStock = (req, res) => {
  try {
    res.json(Produto.getLowStock());
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos: ' + err.message });
  }
};

exports.outOfStock = (req, res) => {
  try {
    res.json(Produto.getOutOfStock());
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos: ' + err.message });
  }
};
