const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Set HTTP security headers with helmet
// Note: contentSecurityPolicy is disabled because this is a decoupled JSON REST API.
// crossOriginResourcePolicy is set to 'cross-origin' to allow the separate deployed frontend (e.g. Vercel) to consume API responses.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// Configure allowed origins for CORS
const allowedOrigins = ['http://localhost:5173'];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

// Enable CORS with dynamic origin validation
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header (e.g. mobile apps, curl, Postman, health check pings)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true
  })
);

// Middleware to parse incoming JSON requests
app.use(express.json());

// Root Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Campus Event API is running'
  });
});

// API Routes
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

