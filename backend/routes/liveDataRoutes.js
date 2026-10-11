const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Cache in-memory to prevent rate-limiting
let currencyCache = {
  timestamp: 0,
  data: {
    base: 'USD',
    rates: {
      USD: 1,
      EUR: 0.892,
      GBP: 0.768,
      INR: 83.92,
      CAD: 1.354,
      JPY: 148.65,
      AUD: 1.482
    },
    lastUpdated: new Date().toISOString()
  }
};

let trendsCache = {
  timestamp: 0,
  articles: []
};

// GET /api/live-data/currency
router.get('/currency', async (req, res) => {
  const now = Date.now();
  // Cache for 10 minutes
  if (now - currencyCache.timestamp < 10 * 60 * 1000 && currencyCache.articles?.length > 0) {
    return res.json({ success: true, live: true, source: 'open.er-api.com', ...currencyCache.data });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal });
    clearTimeout(timeout);

    if (resp.ok) {
      const data = await resp.json();
      currencyCache = {
        timestamp: now,
        data: {
          base: 'USD',
          rates: {
            USD: 1,
            EUR: data.rates?.EUR || 0.892,
            GBP: data.rates?.GBP || 0.768,
            INR: data.rates?.INR || 83.92,
            CAD: data.rates?.CAD || 1.354,
            JPY: data.rates?.JPY || 148.65,
            AUD: data.rates?.AUD || 1.482
          },
          lastUpdated: data.time_last_update_utc || new Date().toISOString()
        }
      };
      return res.json({ success: true, live: true, source: 'open.er-api.com', ...currencyCache.data });
    }
  } catch (err) {
    console.warn('Live currency fetch fallback:', err.message);
  }

  return res.json({ success: true, live: false, source: 'cached-fallback', ...currencyCache.data });
});

// GET /api/live-data/trends
router.get('/trends', async (req, res) => {
  const now = Date.now();
  // Cache for 15 minutes
  if (now - trendsCache.timestamp < 15 * 60 * 1000 && trendsCache.articles.length > 0) {
    return res.json({ success: true, live: true, count: trendsCache.articles.length, articles: trendsCache.articles });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch('https://dev.to/api/articles?tag=artificialintelligence&per_page=6', { signal: controller.signal });
    clearTimeout(timeout);

    if (resp.ok) {
      const list = await resp.json();
      const mapped = list.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        url: item.url,
        publishedAt: item.published_at,
        readablePublishDate: item.readable_publish_date,
        tagList: item.tag_list,
        readingTimeMinutes: item.reading_time_minutes,
        reactionsCount: item.positive_reactions_count || 0,
        author: {
          name: item.user?.name,
          username: item.user?.username,
          avatar: item.user?.profile_image_90
        }
      }));

      trendsCache = {
        timestamp: now,
        articles: mapped
      };

      return res.json({ success: true, live: true, count: mapped.length, articles: mapped });
    }
  } catch (err) {
    console.warn('Live trends fetch fallback:', err.message);
  }

  // Curated live trend fallback if network times out
  const fallbackArticles = [
    {
      id: 101,
      title: 'Runway Gen-3 Alpha & Midjourney v6: Commercial Production Benchmark',
      description: 'Analyzing how leading creative directors are reducing 3D video turnaround from 14 days to 48 hours.',
      url: 'https://runwayml.com',
      readablePublishDate: 'Today',
      tagList: ['ai', 'video', 'creators', 'genai'],
      readingTimeMinutes: 4,
      reactionsCount: 142,
      author: { name: 'Elena Vance', username: 'elenavance', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }
    },
    {
      id: 102,
      title: 'Prompt Engineering to Prompt Architecture: What B2B Clients Pay For in 2026',
      description: 'Why enterprises are replacing simple prompts with multi-modal agentic chains and structured outputs.',
      url: 'https://github.com/topics/generative-ai',
      readablePublishDate: 'Yesterday',
      tagList: ['promptcraft', 'enterprise', 'llm'],
      readingTimeMinutes: 5,
      reactionsCount: 98,
      author: { name: 'David Okafor', username: 'davidokafor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
    }
  ];

  return res.json({ success: true, live: false, count: fallbackArticles.length, articles: fallbackArticles });
});

// GET /api/live-data/ai-status
router.get('/ai-status', (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());

  let activeEngine = 'Nexus Neural Generator (High-Fidelity Engine)';
  if (hasGemini) activeEngine = 'Google Gemini 1.5 Flash (Live External API)';
  else if (hasOpenAI) activeEngine = 'OpenAI GPT-4o Mini (Live External API)';

  return res.json({
    success: true,
    hasLiveKey: hasGemini || hasOpenAI,
    provider: hasGemini ? 'Gemini' : (hasOpenAI ? 'OpenAI' : 'NexusNeural'),
    engine: activeEngine,
    supportedProviders: ['Google Gemini', 'OpenAI']
  });
});

// POST /api/live-data/set-ai-key
router.post('/set-ai-key', (req, res) => {
  try {
    const { apiKey, provider = 'Gemini' } = req.body;
    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({ success: false, message: 'Valid API key is required.' });
    }

    const cleanKey = apiKey.trim();
    if (provider.toLowerCase().includes('gemini') || cleanKey.startsWith('AIzaSy')) {
      process.env.GEMINI_API_KEY = cleanKey;
    } else {
      process.env.OPENAI_API_KEY = cleanKey;
    }

    // Persist to backend/.env
    try {
      const envPath = path.join(__dirname, '../.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      if (cleanKey.startsWith('AIzaSy') || provider.toLowerCase().includes('gemini')) {
        if (envContent.includes('GEMINI_API_KEY=')) {
          envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${cleanKey}`);
        } else {
          envContent += `\nGEMINI_API_KEY=${cleanKey}`;
        }
      } else {
        if (envContent.includes('OPENAI_API_KEY=')) {
          envContent = envContent.replace(/OPENAI_API_KEY=.*/g, `OPENAI_API_KEY=${cleanKey}`);
        } else {
          envContent += `\nOPENAI_API_KEY=${cleanKey}`;
        }
      }
      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
    } catch (e) {
      console.warn('Could not persist to .env:', e.message);
    }

    return res.json({
      success: true,
      message: `Live ${provider} API Key activated successfully!`,
      engine: cleanKey.startsWith('AIzaSy') ? 'Google Gemini 1.5 Flash (Live External API)' : 'OpenAI GPT-4o Mini (Live External API)'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to configure live API key.' });
  }
});

module.exports = router;
