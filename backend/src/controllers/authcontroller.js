const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const redisClient = require('../config/redis');

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    email = email.trim().toLowerCase();
    password = password.trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    return res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        managerId: user.managerId
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Login failed'
    });
  }
};

const logout = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (token) {
      try {
        const decoded = jwt.decode(token);
        const ttlSeconds = decoded?.exp
          ? decoded.exp - Math.floor(Date.now() / 1000)
          : 0;

        if (ttlSeconds > 0) {
          await redisClient.set(`blacklist:${token}`, '1', {
            EX: ttlSeconds
          });
        }
      } catch (e) {
        // token was already invalid/expired, nothing to blacklist
      }
    }

    res.clearCookie('token');

    return res.status(200).json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Logout failed'
    });
  }
};

// Lets the frontend confirm the session is still valid instead of trusting
// whatever is cached in localStorage.
const me = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

module.exports = {
  login,
  logout,
  me
};
