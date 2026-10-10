const express = require('express');
const router = express.Router();
const { analyzeAuthenticity } = require('../services/authenticityService');

// POST /api/authenticity/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Text content is required for authenticity analysis.' });
    }

    const report = analyzeAuthenticity(text);
    return res.json({
      success: true,
      report
    });
  } catch (err) {
    console.error('Authenticity analysis error:', err);
    return res.status(500).json({ success: false, message: 'Authenticity analysis failed.' });
  }
});

module.exports = router;
