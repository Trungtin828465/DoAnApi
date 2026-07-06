const User = require('../models/User');

function normalizeEmail(email) {
  return String(email || '').trim();
}

function normalizePassword(password) {
  return String(password || '').trim();
}

// Dang ky
exports.register = async (req, res) => {
  try {
    const Email = normalizeEmail(req.body.Email);
    const Password = normalizePassword(req.body.Password);
    const { FullName, NumberPhone } = req.body;

    if (!Email || !Password || !FullName) {
      return res.status(400).json({
        message: 'Vui long dien day du thong tin',
      });
    }

    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email da duoc su dung',
      });
    }

    const newUser = await User.create({
      Email,
      Password,
      FullName,
      NumberPhone,
    });

    return res.status(201).json({
      message: 'Dang ky thanh cong',
      user: {
        _id: newUser._id,
        Email: newUser.Email,
        FullName: newUser.FullName,
        NumberPhone: newUser.NumberPhone,
        CreatedAt: newUser.CreatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Loi server',
      error: error.message,
    });
  }
};

// Dang nhap
exports.login = async (req, res) => {
  try {
    const Email = normalizeEmail(req.body.Email);
    const Password = normalizePassword(req.body.Password);

    if (!Email || !Password) {
      return res.status(400).json({
        message: 'Vui long dien email va mat khau',
      });
    }

    const user = await User.findOne({ Email });
    if (!user) {
      return res.status(401).json({
        message: 'Email hoac mat khau khong chinh xac',
      });
    }

    const isPasswordCorrect = Password === normalizePassword(user.Password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Email hoac mat khau khong chinh xac',
      });
    }

    return res.status(200).json({
      message: 'Dang nhap thanh cong',
      user: {
        _id: user._id,
        Email: user.Email,
        FullName: user.FullName,
        NumberPhone: user.NumberPhone,
        CreatedAt: user.CreatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Loi server',
      error: error.message,
    });
  }
};

// Lay tat ca tai khoan
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      message: 'Danh sach tai khoan',
      data: users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Loi server',
      error: error.message,
    });
  }
};

// Lay tai khoan theo ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: 'Khong tim thay tai khoan',
      });
    }

    return res.status(200).json({
      message: 'Thong tin tai khoan',
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Loi server',
      error: error.message,
    });
  }
};
