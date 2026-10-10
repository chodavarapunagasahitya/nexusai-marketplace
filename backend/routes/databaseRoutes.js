const express = require('express');
const router = express.Router();
const storage = require('../services/storage');

// GET /api/database/status
router.get('/status', async (req, res) => {
  try {
    const stats = await storage.getDatabaseStats();
    return res.json({ success: true, ...stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/database/reseed
router.post('/reseed', async (req, res) => {
  try {
    const stats = await storage.reseedDataset();
    return res.json({
      success: true,
      message: 'Dataset successfully reseeded and synced across all collections!',
      stats
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/database/connect-mongo
router.post('/connect-mongo', async (req, res) => {
  try {
    const { mongoUri } = req.body;
    if (!mongoUri) {
      return res.status(400).json({ success: false, message: 'Please provide a MongoDB connection URI.' });
    }
    const result = await storage.connectMongoDB(mongoUri);
    const stats = await storage.getDatabaseStats();
    return res.json({
      success: true,
      message: result.message,
      stats
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/database/dataset
router.get('/dataset', async (req, res) => {
  try {
    const dataset = await storage.getFullDataset();
    return res.json({
      success: true,
      datasetTitle: 'NexusAI Creator Marketplace Master Dataset',
      exportedAt: new Date(),
      dataset
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
