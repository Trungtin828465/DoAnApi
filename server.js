const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const ttsRoutes = require('./routes/tts');
const detectRoutes = require('./routes/detect');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB được kết nối thành công');
  })
  .catch((error) => {
    console.error('MongoDB lỗi:', error.message);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', roomRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/detect', detectRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Server is running',
    timestamp: new Date(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API URL: http://localhost:${PORT}/api`);
});

