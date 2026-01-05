#!/usr/bin/env node
/**
 * Production API Server for GO Tracker
 * Serves scraped data from MongoDB to React frontend
 * Real-time updates with 20-30 second polling
 */

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.API_PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/go-tracker';
const FRONTEND_URLS = (process.env.FRONTEND_URL || 'http://localhost:8084').split(',');

// Middleware
app.use(express.json());
app.use(cors({
    origin: FRONTEND_URLS,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// MongoDB connection
let db;
let client;

async function connectToMongoDB() {
    try {
        client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db('go-tracker');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: db ? 'connected' : 'disconnected'
    });
});

// Get all students with platform data
app.get('/api/students', async (req, res) => {
    try {
        const students = await db.collection('students').find({
            isActive: { $ne: false }
        }).toArray();

        // Transform data for frontend
        const transformedStudents = students.map(student => ({
            id: student._id,
            name: student.name,
            rollNumber: student.rollNumber,
            batch: student.batch,
            department: student.department,
            email: student.email,
            avatar: student.avatar,
            platforms: student.platforms || {},
            platformUsernames: student.platformUsernames || {},
            platformLinks: student.platformLinks || {},
            totalScore: calculateTotalScore(student.platforms || {}),
            lastUpdated: getLastUpdated(student.platforms || {})
        }));

        res.json({
            success: true,
            data: transformedStudents,
            count: transformedStudents.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch students data'
        });
    }
});

// Get single student data
app.get('/api/students/:id', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const student = await db.collection('students').findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        const transformedStudent = {
            id: student._id,
            name: student.name,
            rollNumber: student.rollNumber,
            batch: student.batch,
            department: student.department,
            email: student.email,
            avatar: student.avatar,
            platforms: student.platforms || {},
            platformUsernames: student.platformUsernames || {},
            platformLinks: student.platformLinks || {},
            totalScore: calculateTotalScore(student.platforms || {}),
            lastUpdated: getLastUpdated(student.platforms || {})
        };

        res.json({
            success: true,
            data: transformedStudent,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch student data'
        });
    }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const { platform = 'all', limit = 50 } = req.query;
        
        const students = await db.collection('students').find({
            isActive: { $ne: false }
        }).toArray();

        let leaderboard = students.map(student => {
            const platforms = student.platforms || {};
            let score = 0;
            let details = {};

            if (platform === 'all') {
                score = calculateTotalScore(platforms);
                details = {
                    leetcode: platforms.leetcode?.rating || 0,
                    codechef: platforms.codechef?.rating || 0,
                    codeforces: platforms.codeforces?.rating || 0,
                    github: platforms.github?.totalContributions || 0,
                    codolio: platforms.codolio?.totalActiveDays || 0
                };
            } else {
                const platformData = platforms[platform];
                if (platformData) {
                    switch (platform) {
                        case 'leetcode':
                        case 'codechef':
                        case 'codeforces':
                            score = platformData.rating || 0;
                            break;
                        case 'github':
                            score = platformData.totalContributions || 0;
                            break;
                        case 'codolio':
                            score = platformData.totalActiveDays || 0;
                            break;
                    }
                }
                details[platform] = score;
            }

            return {
                id: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                batch: student.batch,
                department: student.department,
                avatar: student.avatar,
                score,
                details,
                lastUpdated: getLastUpdated(platforms)
            };
        });

        // Sort by score (descending)
        leaderboard.sort((a, b) => b.score - a.score);

        // Add ranks
        leaderboard = leaderboard.slice(0, parseInt(limit)).map((student, index) => ({
            ...student,
            rank: index + 1
        }));

        res.json({
            success: true,
            data: leaderboard,
            platform,
            count: leaderboard.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch leaderboard data'
        });
    }
});

