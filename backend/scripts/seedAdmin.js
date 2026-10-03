require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    const adminEmail = 'admin@system.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit();
    }

    // Create the default admin
    const adminUser = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'adminpassword123', // Will be hashed automatically by the pre-save hook in User model
      role: 'ADMIN'
    });

    console.log(`Admin user created successfully!`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: adminpassword123`);
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
