const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register a new user with hashed password
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate that name, email, and password are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email and password'
      });
    }

    // Check whether a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Generate cryptographic salt and hash the plaintext password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with hashed password and server-controlled role
    const createdUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    // Return 201 Created without returning the password
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role || 'user',
        createdAt: createdUser.createdAt
      }
    });
  } catch (error) {
    console.error(`Error registering user: ${error.message}`);

    // Handle MongoDB duplicate key error (E11000)
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: error.message
      });
    }

    // Return 500 Internal Server Error for unexpected server errors
    res.status(500).json({
      message: 'Server error while registering user'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and return JWT token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate that email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password'
      });
    }

    // Find the user by email in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Compare supplied plaintext password with stored bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token with userId and role payload and 7-day expiration
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return HTTP 200 with token and user profile details (never password)
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error(`Error logging in: ${error.message}`);

    // Return 500 Internal Server Error for unexpected server errors
    res.status(500).json({
      message: 'Server error while logging in'
    });
  }
});

module.exports = router;