// Get system statistics
app.get('/api/stats', async (req, res) => {
    try {
        const totalStudents = await db.collection('students').countDocuments({
            isActive: { $ne: false }
        });

        // Count students with recent data for each platform
        const recentCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        
        const platforms = ['leetcode', 'codechef', 'codeforces', 'github', 'codolio'];
        const platformStats = {};

        for (const platform of platforms) {
            const recentCount = await db.collection('students').countDocuments({
                [`platforms.${platform}.lastUpdated`]: { $gte: recentCutoff }
            });
            
            platformStats[platform] = {
                recent_updates: recentCount,
                coverage_percent: totalStudents > 0 ? Math.round((recentCount / totalStudents) * 100 * 10) / 10 : 0
            };
        }

        // Get scraper logs summary
        const logsSummary = await db.collection('scraper_logs').aggregate([
            {
                $match: {
                    timestamp: { $gte: recentCutoff }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        const logsStats = {};
        logsSummary.forEach(log => {
            logsStats[log._id] = log.count;
        });

        res.json({
            success: true,
            data: {
                total_students: totalStudents,
                platforms: platformStats,
                scraper_logs: logsStats,
                last_updated: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch system statistics'
        });
    }
});

// Get scraper logs (for admin monitoring)
app.get('/api/logs', async (req, res) => {
    try {
        const { platform, status, limit = 100 } = req.query;
        
        const filter = {};
        if (platform) filter.platform = platform;
        if (status) filter.status = status;

        const logs = await db.collection('scraper_logs')
            .find(filter)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .toArray();

        res.json({
            success: true,
            data: logs,
            count: logs.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch scraper logs'
        });
    }
});

// Get platform-specific data
app.get('/api/platforms/:platform', async (req, res) => {
    try {
        const { platform } = req.params;
        const validPlatforms = ['leetcode', 'codechef', 'codeforces', 'github', 'codolio'];
        
        if (!validPlatforms.includes(platform)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid platform'
            });
        }

        const students = await db.collection('students').find({
            isActive: { $ne: false },
            [`platforms.${platform}`]: { $exists: true }
        }).toArray();

        const platformData = students.map(student => ({
            id: student._id,
            name: student.name,
            rollNumber: student.rollNumber,
            username: student.platformUsernames?.[platform] || '',
            data: student.platforms[platform] || {},
            lastUpdated: student.platforms[platform]?.lastUpdated
        })).filter(item => item.data && Object.keys(item.data).length > 0);

        res.json({
            success: true,
            platform,
            data: platformData,
            count: platformData.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`Error fetching ${req.params.platform} data:`, error);
        res.status(500).json({
            success: false,
            error: `Failed to fetch ${req.params.platform} data`
        });
    }
});

// Helper functions
function calculateTotalScore(platforms) {
    let score = 0;
    
    // LeetCode: rating * 1.0
    if (platforms.leetcode?.rating) {
        score += platforms.leetcode.rating * 1.0;
    }
    
    // CodeChef: rating * 1.0
    if (platforms.codechef?.rating) {
        score += platforms.codechef.rating * 1.0;
    }
    
    // Codeforces: rating * 1.0
    if (platforms.codeforces?.rating) {
        score += platforms.codeforces.rating * 1.0;
    }
    
    // GitHub: contributions * 0.1
    if (platforms.github?.totalContributions) {
        score += platforms.github.totalContributions * 0.1;
    }
    
    // Codolio: active days * 2.0
    if (platforms.codolio?.totalActiveDays) {
        score += platforms.codolio.totalActiveDays * 2.0;
    }
    
    return Math.round(score);
}

function getLastUpdated(platforms) {
    const dates = [];
    
    Object.values(platforms).forEach(platform => {
        if (platform?.lastUpdated) {
            dates.push(new Date(platform.lastUpdated));
        }
    });
    
    return dates.length > 0 ? new Date(Math.max(...dates)) : null;
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('API Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
async function startServer() {
    try {
        await connectToMongoDB();
        
        app.listen(PORT, () => {
            console.log(`🚀 GO Tracker API Server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
            console.log(`👥 Students API: http://localhost:${PORT}/api/students`);
            console.log(`🏆 Leaderboard API: http://localhost:${PORT}/api/leaderboard`);
            console.log(`📈 Stats API: http://localhost:${PORT}/api/stats`);
            console.log(`📝 Logs API: http://localhost:${PORT}/api/logs`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down API server...');
    if (client) {
        await client.close();
        console.log('✅ MongoDB connection closed');
    }
    process.exit(0);
});

// Start the server
startServer();