const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Owner = require('../models/Owner');

// Validate JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET environment variable is required!');
  console.error('Please set JWT_SECRET in your .env file');
  process.exit(1);
}

// Generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Please provide identifier, password, and role'
      });
    }

    let user = null;
    let userData = null;

    if (role === 'student') {
      // Find student by name (case-insensitive) or roll number
      user = await Student.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${identifier}$`, 'i') } },
          { rollNumber: identifier }
        ],
        isActive: true
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      userData = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: 'student',
        studentData: user
      };
    } else if (role === 'staff') {
      user = await Staff.findOne({
        username: { $regex: new RegExp(`^${identifier}$`, 'i') }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      userData = {
        id: user._id,
        email: user.email || `${user.username}@bytebuster.edu`,
        name: user.name || user.username,
        role: 'staff'
      };
    } else if (role === 'owner') {
      user = await Owner.findOne({
        email: identifier.toLowerCase()
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      userData = {
        id: user._id,
        email: user.email,
        role: 'owner'
      };
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    const token = generateToken({
      id: userData.id,
      email: userData.email,
      role: userData.role
    });

    res.json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    
    // Check if it's a MongoDB connection error
    if (error.name === 'MongoServerSelectionError' || 
        error.name === 'MongoNetworkError' ||
        error.name === 'MongoNetworkTimeoutError' ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('MongoNetworkTimeoutError')) {
      console.error('❌ MongoDB Connection Error: Database is not accessible');
      console.error('💡 Please start MongoDB: net start MongoDB (run as Administrator)');
      return res.status(503).json({  // 503 Service Unavailable is more appropriate
        success: false,
        error: 'Database connection failed. Please ensure MongoDB is running.'
      });
    }
    
    // Don't expose internal error messages to clients in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const errorMessage = isDevelopment 
      ? error.message 
      : 'Internal server error during login';
    
    res.status(500).json({
      success: false,
      error: errorMessage || 'Internal server error during login'
    });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const { id, role } = req.user;

    let user = null;

    if (role === 'student') {
      user = await Student.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      return res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: 'student',
            studentData: user
          }
        }
      });
    } else if (role === 'staff') {
      user = await Staff.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      return res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email || `${user.username}@bytebuster.edu`,
            name: user.name || user.username,
            role: 'staff'
          }
        }
      });
    } else if (role === 'owner') {
      user = await Owner.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      return res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            role: 'owner'
          }
        }
      });
    }

    res.status(400).json({
      success: false,
      error: 'Invalid role'
    });
  } catch (error) {
    console.error('Get me error:', error);
    console.error('Error stack:', error.stack);
    
    // Check if it's a MongoDB connection error
    if (error.name === 'MongoServerSelectionError' || 
        error.name === 'MongoNetworkError' ||
        error.name === 'MongoNetworkTimeoutError' ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('MongoNetworkTimeoutError')) {
      console.error('❌ MongoDB Connection Error: Database is not accessible');
      return res.status(503).json({
        success: false,
        error: 'Database connection failed. Please ensure MongoDB is running.'
      });
    }
    
    // Don't expose internal error messages to clients in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const errorMessage = isDevelopment 
      ? error.message 
      : 'Internal server error';
    
    res.status(500).json({
      success: false,
      error: errorMessage || 'Internal server error'
    });
  }
};

// GET /api/auth/staff/usernames
const getStaffUsernames = async (req, res) => {
  try {
    const staffMembers = await Staff.find({}, 'username name').sort({ username: 1 });
    
    const usernames = staffMembers.map(staff => ({
      username: staff.username,
      name: staff.name || staff.username
    }));

    res.json({
      success: true,
      data: usernames
    });
  } catch (error) {
    console.error('Get staff usernames error:', error);
    console.error('Error stack:', error.stack);
    
    // Check if it's a MongoDB connection error
    if (error.name === 'MongoServerSelectionError' || 
        error.name === 'MongoNetworkError' ||
        error.name === 'MongoNetworkTimeoutError' ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('MongoNetworkTimeoutError')) {
      console.error('❌ MongoDB Connection Error: Database is not accessible');
      return res.status(503).json({
        success: false,
        error: 'Database connection failed. Please ensure MongoDB is running.'
      });
    }
    
    // Don't expose internal error messages to clients in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const errorMessage = isDevelopment 
      ? error.message 
      : 'Internal server error';
    
    res.status(500).json({
      success: false,
      error: errorMessage || 'Internal server error'
    });
  }
};

module.exports = {
  login,
  getMe,
  getStaffUsernames
};
