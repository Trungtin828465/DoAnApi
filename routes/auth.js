const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Đăng ký
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Lấy tất cả tài khoản
router.get('/users', authController.getAllUsers);

// Lấy tài khoản theo ID
router.get('/users/:id', authController.getUserById);

module.exports = router;

