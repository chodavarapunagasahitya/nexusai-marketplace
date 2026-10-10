const mongoose = require('mongoose');

const aiGenerationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, default: 'Untitled Generation' },
  contentType: {
    type: String,
    enum: ['Social Media Caption', 'Blog Post', 'Marketing Copy', 'Video Script', 'Product Description'],
    required: true
  },
  tone: { type: String, default: 'Professional' },
  targetAudience: { type: String, default: 'General' },
  language: { type: String, default: 'English' },
  keywords: [{ type: String }],
  prompt: { type: String, required: true },
  generatedContent: { type: String, required: true },
  isSaved: { type: Boolean, default: false },
  wordCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIGeneration', aiGenerationSchema);
