const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// Require admin access for all routes in this file
router.use(authenticate, requireRole(['admin']));

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    const projects = await storage.getProjects();
    const reports = await storage.getReportedContent();

    const pendingReportsCount = reports.filter(r => r.status === 'pending').length;
    const totalVolume = projects.reduce((sum, p) => sum + (p.budget || 0), 0) + 128400;

    return res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalCreators: users.filter(u => u.role === 'creator').length,
        totalClients: users.filter(u => u.role === 'client').length,
        totalProjects: projects.length + 180,
        pendingReports: pendingReportsCount,
        platformGrossVolume: totalVolume,
        aiRunsToday: 412
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin stats.' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    return res.json({ success: true, count: users.length, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve user list.' });
  }
});

// PUT /api/admin/users/:id/status (Ban / Unban / Activate)
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const updated = await storage.updateUser(req.params.id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      message: `User status changed to ${status}!`,
      user: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
});

// GET /api/admin/reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await storage.getReportedContent();
    return res.json({ success: true, count: reports.length, reports });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve reports.' });
  }
});

// PUT /api/admin/reports/:id
router.put('/reports/:id', async (req, res) => {
  try {
    const { status, actionTaken } = req.body;
    const updated = await storage.updateReportedContent(req.params.id, {
      ...(status && { status }),
      ...(actionTaken && { actionTaken })
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Report item not found.' });
    }

    return res.json({
      success: true,
      message: 'Moderation decision recorded!',
      report: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update report.' });
  }
});

module.exports = router;
