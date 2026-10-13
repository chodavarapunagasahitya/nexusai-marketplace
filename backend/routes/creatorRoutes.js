const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const { authenticate } = require('../middleware/authMiddleware');

// GET /api/creators (search & filter — for clients and visitors)
router.get('/', async (req, res) => {
  try {
    // If bearer token is provided and user is a creator, disallow browsing marketplace
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = require('../middleware/authMiddleware');
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.role === 'creator') {
          return res.status(403).json({
            success: false,
            message: 'Access denied. The Creator Marketplace is reserved for Client accounts to browse and hire talent.'
          });
        }
      } catch (e) {
        // Token invalid, proceed as guest
      }
    }

    const { category, search, maxBudget, minRating, availability, language } = req.query;
    const creators = await storage.getCreators({
      category,
      search,
      maxBudget,
      minRating,
      availability,
      language
    });
    return res.json({ success: true, count: creators.length, creators });
  } catch (err) {
    console.error('Fetch creators error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve creators.' });
  }
});

// GET /api/creators/:id
router.get('/:id', async (req, res) => {
  try {
    const creator = await storage.getCreatorById(req.params.id);
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found.' });
    }
    return res.json({ success: true, creator });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve creator profile.' });
  }
});

// POST /api/creators/favorite/:id
router.post('/favorite/:id', authenticate, async (req, res) => {
  try {
    const creatorId = req.params.id;
    const updatedUser = await storage.toggleFavorite(req.user.id, creatorId);
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const isFavorited = (updatedUser.favorites || []).includes(creatorId);
    return res.json({
      success: true,
      message: isFavorited ? 'Added to favorites!' : 'Removed from favorites',
      favorites: updatedUser.favorites,
      isFavorited
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update favorite status.' });
  }
});

// PUT /api/creators/profile (update creator's own profile)
router.put('/profile', authenticate, async (req, res) => {
  try {
    const profile = await storage.createOrUpdateCreatorProfile(req.user.id, req.body);
    return res.json({ success: true, message: 'Creator profile updated successfully!', profile });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update creator profile.' });
  }
});

module.exports = router;
