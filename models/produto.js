/**
 * Model: Produto
 * CRUD completo com controle de estoque
 */
const db = require('../config/database');

class Produto {
  /** Lista com paginação e busca */
  static getAll(search = '', page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    let where = '';
    const params = [];
    if (search) {
      where = ' WHERE nome LIKE ? OR codigo LIKE ? OR categoria LIKE ?';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const total = db.prepare('SELECT COUNT(*) as total FROM produtos' + where).get(...params).total;
    const data = db.prepare('SELECT * FROM produtos' + where + ' ORDER BY id DESC LIMIT ? OFFSET ?').all(...params, limit, offset);
    return { data, total, pages: Math.ceil(total / limit) };
  }

  /** Lista simples para vendas (apenas com estoque) */
  static getAllSimple() {
    return db.prepare('SELECT id, nome, preco_venda, quantidade_estoque FROM produtos WHERE quantidade_estoque > 0 ORDER BY nome').all();
  }

  static getById(id) {
    return db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
  }

  static create({ nome, codigo, categoria, descricao, preco_custo, preco_venda, quantidade_estoque, estoque_minimo }) {
    const result = db.prepare(
      `INSERT INTO produtos (nome, codigo, categoria, descricao, preco_custo, preco_venda, quantidade_estoque, estoque_minimo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(nome, codigo || null, categoria || null, descricao || null,
      preco_custo || 0, preco_venda || 0, quantidade_estoque || 0, estoque_minimo || 5);
    return Produto.getById(result.lastInsertRowid);
  }

  static update(id, { nome, codigo, categoria, descricao, preco_custo, preco_venda, quantidade_estoque, estoque_minimo }) {
    db.prepare(
      `UPDATE produtos SET nome=?, codigo=?, categoria=?, descricao=?, preco_custo=?,
       preco_venda=?, quantidade_estoque=?, estoque_minimo=? WHERE id=?`
    ).run(nome, codigo || null, categoria || null, descricao || null,
      preco_custo || 0, preco_venda || 0, quantidade_estoque || 0, estoque_minimo || 5, id);
    return Produto.getById(id);
  }

  /** Baixa de estoque */
  static updateStock(id, quantidade) {
    db.prepare('UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?').run(quantidade, id);
  }

  static delete(id) {
    return db.prepare('DELETE FROM produtos WHERE id = ?').run(id);
  }

  /** Produtos com estoque baixo */
  static getLowStock() {
    return db.prepare('SELECT * FROM produtos WHERE quantidade_estoque <= estoque_minimo AND quantidade_estoque > 0 ORDER BY quantidade_estoque ASC').all();
  }

  /** Produtos sem estoque */
  static getOutOfStock() {
    return db.prepare('SELECT * FROM produtos WHERE quantidade_estoque = 0 ORDER BY nome').all();
  }

  static count() {
    return db.prepare('SELECT COUNT(*) as total FROM produtos').get().total;
  }

  static totalStock() {
    return db.prepare('SELECT COALESCE(SUM(quantidade_estoque), 0) as total FROM produtos').get().total;
  }

  static lowStockCount() {
    return db.prepare('SELECT COUNT(*) as total FROM produtos WHERE quantidade_estoque <= estoque_minimo').get().total;
  }
}

module.exports = Produto;
