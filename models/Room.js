const mongoose = require('mongoose');

const roomObjectSchema = new mongoose.Schema(
  {
    ObjectName: {
      type: String,
      required: true,
    },
    PosX: {
      type: Number,
      required: true,
    },
    PosY: {
      type: Number,
      required: true,
    },
    Width: {
      type: Number,
      required: true,
    },
    Height: {
      type: Number,
      required: true,
    },
    Rotation: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema({
  AccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  RoomName: {
    type: String,
    required: true,
  },
  Width: {
    type: Number,
    required: true,
  },
  Height: {
    type: Number,
    required: true,
  },
  RoomType: {
    type: String,
    required: true,
  },
  Objects: {
    type: [roomObjectSchema],
    default: [],
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Room', roomSchema, 'Room');
