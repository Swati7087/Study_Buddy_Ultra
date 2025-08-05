const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Session = require('../models/Session');
const FocusScore = require('../models/FocusScore');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/profile/stats
// @desc    Get user statistics and analytics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get basic stats
    const totalSessions = await Session.countDocuments({ user: userId, isCompleted: true });
    const totalStudyTime = await Session.aggregate([
      { $match: { user: userId, isCompleted: true } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    // Get average focus score
    const avgFocusScore = await FocusScore.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, average: { $avg: '$score' } } }
    ]);

    // Get weekly stats (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklySessions = await Session.countDocuments({
      user: userId,
      isCompleted: true,
      startTime: { $gte: weekAgo }
    });

    const weeklyStudyTime = await Session.aggregate([
      {
        $match: {
          user: userId,
          isCompleted: true,
          startTime: { $gte: weekAgo }
        }
      },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    // Get monthly stats (last 30 days)
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const monthlySessions = await Session.countDocuments({
      user: userId,
      isCompleted: true,
      startTime: { $gte: monthAgo }
    });

    const monthlyStudyTime = await Session.aggregate([
      {
        $match: {
          user: userId,
          isCompleted: true,
          startTime: { $gte: monthAgo }
        }
      },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);

    // Get focus score distribution
    const focusScoreDistribution = await FocusScore.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $gte: ['$score', 80] }, then: 'excellent' },
                { case: { $gte: ['$score', 60] }, then: 'good' },
                { case: { $gte: ['$score', 40] }, then: 'average' },
                { case: { $gte: ['$score', 20] }, then: 'poor' }
              ],
              default: 'very-poor'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent sessions
    const recentSessions = await Session.find({
      user: userId,
      isCompleted: true
    })
      .sort({ startTime: -1 })
      .limit(5)
      .select('title duration focusScore startTime subject');

    // Get productivity trends
    const productivityTrends = await Session.aggregate([
      {
        $match: {
          user: userId,
          isCompleted: true,
          startTime: { $gte: monthAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startTime' }
          },
          totalTime: { $sum: '$duration' },
          avgFocusScore: { $avg: '$focusScore' },
          sessionCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const stats = {
      totalSessions,
      totalStudyTime: totalStudyTime[0]?.total || 0,
      averageFocusScore: Math.round(avgFocusScore[0]?.average || 0),
      weeklySessions,
      weeklyStudyTime: weeklyStudyTime[0]?.total || 0,
      monthlySessions,
      monthlyStudyTime: monthlyStudyTime[0]?.total || 0,
      focusScoreDistribution,
      recentSessions,
      productivityTrends
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/profile/sessions
// @desc    Get user's session history with pagination
// @access  Private
router.get('/sessions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, subject, dateFrom, dateTo } = req.query;
    const query = { user: req.user._id, isCompleted: true };

    // Add filters
    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    if (dateFrom || dateTo) {
      query.startTime = {};
      if (dateFrom) query.startTime.$gte = new Date(dateFrom);
      if (dateTo) query.startTime.$lte = new Date(dateTo);
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
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get session history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/profile/focus-scores
// @desc    Get user's focus score history
// @access  Private
router.get('/focus-scores', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, sessionId } = req.query;
    const query = { user: req.user._id };

    if (sessionId) {
      query.session = sessionId;
    }

    const focusScores = await FocusScore.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('session', 'title subject');

    const total = await FocusScore.countDocuments(query);

    res.json({
      focusScores,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get focus scores error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/profile/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, [
  body('theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be either light or dark'),
  body('notifications')
    .optional()
    .isBoolean()
    .withMessage('Notifications must be a boolean'),
  body('autoStartBreaks')
    .optional()
    .isBoolean()
    .withMessage('Auto start breaks must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { theme, notifications, autoStartBreaks } = req.body;
    const updateFields = {};

    if (theme !== undefined) updateFields['preferences.theme'] = theme;
    if (notifications !== undefined) updateFields['preferences.notifications'] = notifications;
    if (autoStartBreaks !== undefined) updateFields['preferences.autoStartBreaks'] = autoStartBreaks;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Preferences updated successfully',
      user
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Server error during preferences update' });
  }
});

// @route   GET /api/profile/achievements
// @desc    Get user achievements and milestones
// @access  Private
router.get('/achievements', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Calculate achievements based on user stats
    const achievements = [];

    // Study time achievements
    const totalStudyTime = req.user.totalStudyTime;
    if (totalStudyTime >= 60) achievements.push({ name: 'First Hour', description: 'Studied for 1 hour total' });
    if (totalStudyTime >= 300) achievements.push({ name: 'Dedicated Learner', description: 'Studied for 5 hours total' });
    if (totalStudyTime >= 600) achievements.push({ name: 'Study Master', description: 'Studied for 10 hours total' });

    // Session count achievements
    const totalSessions = req.user.totalSessions;
    if (totalSessions >= 5) achievements.push({ name: 'Getting Started', description: 'Completed 5 study sessions' });
    if (totalSessions >= 25) achievements.push({ name: 'Consistent Learner', description: 'Completed 25 study sessions' });
    if (totalSessions >= 100) achievements.push({ name: 'Study Champion', description: 'Completed 100 study sessions' });

    // Focus score achievements
    const avgFocusScore = req.user.averageFocusScore;
    if (avgFocusScore >= 70) achievements.push({ name: 'Focused Mind', description: 'Maintained 70% average focus score' });
    if (avgFocusScore >= 85) achievements.push({ name: 'Zen Master', description: 'Maintained 85% average focus score' });

    // Streak achievements (consecutive days)
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const dailySessions = await Session.aggregate([
      {
        $match: {
          user: userId,
          isCompleted: true,
          startTime: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
          count: { $sum: 1 }
        }
      }
    ]);

    const studyDays = dailySessions.length;
    if (studyDays >= 3) achievements.push({ name: 'Weekend Warrior', description: 'Studied for 3 days in a week' });
    if (studyDays >= 5) achievements.push({ name: 'Weekday Warrior', description: 'Studied for 5 days in a week' });
    if (studyDays >= 7) achievements.push({ name: 'Perfect Week', description: 'Studied every day for a week' });

    res.json({ achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 