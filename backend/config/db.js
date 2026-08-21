const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows Node.js querySrv ECONNREFUSED with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  console.warn('Could not set custom DNS servers:', e.message);
}

const connectDB = async () => {
  let uri = process.env.MONGO_URI;

  try {
    if (!uri || uri.includes('<username>') || uri.includes('your_')) {
      throw new Error('No valid external MONGO_URI in .env');
    }

    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);

    // Auto-seed initial demo user and data if empty
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is fresh. Auto-seeding demo data...');
      const seedData = require('../seed/seedData');
      await seedData();
    }
  } catch (error) {
    console.warn(`⚠️ Atlas connection failed (${error.message}). Falling back to in-memory database...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`✨ In-Memory MongoDB Connected: ${conn.connection.host}`);

      // Seed in-memory DB immediately
      const seedData = require('../seed/seedData');
      await seedData();
      console.log('✅ Demo account ready: demo@hackquire.com / demo123');
    } catch (memErr) {
      console.error('CRITICAL: Failed to initialize in-memory database:', memErr.message);
    }
  }
};

module.exports = connectDB;
