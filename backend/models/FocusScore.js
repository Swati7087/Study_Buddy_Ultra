const mongoose = require('mongoose');

const focusScoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  score: {
    type: Number,
    required: true,
    min: [0, 'Focus score must be between 0 and 100'],
    max: [100, 'Focus score must be between 0 and 100']
  },
  factors: {
    distractions: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    energy: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    },
    motivation: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    },
    environment: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'neutral', 'poor', 'terrible'],
    default: 'neutral'
  },
  activity: {
    type: String,
    enum: ['reading', 'writing', 'problem-solving', 'reviewing', 'other'],
    default: 'other'
  }
}, {
  timestamps: true
});

// Calculate overall score based on factors
focusScoreSchema.pre('save', function(next) {
  if (this.isModified('factors')) {
    const { distractions, energy, motivation, environment } = this.factors;
    const baseScore = (energy + motivation + environment) / 3;
    const distractionPenalty = distractions * 2;
    this.score = Math.max(0, Math.min(100, Math.round(baseScore * 10 - distractionPenalty)));
  }
  next();
});

// Virtual for score category
focusScoreSchema.virtual('scoreCategory').get(function() {
  if (this.score >= 80) return 'excellent';
  if (this.score >= 60) return 'good';
  if (this.score >= 40) return 'average';
  if (this.score >= 20) return 'poor';
  return 'very-poor';
});

// Virtual for color based on score
focusScoreSchema.virtual('scoreColor').get(function() {
  if (this.score >= 80) return 'green';
  if (this.score >= 60) return 'blue';
  if (this.score >= 40) return 'yellow';
  if (this.score >= 20) return 'orange';
  return 'red';
});

// Index for better query performance
focusScoreSchema.index({ user: 1, session: 1, timestamp: -1 });
focusScoreSchema.index({ user: 1, timestamp: -1 });

// Ensure virtual fields are serialized
focusScoreSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('FocusScore', focusScoreSchema); 