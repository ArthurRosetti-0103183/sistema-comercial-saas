/**
 * Controller: Relatórios
 * Dashboard, relatórios de vendas, estoque e financeiro
 */
const Venda = require('../models/venda');
const Produto = require('../models/produto');
const Cliente = require('../models/cliente');

/** Dados do dashboard */
exports.dashboard = (req, res) => {
  try {
    res.json({
      totalVendasHoje: Venda.totalHoje(),
      totalVendasMes: Venda.totalMes(),
      totalVendas: Venda.count(),
      vendasHoje: Venda.countHoje(),
      ticketMedio: Venda.ticketMedio(),
      totalEstoque: Produto.totalStock(),
      produtosBaixos: Produto.lowStockCount(),
      totalClientes: Cliente.count(),
      totalProdutos: Produto.count(),
      produtosMaisVendidos: Venda.produtosMaisVendidos(5)
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar dashboard: ' + err.message });
  }
};

/** Relatório de vendas por período */
exports.vendasPorPeriodo = (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: 'Informe o período (dataInicio e dataFim)' });
    }
    const vendas = Venda.vendasPorPeriodo(dataInicio, dataFim);
    const totalVendido = vendas.reduce((sum, v) => sum + v.total, 0);
    res.json({ vendas, totalVendido, quantidade: vendas.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro no relatório: ' + err.message });
  }
};

/** Relatório de estoque */
exports.estoque = (req, res) => {
  try {
    res.json({
      baixoEstoque: Produto.getLowStock(),
      semEstoque: Produto.getOutOfStock(),
      maisVendidos: Venda.produtosMaisVendidos(10)
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro no relatório: ' + err.message });
  }
};

/** Relatório financeiro */
exports.financeiro = (req, res) => {
  try {
    res.json({
      totalHoje: Venda.totalHoje(),
      totalMes: Venda.totalMes(),
      ticketMedio: Venda.ticketMedio(),
      vendasHoje: Venda.countHoje(),
      totalVendas: Venda.count()
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro no relatório: ' + err.message });
  }
};
