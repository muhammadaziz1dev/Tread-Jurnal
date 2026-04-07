const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ro'yxatdan o'tish: POST /api/auth/register
router.post('/register', authController.register);

// Tizimga kirish: POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;