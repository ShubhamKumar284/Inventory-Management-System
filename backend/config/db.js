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
    await ensureDefaultCategories();
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

const ensureDefaultCategories = async () => {
  try {
    const Category = require('../models/Category');
    const count = await Category.countDocuments();
    if (count === 0) {
      const defaults = [
        { name: 'Hardware & Steel', description: 'Metals, steel sheets, structural items' },
        { name: 'Electronics', description: 'Computing, digital devices, and peripherals' },
        { name: 'Raw Materials', description: 'Manufacturing components and industrial stock' },
        { name: 'Office Supplies', description: 'Paper, stationery, and administration materials' },
        { name: 'Furniture', description: 'Desks, warehouse racking, and ergonomic seating' },
        { name: 'Tools & Equipment', description: 'Warehouse tools, machinery and maintenance items' },
        { name: 'Automotive Parts', description: 'Vehicle parts, lubricants, and tires' },
        { name: 'Clothing', description: 'Uniforms, protective gear, and textiles' }
      ];
      await Category.insertMany(defaults);
      console.log(`[SEED] Initialized ${defaults.length} default categories.`);
    }
  } catch (error) {
    console.error(`[SEED] Notice on categories verification: ${error.message}`);
  }
};

module.exports = connectDB;
