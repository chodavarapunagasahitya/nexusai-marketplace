const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const { analyzeCreatorSkillRadar } = require('../services/skillRadarService');

// GET /api/skill-radar/:creatorId
router.get('/:creatorId', async (req, res) => {
  try {
    const creator = await storage.getCreatorById(req.params.creatorId);
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found.' });
    }

    const radarAnalysis = analyzeCreatorSkillRadar(creator);
    return res.json({
      success: true,
      data: radarAnalysis
    });
  } catch (err) {
    console.error('Skill radar error:', err);
    return res.status(500).json({ success: false, message: 'Skill radar analysis failed.' });
  }
});

module.exports = router;
