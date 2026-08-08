const jwt = require('jsonwebtoken');
const User = require('../models/User');
const redisClient = require('../config/redis');

// Verifies the JWT cookie, checks it hasn't been blacklisted (logout), and
// attaches the user to req.user.
const authenticate = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      throw new Error('Authentication required');
    }

    const payload = jwt.verify(token, process.env.JWT_KEY);

    const user = await User.findById(payload._id).select('-password');

    if (!user) {
      throw new Error('User does not exist');
    }

    const isBlocked = await redisClient.exists(`blacklist:${token}`);

    if (isBlocked) {
      throw new Error('Session expired, please log in again');
    }

    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    return res.status(401).json({
      message: err.message
    });
  }
};

// Role gate, e.g. authorize('hr'). Must run after authenticate.
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = { authenticate, authorize };
