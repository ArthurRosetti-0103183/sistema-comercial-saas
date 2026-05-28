/**
 * Model: Venda e Itens de Venda
 * Gerenciamento de vendas com transação atômica
 */
const db = require('../config/database');

class Venda {
  /**
   * Cria uma venda com seus itens e baixa o estoque
   * Usa transação para garantir atomicidade
   */
  static create({ cliente_id, usuario_id, total, valor_pago, troco, itens }) {
    const insertVenda = db.prepare(
      'INSERT INTO vendas (cliente_id, usuario_id, total, valor_pago, troco) VALUES (?, ?, ?, ?, ?)'
    );
    const insertItem = db.prepare(
      'INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES (?, ?, ?, ?, ?)'
    );
    const updateStock = db.prepare(
      'UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?'
    );
    const checkStock = db.prepare(
      'SELECT quantidade_estoque FROM produtos WHERE id = ?'
    );

    // Transação atômica
    const transaction = db.transaction(() => {
      // Verifica estoque de todos os itens antes de prosseguir
      for (const item of itens) {
        const produto = checkStock.get(item.produto_id);
        if (!produto || produto.quantidade_estoque < item.quantidade) {
          throw new Error(`Estoque insuficiente para o produto ID ${item.produto_id}`);
        }
      }

      // Insere a venda
      const result = insertVenda.run(cliente_id || null, usuario_id, total, valor_pago, troco);
      const vendaId = result.lastInsertRowid;

      // Insere itens e baixa estoque
      for (const item of itens) {
        insertItem.run(vendaId, item.produto_id, item.quantidade, item.preco_unitario, item.subtotal);
        updateStock.run(item.quantidade, item.produto_id);
      }

      return vendaId;
    });

    const vendaId = transaction();
    return Venda.getById(vendaId);
  }

  /** Busca venda por ID com detalhes */
  static getById(id) {
    const venda = db.prepare(`
      SELECT v.*, c.nome as cliente_nome, u.nome as usuario_nome
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.id = ?
    `).get(id);

    if (venda) {
      venda.itens = db.prepare(`
        SELECT iv.*, p.nome as produto_nome
        FROM itens_venda iv
        LEFT JOIN produtos p ON iv.produto_id = p.id
        WHERE iv.venda_id = ?
      `).all(id);
    }
    return venda;
  }

  /** Lista vendas com paginação */
  static getAll(page = 1, limit = 10, filtros = {}) {
    const offset = (page - 1) * limit;
    let where = ' WHERE 1=1';
    const params = [];

    if (filtros.dataInicio) {
      where += ' AND DATE(v.created_at) >= ?';
      params.push(filtros.dataInicio);
    }
    if (filtros.dataFim) {
      where += ' AND DATE(v.created_at) <= ?';
      params.push(filtros.dataFim);
    }
    if (filtros.cliente_id) {
      where += ' AND v.cliente_id = ?';
      params.push(filtros.cliente_id);
    }

    const total = db.prepare(
      'SELECT COUNT(*) as total FROM vendas v' + where
    ).get(...params).total;

    const data = db.prepare(`
      SELECT v.*, c.nome as cliente_nome, u.nome as usuario_nome
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      ${where} ORDER BY v.id DESC LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return { data, total, pages: Math.ceil(total / limit) };
  }

  /** Total vendido hoje */
  static totalHoje() {
    const r = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM vendas WHERE DATE(created_at) = DATE('now', 'localtime')").get();
    return r.total;
  }

  /** Total vendido no mês */
  static totalMes() {
    const r = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM vendas WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime')").get();
    return r.total;
  }

  /** Contagem de vendas hoje */
  static countHoje() {
    return db.prepare("SELECT COUNT(*) as total FROM vendas WHERE DATE(created_at) = DATE('now', 'localtime')").get().total;
  }

  /** Ticket médio */
  static ticketMedio() {
    const r = db.prepare("SELECT COALESCE(AVG(total), 0) as media FROM vendas WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime')").get();
    return r.media;
  }

  /** Produtos mais vendidos */
  static produtosMaisVendidos(limit = 10) {
    return db.prepare(`
      SELECT p.nome, p.codigo, SUM(iv.quantidade) as total_vendido, SUM(iv.subtotal) as total_valor
      FROM itens_venda iv
      JOIN produtos p ON iv.produto_id = p.id
      GROUP BY iv.produto_id
      ORDER BY total_vendido DESC
      LIMIT ?
    `).all(limit);
  }

  /** Vendas por período para relatórios */
  static vendasPorPeriodo(dataInicio, dataFim) {
    return db.prepare(`
      SELECT v.*, c.nome as cliente_nome, u.nome as usuario_nome
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE DATE(v.created_at) BETWEEN ? AND ?
      ORDER BY v.created_at DESC
    `).all(dataInicio, dataFim);
  }

  /** Total de vendas (contagem) */
  static count() {
    return db.prepare('SELECT COUNT(*) as total FROM vendas').get().total;
  }
}

module.exports = Venda;
