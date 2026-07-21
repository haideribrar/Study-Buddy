const express = require('express');
const cors = require('cors');
const config = require('./config/config');

// Import routers
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

// Middlewares
app.use(cors()); // Allow requests from React Native apps
app.use(express.json()); // Body parser

// Basic Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    configured: config.isConfigured()
  });
});

// Register API Routers
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/events', eventRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(config.port, () => {
  console.log(`=========================================`);
  console.log(` StudyBuddy Backend Service Started      `);
  console.log(` Port: ${config.port}                     `);
  console.log(` Health Check: http://localhost:${config.port}/health `);
  console.log(` Configuration Loaded: ${config.isConfigured() ? 'SUCCESS' : 'WARNING (Using templates)'} `);
  console.log(`=========================================`);
});
