const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const { authenticate } = require('../middleware/authMiddleware');

// GET /api/projects (list projects for user)
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    if (req.user.role === 'client') {
      filter.clientId = req.user.id;
    } else if (req.user.role === 'creator') {
      filter.creatorId = req.user.id;
    }
    // Admins see all projects

    const projects = await storage.getProjects(filter);
    return res.json({ success: true, count: projects.length, projects });
  } catch (err) {
    console.error('Fetch projects error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve projects.' });
  }
});

// GET /api/projects/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await storage.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    return res.json({ success: true, project });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve project details.' });
  }
});

// POST /api/projects (Create project proposal)
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      creatorId,
      creatorName,
      category = 'General Content',
      budget,
      deadline,
      deliverables = []
    } = req.body;

    if (!title || !description || !creatorId || !budget || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, creator, budget, and deadline are required.'
      });
    }

    const newProject = await storage.createProject({
      title,
      description,
      clientId: req.user.id,
      clientName: req.user.name,
      creatorId,
      creatorName: creatorName || 'Creator',
      category,
      budget: Number(budget),
      deadline,
      deliverables,
      status: 'Requested',
      pendingAction: `Waiting for ${creatorName || 'creator'} to accept project proposal`
    });

    return res.status(201).json({
      success: true,
      message: 'Project proposal sent successfully!',
      project: newProject
    });
  } catch (err) {
    console.error('Create project error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create project.' });
  }
});

// PUT /api/projects/:id/status (Transition status: Requested -> Accepted -> In Progress -> Under Review -> Completed)
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Requested', 'Accepted', 'In Progress', 'Under Review', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const project = await storage.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    let pendingAction = project.pendingAction;
    if (status === 'Accepted') pendingAction = 'Creator preparing production plan (In Progress soon)';
    if (status === 'In Progress') pendingAction = `Production underway (Deadline: ${project.deadline})`;
    if (status === 'Under Review') pendingAction = 'Client review in progress (Pending client approval)';
    if (status === 'Completed') pendingAction = 'Project completed and funds disbursed';

    const updated = await storage.updateProject(req.params.id, {
      status,
      pendingAction
    });

    return res.json({
      success: true,
      message: `Project status updated to ${status}!`,
      project: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update project status.' });
  }
});

// POST /api/projects/:id/revision (Request revision with feedback)
router.post('/:id/revision', authenticate, async (req, res) => {
  try {
    const { feedback } = req.body;
    if (!feedback || feedback.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Feedback explanation is required for revision requests.' });
    }

    const project = await storage.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const revisions = project.revisions || [];
    revisions.push({
      id: 'rev_' + Date.now(),
      requestedBy: req.user.name,
      feedback,
      requestedAt: new Date(),
      status: 'pending'
    });

    const updated = await storage.updateProject(req.params.id, {
      revisions,
      status: 'In Progress',
      pendingAction: 'Creator addressing revision feedback from client'
    });

    return res.json({
      success: true,
      message: 'Revision requested submitted to creator.',
      project: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to submit revision request.' });
  }
});

// POST /api/projects/:id/deliverable-toggle
router.post('/:id/deliverable-toggle', authenticate, async (req, res) => {
  try {
    const { deliverableIndex } = req.body;
    const project = await storage.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const deliverables = [...project.deliverables];
    if (deliverables[deliverableIndex]) {
      deliverables[deliverableIndex].completed = !deliverables[deliverableIndex].completed;
    }

    const updated = await storage.updateProject(req.params.id, { deliverables });
    return res.json({ success: true, project: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle deliverable.' });
  }
});

// POST /api/projects/:id/files (Add deliverable file / attachment)
router.post('/:id/files', authenticate, async (req, res) => {
  try {
    const { name, size = '2.4 MB', url = '#' } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'File name is required.' });
    }

    const project = await storage.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const files = project.files || [];
    files.push({
      name,
      size,
      url,
      uploadedBy: req.user.name,
      uploadedAt: new Date()
    });

    const updated = await storage.updateProject(req.params.id, { files });
    return res.json({ success: true, message: 'File attached successfully!', project: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to attach file.' });
  }
});

// POST /api/projects/:id/feedback (Submit review)
router.post('/:id/feedback', authenticate, async (req, res) => {
  try {
    const { rating = 5, comment = '' } = req.body;
    const project = await storage.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const updated = await storage.updateProject(req.params.id, {
      feedback: {
        rating: Number(rating),
        comment,
        submittedAt: new Date()
      },
      status: 'Completed',
      pendingAction: 'Completed & Reviewed'
    });

    return res.json({ success: true, message: 'Feedback submitted successfully!', project: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

module.exports = router;
