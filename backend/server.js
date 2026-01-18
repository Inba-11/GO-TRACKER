require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const statsRoutes = require('./routes/statsRoutes');
const scrapingRoutes = require('./routes/scrapingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');
const Student = require('./models/Student');
const scraperService = require('./services/scraperService');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(compression()); // Compress all responses
app.use(morgan('combined'));

// CORS configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (curl, server-to-server, etc.) and file:// protocol for testing
    if (!origin) return callback(null, true);

    // Parse multiple frontend URLs from environment variable
    const frontendUrls = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(url => url.trim()) : [];
    
    const allowedOrigins = new Set([
      ...frontendUrls,
      // Development only origins
      ...(isDevelopment ? [
        'http://localhost:5173',
        'http://localhost:8080',
        'http://localhost:8081',
        'http://localhost:8082',
        'http://localhost:8083',
        'http://localhost:8084',
        'http://localhost:8085',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:8081',
        'http://127.0.0.1:8082',
        'http://127.0.0.1:8083',
        'http://127.0.0.1:8084',
        'http://127.0.0.1:8085',
        'null' // Allow file:// protocol for local testing
      ] : [])
    ].filter(Boolean));

    if (allowedOrigins.has(origin)) return callback(null, true);

    // Allow private network IPs ONLY in development
    if (isDevelopment) {
      const privateIpOriginRegex = /^http:\/\/(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(?::\d+)?$/;
      if (privateIpOriginRegex.test(origin)) return callback(null, true);
    }

    console.log(`CORS blocked origin: ${origin}`);
    if (isDevelopment) {
      console.log(`Allowed origins:`, Array.from(allowedOrigins));
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true
}));

// Rate limiting - General API
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Rate limiting - Stricter for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per 15 minutes
  message: {
    success: false,
    error: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Go Tracker API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
const manualUpdateRoutes = require('./routes/manualUpdateRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/scraping', scrapingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manual-update', manualUpdateRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Go Tracker API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      stats: '/api/stats',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Scheduled tasks
if (process.env.NODE_ENV === 'production') {
  // Auto-scrape all users every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('Starting scheduled scraping of all users...');
    try {
      const students = await Student.find({ isActive: true });
      for (const student of students) {
        if (student.needsRefresh()) {
          console.log(`Auto-scraping ${student.name}`);
          const { results, errors } = await scraperService.scrapeAllPlatforms(student);
          
          // Update student with scraped data
          if (results.leetcode) student.platforms.leetcode = results.leetcode;
          if (results.codechef) student.platforms.codechef = results.codechef;
          if (results.codeforces) student.platforms.codeforces = results.codeforces;
          if (results.github) student.platforms.github = results.github;
          if (results.codolio) student.platforms.codolio = results.codolio;

          errors.forEach(error => {
            student.addScrapingError(error.platform, error.error);
          });

          student.lastScrapedAt = new Date();
          await student.save();
          
          // Add delay between users to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      console.log('Scheduled scraping completed');
    } catch (error) {
      console.error('Scheduled scraping error:', error);
    }
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 Go Tracker API Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Health Check: http://localhost:${PORT}/health
📚 API Docs: http://localhost:${PORT}/
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;
