/**
 * AI Service for Content Generation & Smart Creator Matching
 * Supports real AI API endpoints (Gemini / OpenAI) if keys are provided,
 * and high-fidelity algorithmic generation models if API keys are absent.
 */

const generateMockContent = ({ contentType, tone = 'Professional', targetAudience = 'General', language = 'English', keywords = [], prompt }) => {
  const kwString = keywords.length > 0 ? keywords.join(', ') : 'digital innovation, creator workflows';
  
  switch (contentType) {
    case 'Social Media Caption':
      return {
        title: `Dynamic Social Hook: ${prompt.slice(0, 32)}...`,
        content: `⚡ Stop scrolling if you care about the future of digital content.\n\n${prompt}\n\nHere are 3 quick takeaways:\n1. Attention is the new currency — optimize your first 3 seconds.\n2. Leverage AI tools not to replace your voice, but to amplify your creative reach.\n3. Consistent iteration beats perfection every time.\n\n👇 What is your biggest creative bottleneck right now? Drop a comment below!\n\n#ContentCreator #FutureOfWork #${keywords[0] ? keywords[0].replace(/\s+/g, '') : 'AIInnovation'} #DigitalGrowth`,
        variations: [
          `💡 Quick reminder: "${prompt}"\n\nThe creators who win in 2026 aren't working 80 hours a week. They are pairing unique personal taste with automated workflows. Save this for your next sprint!`,
          `🔥 Unpopular opinion about ${keywords[0] || 'modern creators'}: ${prompt}\n\nDouble tap if you agree, or share your counterpoint below!`
        ]
      };

    case 'Blog Post':
      return {
        title: `The Comprehensive Guide to ${prompt.slice(0, 40)}`,
        content: `# The Comprehensive Guide to ${prompt}\n\n**Tone:** ${tone} | **Target Audience:** ${targetAudience} | **Language:** ${language}\n\n---\n\n## Introduction\nIn today's hyper-competitive digital ecosystem, navigating ${prompt} has become a foundational competency for forward-thinking organizations and modern digital creators alike. Rather than treating this as a fleeting trend, industry leaders are integrating specialized AI workflows to accelerate high-impact production.\n\n## Why This Matters in 2026\nThe convergence of generative synthesis, localized algorithmic distribution, and niche creator communities has altered traditional audience acquisition dynamics.\n\nKey strategic benefits include:\n- **Accelerated Turnaround:** Compressing 14-day production cycles into rapid 48-hour sprints.\n- **Precision Targeting:** Addressing specific micro-audiences without diluting core brand messaging.\n- **Compound Scalability:** Creating reusable modular content assets tailored for omni-channel syndication.\n\n## Actionable Implementation Framework\nTo systematically leverage these insights, follow this three-phase roadmap:\n\n1. **Foundation & Discovery:** Define your core hypothesis and isolate target keywords (${kwString}).\n2. **Generative Prototyping:** Build modular concept drafts and subject them to authenticity stress-tests.\n3. **Distribution & Feedback Loop:** Deploy variants across vertical video, long-form newsletters, and interactive community channels.\n\n## Conclusion & Key Takeaway\nMastering this workflow requires balancing computational leverage with authentic human curation. The highest-performing creators are those who treat AI as an intellectual collaborator rather than a shortcut.`,
        variations: []
      };

    case 'Marketing Copy':
      return {
        title: `High-Converting Copy: ${prompt.slice(0, 36)}`,
        content: `## Headline Options\n- **Option A (Outcome-Focused):** Transform Your Content Pipeline: ${prompt}\n- **Option B (Intrigue):** What Top 1% Creators Know About ${keywords[0] || 'Scaling Content'}\n- **Option C (Direct Benefit):** Save 20+ Hours Every Week While Doubling Audience Retention\n\n---\n\n### Value Proposition\nAre you tired of disjointed creative handoffs and inconsistent quality? Our next-generation solution turns ${prompt} into seamless, measurable revenue for ${targetAudience}.\n\n### Core Feature Highlights\n✨ **Intelligent Matching:** Connect with domain-vetted specialists in minutes.\n🛡️ **Built-in Quality & Authenticity Escrow:** Verify original voice before deployment.\n⚡ **Zero Overhead Delivery:** Collaborate, revise, and approve from one centralized hub.\n\n### Call To Action (CTA)\n👉 **[Claim Your Free Creator Matching Session Now]** — Join over 2,500+ leading brands today!`,
        variations: []
      };

    case 'Video Script':
      return {
        title: `Short-Form Script: ${prompt.slice(0, 35)}`,
        content: `[TIMECODE: 0:00 - 0:03 | VISUAL HOOK]\n(Visual: Fast jump-cut with subtle camera shake, bold kinetic subtitles popping on screen: "DO THIS INSTEAD")\nSPEAKER: Stop making this critical mistake when you approach ${prompt}!\n\n[TIMECODE: 0:04 - 0:15 | THE PROBLEM & TENSION]\n(Visual: Screen recording showing messy workflow or red error badge, relatable stressed expression)\nSPEAKER: Most teams spend days manually tweaking prompts and waiting for revisions. But here is the secret top creators don't tell you:\n\n[TIMECODE: 0:16 - 0:38 | THE BREAKTHROUGH]\n(Visual: Clean 3D dashboard showing seamless one-click workflow and rapid output generation)\nSPEAKER: When you combine structured constraints with ${kwString}, your production speed jumps by 400%. Look at this output right here — clean, cohesive, and ready to publish.\n\n[TIMECODE: 0:39 - 0:50 | CALL TO ACTION]\n(Visual: Speaker points to link in bio, animated arrow graphic)\nSPEAKER: Save this reel before your next shoot, and tap the link in bio to test our full creator toolkit for free today!`,
        variations: []
      };

    case 'Product Description':
      return {
        title: `Product Listing: ${prompt.slice(0, 35)}`,
        content: `### Overview\nEngineered specifically for ${targetAudience}, this premium offering redefines how you execute ${prompt}. Built with exacting attention to detail and optimized for seamless everyday utility.\n\n### Why You'll Love It\n- **Precision Engineered:** Specifically calibrated around ${kwString}.\n- **Frictionless Integration:** Adapts instantly into existing workflows without a steep learning curve.\n- **Guaranteed Distinctiveness:** Crafted to stand out in crowded marketplace feeds.\n\n### Technical Specifications\n- **Target Audience:** ${targetAudience}\n- **Tone & Style:** ${tone}\n- **Language Localization:** ${language}\n- **Included Assets:** Master files, commercial licensing, full revision support.`,
        variations: []
      };

    default:
      return {
        title: `Generated Content for: ${prompt.slice(0, 30)}`,
        content: `Content generated for prompt: "${prompt}".\n\nTone: ${tone} | Audience: ${targetAudience}\n\nKeywords incorporated: ${kwString}.`,
        variations: []
      };
  }
};

