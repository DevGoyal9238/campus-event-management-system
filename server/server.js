const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Root Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Campus Event API is running'
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
