const Room = require('../models/Room');
const User = require('../models/User');

// Lay tat ca phong
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json({
      message: 'Danh sach phong',
      data: rooms,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Loi server',
      error: error.message,
    });
  }
};

// Lay phong theo ID nguoi dung
exports.getRoomsByAccountId = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await User.findById(id);
    if (!account) {
      return res.status(404).json({
        message: 'Khong tim thay tai khoan',
      });
    }

    const rooms = await Room.find({ AccountId: account._id });
    res.status(200).json({
      message: 'Danh sach phong theo tai khoan',
      data: rooms,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Loi server',
      error: error.message,
    });
  }
};

// Tao phong cho tai khoan
exports.createRoomForAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { RoomName, Width, Height, RoomType, Objects } = req.body;

    if (!RoomName || Width == null || Height == null || !RoomType) {
      return res.status(400).json({
        message: 'Vui long nhap day du thong tin phong',
      });
    }

    const account = await User.findById(id);
    if (!account) {
      return res.status(404).json({
        message: 'Khong tim thay tai khoan',
      });
    }

    const room = await Room.create({
      AccountId: account._id,
      RoomName,
      Width,
      Height,
      RoomType,
      Objects: Array.isArray(Objects) ? Objects : [],
    });

    res.status(201).json({
      message: 'Tao phong thanh cong',
      data: room,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Loi server',
      error: error.message,
    });
  }
};
