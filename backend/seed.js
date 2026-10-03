require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedAdmin = async () => {
  try {
    await connectDB();
    
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (adminExists) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: 'password123',
      role: 'ADMIN'
    });

    console.log(`Default Admin created successfully!`);
    console.log(`Email: ${admin.email}`);
    console.log(`Password: password123`);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
