const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const eventRoutes = require('./routes/eventRoutes');

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend client
app.use(cors({ origin: 'http://localhost:5173' }));

// Middleware to parse incoming JSON requests
app.use(express.json());

// Root Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Campus Event API is running'
  });
});

// Event API Routes
app.use('/api/events', eventRoutes);

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

