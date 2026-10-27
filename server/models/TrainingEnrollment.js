const mongoose = require('mongoose');

const trainingEnrollmentSchema = new mongoose.Schema(
  {
    training: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Training',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Enrolled', 'In Progress', 'Completed', 'Dropped'],
      default: 'Enrolled',
    },
    completionDate: {
      type: Date,
      default: null,
    },
    gradeOrScore: {
      type: String,
      default: '',
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate enrollment of the same user in the same training program
trainingEnrollmentSchema.index({ training: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('TrainingEnrollment', trainingEnrollmentSchema);
