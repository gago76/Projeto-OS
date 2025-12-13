const jwt = require('jsonwebtoken');

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'meuSistemaDeOS2025SecretKey', (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name
      };
      
      return next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = { authenticateToken };
