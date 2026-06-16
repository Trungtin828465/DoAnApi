const Room = require('../models/Room');
const User = require('../models/User');

function toNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeRoomObject(object = {}, index = 0) {
  const className = object.ClassName || object.ObjectName || object.ObjectId || `object_${index + 1}`;

  return {
    ObjectId: String(object.ObjectId || `${className}_${index + 1}`),
    ObjectName: String(object.ObjectName || className),
    ClassName: String(className),
    AssetPath: String(object.AssetPath || ''),
    PosX: toNumber(object.PosX),
    PosY: toNumber(object.PosY),
    PosZ: toNumber(object.PosZ),
    Width: toNumber(object.Width, 0.1),
    Depth: toNumber(object.Depth, 0.1),
    Height: toNumber(object.Height, 0.1),
    Scale: toNumber(object.Scale, 1),
    RotationX: toNumber(object.RotationX),
    RotationY: toNumber(object.RotationY ?? object.Rotation),
    RotationZ: toNumber(object.RotationZ),
    IsFixed: object.IsFixed !== false,
  };
}

function normalizeRoomPayload(body) {
  const objects = Array.isArray(body.Objects)
    ? body.Objects.map((object, index) => normalizeRoomObject(object, index))
    : [];

  return {
    RoomName: String(body.RoomName || '').trim(),
    Width: toNumber(body.Width),
    Depth: toNumber(body.Depth),
    Height: toNumber(body.Height),
    RoomType: String(body.RoomType || 'custom_3d').trim(),
    Unit: body.Unit || 'm',
    Objects: objects,
  };
}

function validateRoomPayload(payload) {
  if (!payload.RoomName) {
    return 'Vui lòng nhập tên phòng';
  }

  if (payload.Width <= 0 || payload.Depth <= 0 || payload.Height <= 0) {
    return 'Chiều dài, chiều rộng và chiều cao phòng phải lớn hơn 0';
  }

  for (const object of payload.Objects) {
    if (!object.ObjectId || !object.ObjectName || !object.ClassName) {
      return 'Thông tin vật trong phòng chưa đầy đủ';
    }

    if (object.Width <= 0 || object.Depth <= 0 || object.Height <= 0) {
      return `Kích thước vật ${object.ObjectName} phải lớn hơn 0`;
    }
  }

  return null;
}

// Lấy tất cả phòng
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ UpdatedAt: -1 });
    res.status(200).json({
      message: 'Danh sách phòng',
      data: rooms,
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách phòng:', error);
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// Lấy phòng theo ID phòng
exports.getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    res.status(200).json({
      message: 'Thông tin phòng',
      data: room,
    });
  } catch (error) {
    console.error('Lỗi lấy phòng:', error);
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// Lấy phòng theo ID người dùng
exports.getRoomsByAccountId = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await User.findById(id);
    if (!account) {
      return res.status(404).json({
        message: 'Không tìm thấy tài khoản',
      });
    }

    const rooms = await Room.find({ AccountId: account._id }).sort({ UpdatedAt: -1 });
    res.status(200).json({
      message: 'Danh sách phòng theo tài khoản',
      data: rooms,
    });
  } catch (error) {
    console.error('Lỗi lấy phòng theo tài khoản:', error);
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// Tạo phòng cho tài khoản
exports.createRoomForAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = normalizeRoomPayload(req.body);
    const validationError = validateRoomPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const account = await User.findById(id);
    if (!account) {
      return res.status(404).json({
        message: 'Không tìm thấy tài khoản',
      });
    }

    const room = await Room.create({
      AccountId: account._id,
      ...payload,
    });

    res.status(201).json({
      message: 'Tạo phòng thành công',
      data: room,
    });
  } catch (error) {
    console.error('Lỗi tạo phòng:', error);
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// Cập nhật phòng và tọa độ vật trong phòng
exports.updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const payload = normalizeRoomPayload(req.body);
    const validationError = validateRoomPayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const room = await Room.findByIdAndUpdate(
      roomId,
      {
        ...payload,
        UpdatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    res.status(200).json({
      message: 'Cập nhật phòng thành công',
      data: room,
    });
  } catch (error) {
    console.error('Lỗi cập nhật phòng:', error);
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// Xóa phòng
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findByIdAndDelete(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    res.status(200).json({
      message: 'Xóa phòng thành công',
      data: room,
    });
  } catch (error) {
    console.error('Lỗi xóa phòng:', error);
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message,
    });
  }
};
