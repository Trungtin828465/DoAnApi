const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  },
  FullName: {
    type: String,
    required: true,
  },
  NumberPhone: {
    type: String,
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema, 'Account');

