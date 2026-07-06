const User = require('../models/User');

function normalizeEmail(email) {
  return String(email || '').trim();
}

function normalizePassword(password) {
  return String(password || '').trim();
}

// Đăng ký
exports.register = async (req, res) => {
  try {
    const Email = normalizeEmail(req.body.Email);
    const Password = normalizePassword(req.body.Password);
    const { FullName, NumberPhone } = req.body;

    // Kiểm tra input
    if (!Email || !Password || !FullName) {
      return res.status(400).json({
        message: 'Vui lòng điền đầy đủ thông tin',
      });
    }

    // Kiểm tra email tồn tại
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email đã được sử dụng',
      });
    }

    // Tạo user mới
    const newUser = await User.create({
      Email,
      Password: Password,
      FullName,
      NumberPhone,
    });

    res.status(201).json({
      message: 'Đăng ký thành công',
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
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const Email = normalizeEmail(req.body.Email);
    const Password = normalizePassword(req.body.Password);

    // Kiểm tra input
    if (!Email || !Password) {
      return res.status(400).json({
        message: 'Vui lòng điền email và mật khẩu',
      });
    }

    // Tìm user
    const user = await User.findOne({ Email });
    
    if (!user) {
      return res.status(401).json({
        message: 'Email hoặc mật khẩu không chính xác',
      });
    }

    // Kiểm tra password
    const isPasswordCorrect = Password === normalizePassword(user.Password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Email hoặc mật khẩu không chính xác',
      });
    }

    res.status(200).json({
      message: 'Đăng nhập thành công',
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
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// Lấy tất cả tài khoản
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      message: 'Danh sách tài khoản',
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// Lấy tài khoản theo ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        message: 'Không tìm thấy tài khoản',
      });
    }
    
    res.status(200).json({
      message: 'Thông tin tài khoản',
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message,
    });
  }
};
