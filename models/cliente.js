/**
 * Model: Cliente
 * CRUD completo para gerenciamento de clientes
 */
const db = require('../config/database');

class Cliente {
  /** Lista todos com paginação e busca */
  static getAll(search = '', page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    let where = '';
    const params = [];
    if (search) {
      where = ' WHERE nome LIKE ? OR cpf_cnpj LIKE ? OR email LIKE ?';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const total = db.prepare('SELECT COUNT(*) as total FROM clientes' + where).get(...params).total;
    const data = db.prepare('SELECT * FROM clientes' + where + ' ORDER BY id DESC LIMIT ? OFFSET ?').all(...params, limit, offset);
    return { data, total, pages: Math.ceil(total / limit) };
  }

  /** Lista simples (para selects) */
  static getAllSimple() {
    return db.prepare('SELECT id, nome FROM clientes ORDER BY nome').all();
  }

  static getById(id) {
    return db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
  }

  static create({ nome, cpf_cnpj, telefone, email, endereco }) {
    const result = db.prepare(
      'INSERT INTO clientes (nome, cpf_cnpj, telefone, email, endereco) VALUES (?, ?, ?, ?, ?)'
    ).run(nome, cpf_cnpj || null, telefone || null, email || null, endereco || null);
    return Cliente.getById(result.lastInsertRowid);
  }

  static update(id, { nome, cpf_cnpj, telefone, email, endereco }) {
    db.prepare(
      'UPDATE clientes SET nome=?, cpf_cnpj=?, telefone=?, email=?, endereco=? WHERE id=?'
    ).run(nome, cpf_cnpj || null, telefone || null, email || null, endereco || null, id);
    return Cliente.getById(id);
  }

  static delete(id) {
    return db.prepare('DELETE FROM clientes WHERE id = ?').run(id);
  }

  static count() {
    return db.prepare('SELECT COUNT(*) as total FROM clientes').get().total;
  }
}

module.exports = Cliente;
