const mongoose = require('mongoose');

const roomObjectSchema = new mongoose.Schema(
  {
    ObjectId: {
      type: String,
      required: true,
      trim: true,
    },
    ObjectName: {
      type: String,
      required: true,
      trim: true,
    },
    ClassName: {
      type: String,
      required: true,
      trim: true,
    },
    AssetPath: {
      type: String,
      default: '',
      trim: true,
    },
    PosX: {
      type: Number,
      required: true,
      default: 0,
    },
    PosY: {
      type: Number,
      required: true,
      default: 0,
    },
    PosZ: {
      type: Number,
      required: true,
      default: 0,
    },
    Width: {
      type: Number,
      required: true,
      min: 0,
    },
    Depth: {
      type: Number,
      required: true,
      min: 0,
    },
    Height: {
      type: Number,
      required: true,
      min: 0,
    },
    Scale: {
      type: Number,
      default: 1,
      min: 0.01,
    },
    RotationX: {
      type: Number,
      default: 0,
    },
    RotationY: {
      type: Number,
      default: 0,
    },
    RotationZ: {
      type: Number,
      default: 0,
    },
    IsFixed: {
      type: Boolean,
      default: true,
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
    trim: true,
  },
  Width: {
    type: Number,
    required: true,
    min: 0,
  },
  Depth: {
    type: Number,
    required: true,
    min: 0,
  },
  Height: {
    type: Number,
    required: true,
    min: 0,
  },
  RoomType: {
    type: String,
    default: 'custom_3d',
    trim: true,
  },
  Unit: {
    type: String,
    default: 'm',
    enum: ['m', 'cm', 'mm'],
  },
  Objects: {
    type: [roomObjectSchema],
    default: [],
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
  UpdatedAt: {
    type: Date,
    default: Date.now,
  },
});

roomSchema.pre('save', function updateTimestamp(next) {
  this.UpdatedAt = new Date();
  next();
});

module.exports = mongoose.model('Room', roomSchema, 'Room');
