/**
 * Middleware de Autenticação JWT
 * Verifica token e permissões de acesso
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

/**
 * Verifica se o token JWT é válido
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token mal formatado' });
  }
  try {
    const decoded = jwt.verify(parts[1], JWT_SECRET);
    req.userId = decoded.id;
    req.userType = decoded.tipo;
    req.userName = decoded.nome;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

/**
 * Verifica se o usuário é administrador
 */
function adminMiddleware(req, res, next) {
  if (req.userType !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Permissão de administrador necessária.' });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware };
