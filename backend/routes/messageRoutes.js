const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const { authenticate } = require('../middleware/authMiddleware');

// GET /api/messages/conversations
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const convs = await storage.getAllUserConversations(req.user.id);
    return res.json({ success: true, count: convs.length, conversations: convs });
  } catch (err) {
    console.error('Fetch conversations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve conversations.' });
  }
});

// GET /api/messages/:conversationId
router.get('/:conversationId', authenticate, async (req, res) => {
  try {
    const messages = await storage.getMessages(req.params.conversationId);
    return res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve messages.' });
  }
});

// POST /api/messages
router.post('/', authenticate, async (req, res) => {
  try {
    const { conversationId, receiverId, text, projectId = null, attachment = null } = req.body;

    if (!text || (!conversationId && !receiverId)) {
      return res.status(400).json({ success: false, message: 'Text and recipient/conversation are required.' });
    }

    // Determine or construct conversationId
    let finalConvId = conversationId;
    if (!finalConvId && receiverId) {
      finalConvId = [req.user.id, receiverId].sort().join('_conv_');
    }

    const newMsg = await storage.createMessage({
      conversationId: finalConvId,
      projectId,
      senderId: req.user.id,
      senderName: req.user.name,
      receiverId: receiverId || 'usr_other',
      text,
      attachment,
      read: false
    });

    return res.status(201).json({ success: true, message: 'Message sent!', data: newMsg });
  } catch (err) {
    console.error('Send message error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

module.exports = router;