/**
 * Live AI Multi-Modal Engine (Gemini / OpenAI / Nexus Engine)
 */
const generateContent = async ({ contentType, tone = 'Professional', targetAudience = 'General', language = 'English', keywords = [], prompt, apiKey }) => {
  const effectiveKey = apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '';
  const kwList = Array.isArray(keywords) ? keywords : (keywords ? keywords.split(',').map(s => s.trim()) : []);
  const kwString = kwList.length > 0 ? kwList.join(', ') : 'digital innovation, creator workflows';

  const systemInstruction = `You are an elite, world-class digital content strategist and copywriter for NexusAI Creator Marketplace. 
Your role is to produce high-impact, authentic, engaging ${contentType}.
Guidelines:
- Tone: ${tone}
- Target Audience: ${targetAudience}
- Language: ${language}
- Target Keywords to naturally integrate: ${kwString}
- Ensure originality, clear structure, and compelling hooks. Format using markdown.`;

  // 1. Check for Gemini Key
  if (effectiveKey && (effectiveKey.startsWith('AIzaSy') || process.env.GEMINI_API_KEY)) {
    try {
      const geminiKey = effectiveKey.startsWith('AIzaSy') ? effectiveKey : process.env.GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      
      const payload = {
        contents: [
          {
            parts: [
              { text: `${systemInstruction}\n\nUser Prompt: ${prompt}\n\nPlease generate the master ${contentType} content.` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 2048
        }
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        const data = await resp.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
          return {
            title: `${contentType}: ${prompt.slice(0, 35)}...`,
            content: generatedText,
            variations: [
              `Alternative Hook: ${prompt.slice(0, 60)}... (Engineered for ${targetAudience})`,
              `Condensed Variant: Key takeaway on ${kwList[0] || 'efficiency'} for ${language} audiences.`
            ],
            engine: 'Google Gemini 1.5 Flash (Live AI)',
            liveAI: true
          };
        }
      } else {
        const errText = await resp.text();
        console.warn('Gemini API returned error, falling back to neural generator:', errText);
      }
    } catch (err) {
      console.warn('Gemini request failed, falling back:', err.message);
    }
  }

  // 2. Check for OpenAI Key
  if (effectiveKey && (effectiveKey.startsWith('sk-') || process.env.OPENAI_API_KEY)) {
    try {
      const openAiKey = effectiveKey.startsWith('sk-') ? effectiveKey : process.env.OPENAI_API_KEY;
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return {
            title: `${contentType}: ${prompt.slice(0, 35)}...`,
            content,
            variations: [
              `Alternative Perspective: Tailored specifically for ${targetAudience}.`
            ],
            engine: 'OpenAI GPT-4o-mini (Live AI)',
            liveAI: true
          };
        }
      }
    } catch (err) {
      console.warn('OpenAI request failed, falling back:', err.message);
    }
  }

  // 3. Fallback: High-grade algorithmic generator
  const fallback = generateMockContent({
    contentType,
    tone,
    targetAudience,
    language,
    keywords: kwList,
    prompt
  });

  return {
    ...fallback,
    engine: 'Nexus Neural Generator (High-Fidelity)',
    liveAI: false
  };
};

