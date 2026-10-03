const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    // Force Node to use Google DNS for SRV resolution
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
