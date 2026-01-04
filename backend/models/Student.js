const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const weeklyProgressSchema = new mongoose.Schema({
  week: { type: String, required: true }, // "Week 1", "Week 2", etc.
  codechef: { type: Number, default: 0 },
  hackerrank: { type: Number, default: 0 },
  leetcode: { type: Number, default: 0 },
  atcoder: { type: Number, default: 0 },
  codeforces: { type: Number, default: 0 },
  github: { type: Number, default: 0 }
}, { timestamps: true });

const platformStatsSchema = new mongoose.Schema({
  username: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  maxRating: { type: Number, default: 0 },
  problemsSolved: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  lastWeekRating: { type: Number, default: 0 },
  contests: { type: Number, default: 0 },
  contestsAttended: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const githubStatsSchema = new mongoose.Schema({
  username: { type: String, default: '' },
  repositories: { type: Number, default: 0 },
  contributions: { type: Number, default: 0 },
  commits: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
  lastWeekContributions: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const codolioStatsSchema = new mongoose.Schema({
  username: { type: String, default: '' },
  totalSubmissions: { type: Number, default: 0 },
  totalActiveDays: { type: Number, default: 0 },
  totalContests: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  maxStreak: { type: Number, default: 0 },
  dailySubmissions: [{
    date: String,
    count: Number
  }],
  badges: [{
    id: String,
    name: String,
    description: String,
    icon: String,
    earnedAt: String
  }],
  lastUpdated: { type: Date, default: Date.now }
});

const projectRepositorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, default: '' },
  addedAt: { type: Date, default: Date.now }
});

const studentSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: true
  },
  batch: { 
    type: String, 
    enum: ['A', 'B', 'C', 'D', 'NON-CRT'],
    required: true
  },
  department: { 
    type: String, 
    default: 'Computer Science & Business Systems'
  },
  year: { 
    type: Number, 
    default: 2
  },
  
  // Platform Links (from Excel)
  platformLinks: {
    leetcode: { type: String, default: '' },
    codechef: { type: String, default: '' },
    codeforces: { type: String, default: '' },
    github: { type: String, default: '' },
    codolio: { type: String, default: '' }
  },
  
  // Platform Usernames (extracted from URLs)
  platformUsernames: {
    leetcode: { type: String, default: '' },
    codechef: { type: String, default: '' },
    codeforces: { type: String, default: '' },
    github: { type: String, default: '' },
    codolio: { type: String, default: '' }
  },
  
  // Platform Statistics
  platforms: {
    codechef: platformStatsSchema,
    hackerrank: platformStatsSchema,
    leetcode: platformStatsSchema,
    atcoder: platformStatsSchema,
    codeforces: platformStatsSchema,
    github: githubStatsSchema,
    codolio: codolioStatsSchema
  },
  
  // Weekly Progress
  weeklyProgress: [weeklyProgressSchema],
  
  // Additional fields
  avatar: { type: String, default: '' },
  defaultAvatar: { type: String, default: 'spiderman' },
  resume: { type: String, default: null },
  projectRepositories: [projectRepositorySchema],
  
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

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
studentSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes for better performance
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ batch: 1 });
studentSchema.index({ 'platforms.leetcode.rating': -1 });
studentSchema.index({ 'platforms.codechef.rating': -1 });
studentSchema.index({ 'platforms.codeforces.rating': -1 });

// Virtual for total problems solved
studentSchema.virtual('totalProblems').get(function() {
  return (this.platforms.leetcode?.problemsSolved || 0) +
         (this.platforms.codechef?.problemsSolved || 0) +
         (this.platforms.codeforces?.problemsSolved || 0) +
         (this.platforms.hackerrank?.problemsSolved || 0) +
         (this.platforms.atcoder?.problemsSolved || 0);
});

// Method to check if data needs refresh (older than 1 hour)
studentSchema.methods.needsRefresh = function() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.lastScrapedAt < oneHourAgo;
};

// Method to add scraping error
studentSchema.methods.addScrapingError = function(platform, error) {
  this.scrapingErrors.push({ platform, error });
  // Keep only last 10 errors
  if (this.scrapingErrors.length > 10) {
    this.scrapingErrors = this.scrapingErrors.slice(-10);
  }
};

module.exports = mongoose.model('Student', studentSchema);

