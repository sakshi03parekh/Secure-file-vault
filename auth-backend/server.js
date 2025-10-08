const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');

// Initialize express
const app = express();

// Middleware
app.use(cors({
  exposedHeaders: [
    'X-Algorithm',
    'X-IV-Base64',
    'X-Salt-Base64',
    'X-Key-Base64',
    'X-Encrypted-Key-Base64',
    'X-Key-Wrap'
  ]
})); // Enable CORS for all routes and expose custom headers
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/auth', authRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Auth API is working!' });
});
// Add this to your server.js
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/authapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log(err));

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});