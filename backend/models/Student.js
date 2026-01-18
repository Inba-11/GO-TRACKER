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
  rank: { type: mongoose.Schema.Types.Mixed, default: 0 }, // Changed to Mixed to handle both numbers and strings
  globalRank: { type: Number, default: 0 }, // Added for INBATAMIZHAN P
  stars: { type: Number, default: 0 }, // Added for INBATAMIZHAN P
  country: { type: String, default: '' }, // Added for INBATAMIZHAN P
  institution: { type: String, default: '' }, // Added for INBATAMIZHAN P
  league: { type: String, default: '' }, // Added for INBATAMIZHAN P (Bronze League, etc.)
  studentType: { type: String, default: '' }, // Added for INBATAMIZHAN P (Student/Professional)
  contestList: [{ type: String }], // Added for INBATAMIZHAN P contest history
  lastWeekRating: { type: Number, default: 0 },
  contests: { type: Number, default: 0 },
  contestsAttended: { type: Number, default: 0 },
  totalContests: { type: Number, default: 0 }, // Total contests participated (scraped from profile)
  contestCountUpdatedAt: { type: String, default: '' }, // When contest count was last updated
  // LeetCode specific fields
  easySolved: { type: Number, default: 0 },
  mediumSolved: { type: Number, default: 0 },
  hardSolved: { type: Number, default: 0 },
  ranking: { type: Number, default: 0 },
  reputation: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },
  acceptanceRate: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  totalActiveDays: { type: Number, default: 0 },
  badges: [{ type: mongoose.Schema.Types.Mixed }],
  activeBadge: { type: mongoose.Schema.Types.Mixed },
  recentSubmissions: [{ type: mongoose.Schema.Types.Mixed }],
  // Codeforces specific fields
  maxRank: { type: String, default: '' },
  totalSolved: { type: Number, default: 0 },
  acceptedSubmissions: { type: Number, default: 0 },
  recentContests: [{ type: mongoose.Schema.Types.Mixed }],
  contestHistory: [{ 
    contestCode: { type: String, default: '' },
    name: { type: String, default: '' },
    date: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    ratingChange: { type: Number, default: 0 },
    problemsSolved: [{ type: String }],
    problemsCount: { type: Number, default: 0 },
    attended: { type: Boolean, default: true }
  }],
  // CodeChef specific submission and stats fields
  submissionHeatmap: [{ 
    date: { type: String },
    count: { type: Number },
    category: { type: Number }
  }],
  submissionByDate: { type: mongoose.Schema.Types.Mixed, default: {} },
  submissionStats: {
    daysWithSubmissions: { type: Number, default: 0 },
    maxDailySubmissions: { type: Number, default: 0 },
    avgDailySubmissions: { type: Number, default: 0 }
  },
  fullySolved: { type: Number, default: 0 },
  partiallySolved: { type: Number, default: 0 },
  ratingChangeLastContest: { type: Number, default: 0 },
  avgProblemRating: { type: Number, default: 0 },
  recentSolved: { type: Number, default: 0 },
  city: { type: String, default: '' },
  organization: { type: String, default: '' },
  contribution: { type: Number, default: 0 },
  friendOfCount: { type: Number, default: 0 },
  lastOnlineTime: { type: Date },
  registrationTime: { type: Date },
  updatedAt: { type: Date },
  dataSource: { type: String, default: '' },
  lastUpdated: { type: Date, default: Date.now }
});

const githubStatsSchema = new mongoose.Schema({
  username: { type: String, default: '' },
  repositories: { type: Number, default: 0 },
  contributions: { type: Number, default: 0 },
  commits: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  lastWeekContributions: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  company: { type: String, default: '' },
  created_at: { type: String, default: '' },
  totalStars: { type: Number, default: 0 },
  totalForks: { type: Number, default: 0 },
  contributionCalendar: [{
    date: { type: String },
    count: { type: Number }
  }],
  pinnedRepositories: [{
    name: { type: String },
    description: { type: String },
    url: { type: String },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    language: { type: String, default: '' },
    languageColor: { type: String, default: '' },
    updatedAt: { type: String, default: '' },
    isPrivate: { type: Boolean, default: false }
  }],
  dataSource: { type: String, default: '' },
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
  // Use 12 rounds for better security (recommended minimum)
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
studentSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes for better performance
// Note: rollNumber and email indexes are automatically created by unique: true constraint
studentSchema.index({ batch: 1 });
studentSchema.index({ isActive: 1 });
studentSchema.index({ lastScrapedAt: 1 }); // For scheduler queries
studentSchema.index({ 'platforms.leetcode.rating': -1 });
studentSchema.index({ 'platforms.codechef.rating': -1 });
studentSchema.index({ 'platforms.codeforces.rating': -1 });
// Compound indexes for common queries
studentSchema.index({ batch: 1, 'platforms.leetcode.rating': -1 });
studentSchema.index({ batch: 1, 'platforms.codechef.rating': -1 });
studentSchema.index({ batch: 1, 'platforms.codeforces.rating': -1 });
studentSchema.index({ isActive: 1, batch: 1 }); // For filtered queries
// Index for platform update timestamps (used by scheduler)
studentSchema.index({ 'platforms.leetcode.updatedAt': 1 });
studentSchema.index({ 'platforms.codechef.updatedAt': 1 });
studentSchema.index({ 'platforms.codeforces.updatedAt': 1 });
studentSchema.index({ 'platforms.github.updatedAt': 1 });
studentSchema.index({ 'platforms.codolio.updatedAt': 1 });

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

