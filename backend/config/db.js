const mongoose = require('mongoose');
const dns = require('dns');

const ensureAdminUser = async () => {
  try {
    const User = require('../models/User');
    const adminEmail = 'admin@example.com';
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: 'password123',
        role: 'ADMIN'
      });
      console.log(`[SEED] Default Admin initialized (${adminEmail} / password123)`);
    } else {
      const match = await admin.matchPassword('password123');
      if (!match) {
        admin.password = 'password123';
        await admin.save();
        console.log(`[SEED] Default Admin password synchronized to 'password123'`);
      }
    }
  } catch (error) {
    console.error(`[SEED] Notice on admin verification: ${error.message}`);
  }
};

const connectDB = async () => {
  try {
    // Force Node to use Google DNS for SRV resolution
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await ensureAdminUser();
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
