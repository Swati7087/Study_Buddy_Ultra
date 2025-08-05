const express = require('express');
const { body, validationResult } = require('express-validator');
const Session = require('../models/Session');
const FocusScore = require('../models/FocusScore');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/sessions
// @desc    Create a new study session
// @access  Private
router.post('/', auth, [
  body('title')
    .notEmpty()
    .withMessage('Session title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('subject')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Subject cannot exceed 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, subject, tags } = req.body;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 25 * 60 * 1000); // Default 25 minutes

    const session = new Session({
      user: req.user._id,
      title,
      description,
      subject,
      tags,
      startTime,
      endTime,
      duration: 25 // Default 25 minutes
    });

    await session.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalSessions: 1 }
    });

    res.status(201).json({
      message: 'Study session created successfully',
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Server error during session creation' });
  }
});

// @route   GET /api/sessions
// @desc    Get all sessions for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, completed } = req.query;
    const query = { user: req.user._id };

    if (completed !== undefined) {
      query.isCompleted = completed === 'true';
    }

    const sessions = await Session.find(query)
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'firstName lastName username');

    const total = await Session.countDocuments(query);

    res.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/sessions/:id
// @desc    Get session by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('user', 'firstName lastName username');

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/sessions/:id
// @desc    Update session
// @access  Private
router.put('/:id', auth, [
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('focusScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Focus score must be between 0 and 100'),
  body('productivityLevel')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Productivity level must be low, medium, or high'),
  body('mood')
    .optional()
    .isIn(['excellent', 'good', 'neutral', 'poor', 'terrible'])
    .withMessage('Invalid mood value')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      message: 'Session updated successfully',
      session
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Server error during session update' });
  }
});

// @route   DELETE /api/sessions/:id
// @desc    Delete session
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        totalSessions: -1,
        totalStudyTime: -session.duration
      }
    });

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Server error during session deletion' });
  }
});

// @route   POST /api/sessions/:id/complete
// @desc    Complete a study session
// @access  Private
router.post('/:id/complete', auth, [
  body('focusScore')
    .isInt({ min: 0, max: 100 })
    .withMessage('Focus score must be between 0 and 100'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('mood')
    .optional()
    .isIn(['excellent', 'good', 'neutral', 'poor', 'terrible'])
    .withMessage('Invalid mood value')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { focusScore, notes, mood } = req.body;
    const endTime = new Date();

    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.isCompleted) {
      return res.status(400).json({ error: 'Session already completed' });
    }

    // Calculate actual duration
    const durationMs = endTime.getTime() - session.startTime.getTime();
    const duration = Math.round(durationMs / (1000 * 60));

    session.endTime = endTime;
    session.duration = duration;
    session.focusScore = focusScore;
    session.notes = notes || session.notes;
    session.mood = mood || session.mood;
    session.isCompleted = true;

    await session.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        totalStudyTime: duration
      }
    });

    // Create focus score record
    const focusScoreRecord = new FocusScore({
      user: req.user._id,
      session: session._id,
      score: focusScore,
      notes: notes,
      mood: mood
    });

    await focusScoreRecord.save();

    res.json({
      message: 'Session completed successfully',
      session
    });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({ error: 'Server error during session completion' });
  }
});

// @route   POST /api/sessions/:id/focus-score
// @desc    Add focus score during session
// @access  Private
router.post('/:id/focus-score', auth, [
  body('score')
    .isInt({ min: 0, max: 100 })
    .withMessage('Focus score must be between 0 and 100'),
  body('factors.distractions')
    .optional()
    .isInt({ min: 0, max: 10 }),
  body('factors.energy')
    .optional()
    .isInt({ min: 0, max: 10 }),
  body('factors.motivation')
    .optional()
    .isInt({ min: 0, max: 10 }),
  body('factors.environment')
    .optional()
    .isInt({ min: 0, max: 10 }),
  body('notes')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters'),
  body('activity')
    .optional()
    .isIn(['reading', 'writing', 'problem-solving', 'reviewing', 'other'])
    .withMessage('Invalid activity type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const focusScore = new FocusScore({
      user: req.user._id,
      session: session._id,
      ...req.body
    });

    await focusScore.save();

    res.status(201).json({
      message: 'Focus score recorded successfully',
      focusScore
    });
  } catch (error) {
    console.error('Add focus score error:', error);
    res.status(500).json({ error: 'Server error during focus score recording' });
  }
});

module.exports = router; 