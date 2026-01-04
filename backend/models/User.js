const mongoose = require('mongoose');

const weeklyProgressSchema = new mongoose.Schema({
  week: { type: Date, required: true },
  platforms: {
    leetcode: {
      problemsSolved: { type: Number, default: 0 },
      rating: { type: Number, default: 0 }
    },
    codechef: {
      problemsSolved: { type: Number, default: 0 },
      rating: { type: Number, default: 0 }
    },
    codeforces: {
      problemsSolved: { type: Number, default: 0 },
      rating: { type: Number, default: 0 }
    },
    github: {
      contributions: { type: Number, default: 0 }
    }
  }
});

const platformStatsSchema = new mongoose.Schema({
  username: { type: String, required: true },
  rating: { type: Number, default: 0 },
  maxRating: { type: Number, default: 0 },
  problemsSolved: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  contests: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const githubStatsSchema = new mongoose.Schema({
  username: { type: String, required: true },
  contributions: { type: Number, default: 0 },
  repositories: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const codolioStatsSchema = new mongoose.Schema({
  username: { type: String, required: true },
  totalSubmissions: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  maxStreak: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  rollNumber: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  batch: { 
    type: String, 
    enum: ['A', 'B', 'C', 'D', 'NON-CRT'],
    required: true
  },
  department: { 
    type: String, 
    default: 'Computer Science'
  },
  year: { 
    type: Number, 
    default: 3
  },
  
  // Platform Usernames
  platformUsernames: {
    leetcode: { type: String, trim: true },
    codechef: { type: String, trim: true },
    codeforces: { type: String, trim: true },
    github: { type: String, trim: true },
    codolio: { type: String, trim: true }
  },

  // Platform URLs
  platformUrls: {
    leetcode: { type: String, trim: true },
    codechef: { type: String, trim: true },
    codeforces: { type: String, trim: true },
    github: { type: String, trim: true },
    codolio: { type: String, trim: true }
  },

  // Platform Statistics
  platforms: {
    leetcode: platformStatsSchema,
    codechef: platformStatsSchema,
    codeforces: platformStatsSchema,
    github: githubStatsSchema,
    codolio: codolioStatsSchema
  },

  // Weekly Progress Tracking
  weeklyProgress: [weeklyProgressSchema],

  // Metadata
  isActive: { type: Boolean, default: true },
  lastScrapedAt: { type: Date, default: Date.now },
  scrapingErrors: [{
    platform: String,
    error: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ rollNumber: 1 });
userSchema.index({ email: 1 });
userSchema.index({ batch: 1 });
userSchema.index({ 'platforms.leetcode.rating': -1 });
userSchema.index({ 'platforms.codechef.rating': -1 });
userSchema.index({ 'platforms.codeforces.rating': -1 });

// Virtual for total problems solved
userSchema.virtual('totalProblems').get(function() {
  return (this.platforms.leetcode?.problemsSolved || 0) +
         (this.platforms.codechef?.problemsSolved || 0) +
         (this.platforms.codeforces?.problemsSolved || 0);
});

// Method to check if data needs refresh (older than 1 hour)
userSchema.methods.needsRefresh = function() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.lastScrapedAt < oneHourAgo;
};

// Method to add scraping error
userSchema.methods.addScrapingError = function(platform, error) {
  this.scrapingErrors.push({ platform, error });
  // Keep only last 10 errors
  if (this.scrapingErrors.length > 10) {
    this.scrapingErrors = this.scrapingErrors.slice(-10);
  }
};

module.exports = mongoose.model('User', userSchema);