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

// GET /api/projects/:id (get single project with ownership verification)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await storage.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Role-based access control: user must be the client, the creator, or an admin
    if (req.user.role !== 'admin') {
      const isClientOwner = project.clientId === req.user.id;
      const creatorProf = await storage.getCreatorById(req.user.id);
      const isCreatorOwner = project.creatorId === req.user.id || (creatorProf && (creatorProf.id === project.creatorId || creatorProf._id === project.creatorId));
      if (!isClientOwner && !isCreatorOwner) {
        return res.status(403).json({ success: false, message: 'Unauthorized. You do not have access to this project.' });
      }
    }

    return res.json({ success: true, project });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve project details.' });
  }
});

// POST /api/projects (Create project proposal - Clients only)
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'client' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only Client accounts can hire creators and book projects.' });
    }

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

    // Lookup creator to guarantee linking to actual creator user
    const targetCreator = await storage.getCreatorById(creatorId);
    const resolvedCreatorId = targetCreator?.userId || targetCreator?.id || targetCreator?._id || creatorId;
    const resolvedCreatorName = targetCreator?.name || creatorName || 'Creator';

    const newProject = await storage.createProject({
      title,
      description,
      clientId: req.user.id,
      clientName: req.user.name,
      creatorId: resolvedCreatorId,
      creatorName: resolvedCreatorName,
      category,
      budget: Number(budget),
      deadline,
      deliverables,
      status: 'Payment Pending',
      pendingAction: `Fund escrow to send proposal to ${resolvedCreatorName}`
    });

    // Automatically create a notification for the Creator about the booking request
    try {
      await storage.createNotification({
        userId: resolvedCreatorId,
        title: 'New Booking Request',
        message: `${req.user.name} submitted a booking request for "${title}" (${category}) with a budget of $${budget}.`,
        clientName: req.user.name,
        service: category,
        budget: Number(budget),
        deadline,
        projectId: newProject.id,
        bookingDate: new Date(),
        type: 'booking_request'
      });
    } catch (notifErr) {
      console.warn('Failed to dispatch creator notification on booking creation:', notifErr.message);
    }

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

// PUT /api/projects/:id/status (Transition status with role permissions)
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Payment Pending', 'Awaiting Creator', 'Requested', 'Accepted', 'Declined', 'In Progress', 'Under Review', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const project = await storage.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Role-based action authorization
    const isClient = req.user.role === 'client' && project.clientId === req.user.id;
    const creatorProf = await storage.getCreatorById(req.user.id);
    const isCreator = req.user.role === 'creator' && (project.creatorId === req.user.id || (creatorProf && (creatorProf.id === project.creatorId || creatorProf._id === project.creatorId)));
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isCreator && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. You are not a participant in this project.' });
    }

    // Creators accept or decline proposals, or submit deliverables for review
    if (['Accepted', 'Declined'].includes(status) && !isCreator && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the assigned creator can accept or decline this proposal.' });
    }

    // Creators move to Under Review when submitting deliverables
    if (status === 'Under Review' && !isCreator && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the assigned creator can submit deliverables for review.' });
    }

    // Clients approve & complete delivery
    if (status === 'Completed' && !isClient && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the client can approve deliverables and complete the project.' });
    }

    let pendingAction = project.pendingAction;
    if (status === 'Awaiting Creator') pendingAction = `Waiting for ${project.creatorName} to accept project proposal`;
    if (status === 'Accepted') pendingAction = 'Creator preparing production plan (In Progress soon)';
    if (status === 'In Progress') pendingAction = `Production underway (Deadline: ${project.deadline})`;
    if (status === 'Under Review') pendingAction = 'Client review in progress (Pending client approval)';
    if (status === 'Completed') pendingAction = 'Project completed and funds disbursed';
    if (status === 'Declined') pendingAction = 'Proposal declined by creator';

    const updated = await storage.updateProject(req.params.id, {
      status,
      pendingAction
    });

    // Notify Client when Creator accepts or declines their booking request
    try {
      if (status === 'Accepted') {
        await storage.createNotification({
          userId: project.clientId,
          title: 'Booking Request Accepted!',
          message: `${project.creatorName} accepted your project proposal for "${project.title}". Production is starting!`,
          projectId: project.id,
          type: 'booking_accepted'
        });
      } else if (status === 'Declined') {
        await storage.createNotification({
          userId: project.clientId,
          title: 'Booking Request Declined',
          message: `${project.creatorName} was unable to accept your project proposal for "${project.title}".`,
          projectId: project.id,
          type: 'booking_declined'
        });
      }
    } catch (e) {
      console.warn('Notification dispatch error:', e.message);
    }

    return res.json({
      success: true,
      message: `Project status updated to ${status}!`,
      project: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update project status.' });
  }
});

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch (err) {
    console.warn('Could not initialize Stripe:', err.message);
  }
}

