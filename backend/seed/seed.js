require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const seedData = require('./seedData');

const runSeed = async () => {
  try {
    await connectDB();
    await seedData();
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

runSeed();
