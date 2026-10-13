const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const storage = require('./services/storage');

const authRoutes = require('./routes/authRoutes');
const creatorRoutes = require('./routes/creatorRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authenticityRoutes = require('./routes/authenticityRoutes');
const skillRadarRoutes = require('./routes/skillRadarRoutes');
const projectRoutes = require('./routes/projectRoutes');
const messageRoutes = require('./routes/messageRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const databaseRoutes = require('./routes/databaseRoutes');
const liveDataRoutes = require('./routes/liveDataRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    database: storage.isMongoConnected() ? 'mongodb' : 'fallback-persistent-store',
    service: 'NexusAI Creator Marketplace API'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/authenticity', authenticityRoutes);
app.use('/api/skill-radar', skillRadarRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/live-data', liveDataRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve frontend static production bundle
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// React SPA router fallback for non-API requests
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

// Database Connection with graceful fallback
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nexus_ai_creator_marketplace';
  try {
    console.log(`Connecting to database at ${mongoUri.split('@').pop()}...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });
    console.log('✅ MongoDB connected successfully!');
    await storage.seedMongoIfNeeded();
  } catch (err) {
    console.log('ℹ️ MongoDB server not detected locally or connection timed out.');
    console.log('⚡ Switched to resilient built-in storage engine with rich sample marketplace data.');
  }
};

// Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 NexusAI Marketplace Backend running on port ${PORT}`);
    console.log(`📍 Healthcheck: http://localhost:${PORT}/api/health`);
  });
};

startServer();

module.exports = app;
