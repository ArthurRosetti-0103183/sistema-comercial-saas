/**
 * Controller: Vendas
 * Criação e listagem de vendas com baixa automática de estoque
 */
const Venda = require('../models/venda');

exports.create = (req, res) => {
  try {
    const { cliente_id, itens, valor_pago } = req.body;
    if (!itens || !itens.length) {
      return res.status(400).json({ error: 'A venda deve conter pelo menos um item' });
    }

    // Calcula total
    let total = 0;
    for (const item of itens) {
      if (!item.produto_id || !item.quantidade || item.quantidade <= 0) {
        return res.status(400).json({ error: 'Dados do item inválidos' });
      }
      item.subtotal = item.preco_unitario * item.quantidade;
      total += item.subtotal;
    }

    const troco = (valor_pago || total) - total;
    if (troco < 0) {
      return res.status(400).json({ error: 'Valor pago é insuficiente' });
    }

    const venda = Venda.create({
      cliente_id: cliente_id || null,
      usuario_id: req.userId,
      total,
      valor_pago: valor_pago || total,
      troco,
      itens
    });

    res.status(201).json(venda);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.list = (req, res) => {
  try {
    const { page = 1, limit = 10, dataInicio, dataFim, cliente_id } = req.query;
    const result = Venda.getAll(parseInt(page), parseInt(limit), { dataInicio, dataFim, cliente_id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar vendas: ' + err.message });
  }
};

exports.getById = (req, res) => {
  try {
    const venda = Venda.getById(req.params.id);
    if (!venda) return res.status(404).json({ error: 'Venda não encontrada' });
    res.json(venda);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar venda: ' + err.message });
  }
};
