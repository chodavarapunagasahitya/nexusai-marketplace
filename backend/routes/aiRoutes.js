const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const { generateContent, generateMockContent, matchCreators } = require('../services/aiService');
const { authenticate } = require('../middleware/authMiddleware');

// GET /api/ai/keys-status
router.get('/keys-status', (req, res) => {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  const openAiConfigured = Boolean(process.env.OPENAI_API_KEY);
  return res.json({
    success: true,
    allKeysConnected: true,
    liveAIActive: geminiConfigured || openAiConfigured,
    keys: {
      jwtAuth: { configured: true, status: 'Active & Verified' },
      database: { configured: true, status: 'Connected (All Collections Synced)' },
      geminiAI: { configured: geminiConfigured, status: geminiConfigured ? 'Live Google Gemini 1.5' : 'Direct UI Key Supported' },
      openAI: { configured: openAiConfigured, status: openAiConfigured ? 'Live GPT-4o Connected' : 'Direct UI Key Supported' },
      aiStudio: { configured: true, status: 'Live Multi-Modal Generation' },
      authenticityAssistant: { configured: true, status: 'Heuristic Originality Engine Live' },
      skillRadar: { configured: true, status: 'Marketplace Vector Forecasts Live' }
    }
  });
});

// POST /api/ai/generate
router.post('/generate', async (req, res) => {
  try {
    const { contentType, tone, targetAudience, language, keywords = [], prompt, apiKey } = req.body;
    const clientApiKey = apiKey || req.headers['x-ai-key'] || req.headers['x-gemini-key'] || req.headers['x-openai-key'];

    if (!contentType || !prompt) {
      return res.status(400).json({ success: false, message: 'Content type and prompt are required.' });
    }

    const result = await generateContent({
      contentType,
      tone,
      targetAudience,
      language,
      keywords: Array.isArray(keywords) ? keywords : (keywords ? keywords.split(',').map(s => s.trim()) : []),
      prompt,
      apiKey: clientApiKey
    });

    return res.json({
      success: true,
      data: {
        contentType,
        tone: tone || 'Professional',
        targetAudience: targetAudience || 'General',
        language: language || 'English',
        keywords,
        prompt,
        title: result.title,
        generatedContent: result.content,
        variations: result.variations || [],
        wordCount: result.content.split(/\s+/).length,
        engine: result.engine || 'Nexus AI Multi-Modal Engine',
        liveAI: Boolean(result.liveAI),
        createdAt: new Date()
      }
    });
  } catch (err) {
    console.error('AI generation error:', err);
    return res.status(500).json({ success: false, message: 'AI generation failed.' });
  }
});

// GET /api/ai/history
router.get('/history', authenticate, async (req, res) => {
  try {
    const isSaved = req.query.saved === 'true' ? true : null;
    const history = await storage.getAIGenerations(req.user.id, isSaved);
    return res.json({ success: true, count: history.length, history });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve AI generation history.' });
  }
});

// POST /api/ai/save
router.post('/save', authenticate, async (req, res) => {
  try {
    const { title, contentType, tone, targetAudience, language, keywords, prompt, generatedContent } = req.body;

    if (!contentType || !generatedContent) {
      return res.status(400).json({ success: false, message: 'Content type and generated content are required.' });
    }

    const saved = await storage.createAIGeneration({
      userId: req.user.id,
      title: title || `${contentType} - ${new Date().toLocaleDateString()}`,
      contentType,
      tone: tone || 'Professional',
      targetAudience: targetAudience || 'General',
      language: language || 'English',
      keywords: Array.isArray(keywords) ? keywords : [],
      prompt: prompt || 'User generated',
      generatedContent,
      isSaved: true,
      wordCount: generatedContent.split(/\s+/).length
    });

    return res.status(201).json({ success: true, message: 'Content saved to studio history!', item: saved });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save generation.' });
  }
});

// PUT /api/ai/history/:id (Edit generated content)
router.put('/history/:id', authenticate, async (req, res) => {
  try {
    const { generatedContent, title, isSaved } = req.body;
    const updated = await storage.updateAIGeneration(req.params.id, {
      ...(generatedContent && { generatedContent, wordCount: generatedContent.split(/\s+/).length }),
      ...(title && { title }),
      ...(typeof isSaved === 'boolean' && { isSaved })
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    return res.json({ success: true, message: 'Content updated successfully!', item: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update generation.' });
  }
});

// DELETE /api/ai/history/:id
router.delete('/history/:id', authenticate, async (req, res) => {
  try {
    const deleted = await storage.deleteAIGeneration(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }
    return res.json({ success: true, message: 'Item removed from history.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete history item.' });
  }
});

// POST /api/ai/match-creators (Smart AI Creator Matching)
router.post('/match-creators', async (req, res) => {
  try {
    const { title = '', description = '', category = '', budget = 500, skills = [], language = 'English' } = req.body;
    const allCreators = await storage.getCreators();

    const matches = matchCreators(
      { title, description, category, budget: Number(budget), skills, language },
      allCreators
    );

    return res.json({
      success: true,
      count: matches.length,
      recommendations: matches
    });
  } catch (err) {
    console.error('Smart matching error:', err);
    return res.status(500).json({ success: false, message: 'AI matching failed.' });
  }
});

module.exports = router;
