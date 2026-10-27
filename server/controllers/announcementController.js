const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private (All authenticated users)
const getAnnouncements = async (req, res) => {
  try {
    const { category, search } = req.query;

    const query = { isPublished: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    // Pinned announcements first, then newest
    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email role position')
      .sort({ pinned: -1, createdAt: -1 });

    res.json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      'createdBy',
      'name email role'
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    res.json({
      success: true,
      announcement,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private (HR Admin only)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, priority, targetAudience, pinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'General',
      priority: priority || 'Medium',
      targetAudience: targetAudience || 'All',
      pinned: !!pinned,
      createdBy: req.user._id,
    });

    const populated = await Announcement.findById(announcement._id).populate(
      'createdBy',
      'name email role'
    );

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      announcement: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private (HR Admin only)
const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    const { title, content, category, priority, targetAudience, pinned, isPublished } = req.body;

    if (title !== undefined) announcement.title = title;
    if (content !== undefined) announcement.content = content;
    if (category !== undefined) announcement.category = category;
    if (priority !== undefined) announcement.priority = priority;
    if (targetAudience !== undefined) announcement.targetAudience = targetAudience;
    if (pinned !== undefined) announcement.pinned = pinned;
    if (isPublished !== undefined) announcement.isPublished = isPublished;

    await announcement.save();

    const populated = await Announcement.findById(announcement._id).populate(
      'createdBy',
      'name email role'
    );

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (HR Admin only)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    await announcement.deleteOne();

    res.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
