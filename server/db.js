// db.js - Connect to MongoDB Atlas
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect using the URI from environment variables
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1); // Stop server if DB fails
  }
};

module.exports = connectDB;
