const express = require('express');
const { login, logout, me } = require('../controllers/authcontroller');
const { authenticate } = require('../middleware/authmiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, me);

module.exports = router;
