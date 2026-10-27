const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    checkIn: {
      type: Date,
      default: Date.now,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    workingHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half Day', 'On Leave', 'Absent'],
      default: 'Present',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      enum: ['Office (HQ)', 'Remote', 'Client Site'],
      default: 'Office (HQ)',
    },
  },
  {
    timestamps: true,
  }
);

// Unique index so user has at most one attendance record per calendar date
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