// POST /api/projects/:id/create-stripe-session (Real Stripe Checkout Integration)
router.post('/:id/create-stripe-session', async (req, res) => {
  try {
    const project = await storage.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (!stripe && !process.env.STRIPE_SECRET_KEY) {
      return res.json({
        success: false,
        requiresSimulator: true,
        message: 'No STRIPE_SECRET_KEY set in backend/.env. Use the built-in 256-Bit Escrow Vault Simulator or provide your Stripe secret key.'
      });
    }

    const host = req.get('origin') || req.get('host') || 'http://localhost:5000';
    const baseUrl = host.startsWith('http') ? host : `http://${host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `NexusAI Escrow: ${project.title}`,
              description: `Hire ${project.creatorName} — 100% Escrow Protected Sprint`
            },
            unit_amount: Math.round(Number(project.budget) * 100)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${baseUrl}/checkout/${project.id}?stripe_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/${project.id}?stripe_cancel=true`,
      metadata: {
        projectId: project.id,
        creatorName: project.creatorName
      }
    });

    return res.json({
      success: true,
      url: session.url
    });
  } catch (err) {
    console.error('Stripe session creation error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to create Stripe session.' });
  }
});

// POST /api/projects/:id/pay (Client pays money/escrow — moves Payment Pending → In Progress)
router.post('/:id/pay', async (req, res) => {
  try {
    const { paymentMethod = 'Credit Card (Escrow)', cardLast4 = '4242' } = req.body;
    const project = await storage.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    if (project.status !== 'Payment Pending' && project.status !== 'Awaiting Creator') {
      return res.status(400).json({ success: false, message: 'Project is already funded or in progress.' });
    }

    const transactionId = 'TXN_ESCROW_' + Math.floor(100000 + Math.random() * 900000);
    const updated = await storage.updateProject(req.params.id, {
      status: 'In Progress', // Creator immediately starts work once paid!
      paidAt: new Date(),
      escrowFunded: true,
      transactionId,
      paymentMethod,
      cardLast4,
      pendingAction: `${project.creatorName} has received payment confirmation and started production sprints (Deadline: ${project.deadline})`
    });

    // Notify Creator that client paid and funded escrow
    try {
      await storage.createNotification({
        userId: project.creatorId,
        title: 'Escrow Funded & Booking Confirmed! 💰',
        message: `${project.clientName} funded the escrow ($${project.budget}) for "${project.title}". Production sprints are now live!`,
        projectId: project.id,
        type: 'escrow_funded'
      });
    } catch (e) {
      console.warn('Escrow payment notification error:', e.message);
    }

    return res.json({
      success: true,
      message: `Payment of $${project.budget} confirmed! Funds securely locked in Escrow. ${project.creatorName} has started work.`,
      project: updated,
      receipt: {
        transactionId,
        amount: project.budget,
        paymentMethod,
        cardLast4,
        escrowLocked: true,
        creatorName: project.creatorName,
        paidAt: new Date()
      }
    });
  } catch (err) {
    console.error('Payment processing error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process payment.' });
  }
});



// POST /api/projects/:id/revision (Request revision with feedback - Client only)
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

    // Only client or admin can request revisions
    if (req.user.role !== 'client' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only clients can request revisions on project deliverables.' });
    }
    if (project.clientId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized project.' });
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

// POST /api/projects/:id/files (Add deliverable file / attachment - Creator or Client)
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

// POST /api/projects/:id/feedback (Submit review - Client only)
router.post('/:id/feedback', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'client' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only clients can leave ratings and reviews.' });
    }

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