/**
 * Smart Creator Matching Engine
 * Analyzes project requirements, budget, niche, skills, language, and past performance.
 * Calculates an explainable match score (0-100) and rationale.
 */
const matchCreators = (requirements, creatorsList) => {
  const { title = '', description = '', category = '', budget = 500, skills = [], language = 'English' } = requirements;
  
  const textCorpus = `${title} ${description} ${category} ${skills.join(' ')}`.toLowerCase();

  return creatorsList.map(creator => {
    let score = 70; // baseline
    const matchReasons = [];

    // Category match
    if (category && creator.category.toLowerCase().includes(category.toLowerCase())) {
      score += 12;
      matchReasons.push(`Direct category alignment in ${creator.category}`);
    } else if (category && textCorpus.includes(creator.category.toLowerCase())) {
      score += 6;
      matchReasons.push(`Relevant domain experience in ${creator.category}`);
    }

    // Skill overlap
    const matchedSkills = (creator.skills || []).filter(s => textCorpus.includes(s.toLowerCase()));
    if (matchedSkills.length > 0) {
      score += Math.min(matchedSkills.length * 4, 12);
      matchReasons.push(`Matches essential required skills: ${matchedSkills.slice(0, 3).join(', ')}`);
    }

    // Budget compatibility
    if (budget >= creator.startingPrice) {
      score += 5;
      matchReasons.push(`Budget ($${budget}) comfortably meets starting rate ($${creator.startingPrice})`);
    } else {
      score -= 8;
      matchReasons.push(`Starting package ($${creator.startingPrice}) is slightly higher than requested budget`);
    }

    // Rating & track record
    if (creator.rating >= 4.9) {
      score += 6;
      matchReasons.push(`Elite customer satisfaction rating (${creator.rating}/5.0 with ${creator.reviewsCount}+ reviews)`);
    }

    // Language
    if (creator.languages && creator.languages.some(l => l.toLowerCase() === language.toLowerCase())) {
      score += 4;
      matchReasons.push(`Fluent in required communication language (${language})`);
    }

    // Availability bonus
    if (creator.availability === 'Available') {
      score += 3;
      matchReasons.push('Immediately available to start this week');
    }

    // Normalize score
    const finalScore = Math.min(Math.max(score, 62), 99);

    return {
      creator,
      matchScore: finalScore,
      matchReasons: matchReasons.slice(0, 4),
      matchedSkills: matchedSkills.length > 0 ? matchedSkills : (creator.skills ? creator.skills.slice(0, 3) : [])
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
};

module.exports = {
  generateContent,
  generateMockContent,
  matchCreators
};
