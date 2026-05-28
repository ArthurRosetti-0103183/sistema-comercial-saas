/**
 * Controller: Autenticação
 * Login e verificação de sessão
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

exports.login = (req, res) => {
  try {
    const { usuario, senha } = req.body;
    if (!usuario || !senha) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const user = Usuario.findByUsername(usuario);
    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    if (!bcrypt.compareSync(senha, user.senha)) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: user.id, nome: user.nome, usuario: user.usuario, tipo: user.tipo },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, nome: user.nome, usuario: user.usuario, tipo: user.tipo }
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.me = (req, res) => {
  try {
    const user = Usuario.getById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
