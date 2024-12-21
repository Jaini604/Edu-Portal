// db.js
const mongoose = require('mongoose');

// MongoDB connection URI
const MONGO_URI = 'mongodb://127.0.0.1:27017/UNION';


// Function to connect to the database
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
