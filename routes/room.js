const express = require('express');
const roomController = require('../controllers/roomController');

const router = express.Router();

// Lấy tất cả phòng
router.get('/room', roomController.getAllRooms);

// Lấy phòng theo ID phòng
router.get('/room/:roomId', roomController.getRoomById);

// Lấy phòng theo ID người dùng
router.get('/room/user/:id', roomController.getRoomsByAccountId);

// Tạo phòng cho tài khoản
router.post('/room/user/:id', roomController.createRoomForAccount);

// Cập nhật phòng và tọa độ vật trong phòng
router.put('/room/:roomId', roomController.updateRoom);

// Xóa phòng
router.delete('/room/:roomId', roomController.deleteRoom);

module.exports = router;
