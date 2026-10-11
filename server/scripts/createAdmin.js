const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createOrUpdateAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }

    const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : '';
    const adminPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : '';
    const adminName = process.env.ADMIN_NAME ? process.env.ADMIN_NAME.trim() : 'System Administrator';

    // Validate presence of required credentials
    if (!adminEmail || !adminPassword) {
      throw new Error(
        'Missing required credentials. Both ADMIN_EMAIL and ADMIN_PASSWORD must be provided via environment variables.'
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      throw new Error('Invalid ADMIN_EMAIL format. Please provide a valid email address.');
    }

    // Password strength check (aligns with User model minlength of 6)
    if (adminPassword.length < 6) {
      throw new Error('ADMIN_PASSWORD must be at least 6 characters in length.');
    }

    // Block deprecated default development credentials
    const DEPRECATED_DEFAULT_EMAIL = 'admin@campusevents.com';
    const DEPRECATED_DEFAULT_PASSWORD = 'AdminPassword123';

    if (adminEmail === DEPRECATED_DEFAULT_EMAIL || adminPassword === DEPRECATED_DEFAULT_PASSWORD) {
      throw new Error(
        'Refusing to provision administrator with deprecated default development credentials. Please provide a secure, unique ADMIN_EMAIL and ADMIN_PASSWORD.'
      );
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully.');

    // Generate cryptographic salt and hash the plaintext password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      console.log(`User ${adminEmail} already exists. Updating role to 'admin' and refreshing credentials...`);
      existingUser.role = 'admin';
      existingUser.password = hashedPassword;
      if (adminName && adminName !== existingUser.name) {
        existingUser.name = adminName;
      }
      await existingUser.save();
      console.log(`✅ User ${adminEmail} successfully updated to role 'admin' with updated credentials.`);
    } else {
      console.log(`Creating new admin account for ${adminEmail}...`);
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
      console.log(`   - Password: [SECURED / HASHED]`);
    }
  } catch (error) {
    console.error(`❌ Error creating/updating admin: ${error.message}`);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    }
    process.exit(0);
  }
};

createOrUpdateAdmin();
