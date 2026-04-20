const express = require('express');
const roomController = require('../controllers/roomController');

const router = express.Router();

// Lay tat ca phong
router.get('/room', roomController.getAllRooms);

// Lay phong theo ID nguoi dung
router.get('/room/user/:id', roomController.getRoomsByAccountId);

// Tao phong cho tai khoan
router.post('/room/user/:id', roomController.createRoomForAccount);

module.exports = router;
