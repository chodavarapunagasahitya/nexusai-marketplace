const jwt = require('jsonwebtoken');
const storage = require('../services/storage');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_nexus_ai_jwt_key_2026';

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await storage.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User session expired or not found.' });
    }
    req.user = {
      id: user.id || user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      title: user.title
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Access denied. Requires one of roles: [${roles.join(', ')}]` });
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
  JWT_SECRET
};
