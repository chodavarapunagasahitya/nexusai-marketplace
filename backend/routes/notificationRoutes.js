const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const { authenticate } = require('../middleware/authMiddleware');

// GET /api/notifications (Fetch notifications for current user)
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await storage.getNotifications(req.user.id);
    return res.json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.read).length,
      notifications
    });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
});

// PUT /api/notifications/:id/read (Mark single notification as read)
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const updated = await storage.markNotificationRead(req.params.id, req.user.id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    return res.json({ success: true, notification: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
});

// PUT /api/notifications/read-all (Mark all notifications as read)
router.put('/read-all', authenticate, async (req, res) => {
  try {
    await storage.markAllNotificationsRead(req.user.id);
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to mark all notifications read.' });
  }
});

module.exports = router;
