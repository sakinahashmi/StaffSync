const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a training title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },
    instructor: {
      type: String,
      required: [true, 'Please provide the instructor name'],
      trim: true,
    },
    department: {
      type: String,
      default: 'All',
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    capacity: {
      type: Number,
      default: 30,
      min: [1, 'Capacity must be at least 1'],
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed'],
      default: 'Upcoming',
    },
    skillsCovered: {
      type: [String],
      default: [],
    },
    mode: {
      type: String,
      enum: ['Online', 'In-Person', 'Hybrid'],
      default: 'Online',
    },
    locationOrLink: {
      type: String,
      default: 'Virtual Training Room (Zoom/Meet)',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Training', trainingSchema);
