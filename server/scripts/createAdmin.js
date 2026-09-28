const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createOrUpdateAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully.');

    // Development Admin Credentials (Must be changed in production)
    const adminEmail = 'admin@campusevents.com';
    const adminPassword = 'AdminPassword123';
    const adminName = 'System Administrator';

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      console.log(`User ${adminEmail} already exists. Updating role to 'admin'...`);
      existingUser.role = 'admin';
      await existingUser.save();
      console.log(`✅ User ${adminEmail} successfully updated to role 'admin'.`);
    } else {
      console.log(`Creating new admin account: ${adminEmail}...`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const adminUser = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });

      console.log(`✅ Admin user created successfully:`);
      console.log(`   - Name: ${adminUser.name}`);
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Role: ${adminUser.role}`);
      console.log(`   - Password: ${adminPassword} (Development password)`);
    }
  } catch (error) {
    console.error(`❌ Error creating/updating admin: ${error.message}`);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  }
};

createOrUpdateAdmin();
