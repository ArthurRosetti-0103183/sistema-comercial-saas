/**
 * Model: Usuário
 * CRUD completo para gerenciamento de usuários
 */
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
  /** Lista todos os usuários com paginação e busca */
  static getAll(search = '', page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    let where = '';
    const params = [];
    if (search) {
      where = ' WHERE nome LIKE ? OR usuario LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    const total = db.prepare('SELECT COUNT(*) as total FROM usuarios' + where).get(...params).total;
    const data = db.prepare(
      'SELECT id, nome, usuario, tipo, created_at FROM usuarios' + where + ' ORDER BY id DESC LIMIT ? OFFSET ?'
    ).all(...params, limit, offset);
    return { data, total, pages: Math.ceil(total / limit) };
  }

  /** Busca usuário por ID (sem senha) */
  static getById(id) {
    return db.prepare('SELECT id, nome, usuario, tipo, created_at FROM usuarios WHERE id = ?').get(id);
  }

  /** Cria novo usuário com senha hash */
  static create({ nome, usuario, senha, tipo = 'comum' }) {
    const hashed = bcrypt.hashSync(senha, 10);
    const result = db.prepare('INSERT INTO usuarios (nome, usuario, senha, tipo) VALUES (?, ?, ?, ?)').run(nome, usuario, hashed, tipo);
    return { id: result.lastInsertRowid, nome, usuario, tipo };
  }

  /** Atualiza usuário (senha opcional) */
  static update(id, { nome, usuario, senha, tipo }) {
    if (senha) {
      const hashed = bcrypt.hashSync(senha, 10);
      db.prepare('UPDATE usuarios SET nome=?, usuario=?, senha=?, tipo=? WHERE id=?').run(nome, usuario, hashed, tipo, id);
    } else {
      db.prepare('UPDATE usuarios SET nome=?, usuario=?, tipo=? WHERE id=?').run(nome, usuario, tipo, id);
    }
    return Usuario.getById(id);
  }

  /** Exclui usuário */
  static delete(id) {
    return db.prepare('DELETE FROM usuarios WHERE id = ?').run(id);
  }

  /** Busca por nome de usuário (com senha - para login) */
  static findByUsername(usuario) {
    return db.prepare('SELECT * FROM usuarios WHERE usuario = ?').get(usuario);
  }
}

module.exports = Usuario;
