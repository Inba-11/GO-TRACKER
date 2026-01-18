const mongoose = require('mongoose');

let retryCount = 0;
const MAX_RETRIES = 10;
const RETRY_DELAY = 5000; // 5 seconds

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/go-tracker', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📚 Database: ${conn.connection.name}`);
    
    // Reset retry count on successful connection
    retryCount = 0;
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      console.log('💡 Please start MongoDB: net start MongoDB (as Administrator)');
      console.log('🔄 Will attempt to reconnect...');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    retryCount++;
    
    console.error('\n❌ Database connection failed:', error.message);
    console.error('💡 Make sure MongoDB is running:');
    console.error('   1. Run as Administrator: net start MongoDB');
    console.error('   2. Or start from Services (services.msc → MongoDB Server)');
    
    if (retryCount < MAX_RETRIES) {
      console.error(`🔄 Retrying connection... (Attempt ${retryCount}/${MAX_RETRIES})`);
      console.error(`⏳ Waiting ${RETRY_DELAY / 1000} seconds before retry...\n`);
      
      // Retry connection after delay
      setTimeout(() => {
        connectDB();
      }, RETRY_DELAY);
    } else {
      console.error(`\n❌ Maximum retry attempts (${MAX_RETRIES}) reached.`);
      console.error('⚠️  Server will continue to run but database operations will fail.');
      console.error('💡 Please start MongoDB manually and the connection will retry automatically.\n');
      
      // Don't exit - let the server run and retry in background
      // Set up a longer retry interval for persistent retries
      setInterval(() => {
        if (mongoose.connection.readyState === 0) { // 0 = disconnected
          console.log('🔄 Attempting to reconnect to MongoDB...');
          retryCount = 0; // Reset for new batch of retries
          connectDB();
        }
      }, 30000); // Check every 30 seconds
    }
  }
};

module.exports = connectDB;