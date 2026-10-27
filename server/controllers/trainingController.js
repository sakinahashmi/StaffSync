const Training = require('../models/Training');
const TrainingEnrollment = require('../models/TrainingEnrollment');

// @desc    Get all training programs with current user's enrollment flag
// @route   GET /api/trainings
// @access  Private
const getTrainings = async (req, res) => {
  try {
    const { status, department } = req.query;

    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    if (department && department !== 'All') {
      query.$or = [{ department: 'All' }, { department }];
    }

    const trainings = await Training.find(query)
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 });

    // Fetch user's active enrollments to flag enrolled courses
    const userEnrollments = await TrainingEnrollment.find({
      user: req.user._id,
    });

    const enrolledMap = {};
    userEnrollments.forEach((e) => {
      enrolledMap[e.training.toString()] = {
        enrollmentId: e._id,
        status: e.status,
        enrolledAt: e.enrolledAt,
        completionDate: e.completionDate,
      };
    });

    const formatted = trainings.map((t) => {
      const obj = t.toObject();
      obj.myEnrollment = enrolledMap[t._id.toString()] || null;
      obj.isEnrolled = !!enrolledMap[t._id.toString()];
      return obj;
    });

    res.json({
      success: true,
      count: formatted.length,
      trainings: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a training program
// @route   POST /api/trainings
// @access  Private (HR Admin only)
const createTraining = async (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      department,
      startDate,
      endDate,
      capacity,
      mode,
      locationOrLink,
      skillsCovered,
    } = req.body;

    if (!title || !description || !instructor || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, instructor, and dates are required',
      });
    }

    const training = await Training.create({
      title,
      description,
      instructor,
      department: department || 'All',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      capacity: capacity || 30,
      mode: mode || 'Online',
      locationOrLink: locationOrLink || 'Virtual Classroom',
      skillsCovered: Array.isArray(skillsCovered)
        ? skillsCovered
        : typeof skillsCovered === 'string'
        ? skillsCovered.split(',').map((s) => s.trim())
        : [],
      createdBy: req.user._id,
      status: 'Upcoming',
    });

    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      training,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a training program
// @route   PUT /api/trainings/:id
// @access  Private (HR Admin only)
const updateTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    const {
      title,
      description,
      instructor,
      department,
      startDate,
      endDate,
      capacity,
      status,
      mode,
      locationOrLink,
      skillsCovered,
    } = req.body;

    if (title !== undefined) training.title = title;
    if (description !== undefined) training.description = description;
    if (instructor !== undefined) training.instructor = instructor;
    if (department !== undefined) training.department = department;
    if (startDate !== undefined) training.startDate = new Date(startDate);
    if (endDate !== undefined) training.endDate = new Date(endDate);
    if (capacity !== undefined) training.capacity = Number(capacity);
    if (status !== undefined) training.status = status;
    if (mode !== undefined) training.mode = mode;
    if (locationOrLink !== undefined) training.locationOrLink = locationOrLink;
    if (skillsCovered !== undefined) {
      training.skillsCovered = Array.isArray(skillsCovered)
        ? skillsCovered
        : typeof skillsCovered === 'string'
        ? skillsCovered.split(',').map((s) => s.trim())
        : training.skillsCovered;
    }

    await training.save();

    res.json({
      success: true,
      message: 'Training program updated successfully',
      training,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a training program
// @route   DELETE /api/trainings/:id
// @access  Private (HR Admin only)
const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    await TrainingEnrollment.deleteMany({ training: training._id });
    await training.deleteOne();

    res.json({
      success: true,
      message: 'Training program and associated enrollments deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enroll in a training program
// @route   POST /api/trainings/:id/enroll
// @access  Private (All employees)
const enrollInTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }

    // Check capacity
    if (training.enrolledCount >= training.capacity) {
      return res.status(400).json({
        success: false,
        message: 'This training program has reached maximum capacity',
      });
    }

    // Check existing enrollment
    const existing = await TrainingEnrollment.findOne({
      training: training._id,
      user: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this training program',
      });
    }

    const enrollment = await TrainingEnrollment.create({
      training: training._id,
      user: req.user._id,
      status: 'Enrolled',
    });

    // Increment count
    training.enrolledCount += 1;
    await training.save();

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in training program',
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's own enrollments
// @route   GET /api/trainings/my-enrollments
// @access  Private
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await TrainingEnrollment.find({ user: req.user._id })
      .populate('training')
      .sort({ createdAt: -1 });

    const total = enrollments.length;
    const completed = enrollments.filter((e) => e.status === 'Completed').length;
    const inProgress = enrollments.filter(
      (e) => e.status === 'Enrolled' || e.status === 'In Progress'
    ).length;

    res.json({
      success: true,
      stats: {
        total,
        completed,
        inProgress,
      },
      enrollments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update enrollment progress or complete
// @route   PATCH /api/trainings/enrollments/:enrollmentId
// @access  Private
const updateEnrollmentStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const enrollment = await TrainingEnrollment.findById(req.params.enrollmentId);

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found' });
    }

    // Check ownership or HR
    const isOwner = enrollment.user.toString() === req.user._id.toString();
    const isHr = req.user.role === 'hr';

    if (!isOwner && !isHr) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this enrollment record',
      });
    }

    if (status) {
      enrollment.status = status;
      if (status === 'Completed') {
        enrollment.completionDate = new Date();
      }
    }

    if (feedback !== undefined) {
      enrollment.feedback = feedback;
    }

    await enrollment.save();

    res.json({
      success: true,
      message: 'Enrollment status updated successfully',
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
  enrollInTraining,
  getMyEnrollments,
  updateEnrollmentStatus,
};
