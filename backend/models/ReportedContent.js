const mongoose = require('mongoose');

const reportedContentSchema = new mongoose.Schema({
  targetType: { type: String, enum: ['creator_profile', 'portfolio_item', 'project', 'message'], required: true },
  targetId: { type: String, required: true },
  targetTitle: { type: String, required: true },
  creatorName: { type: String, default: 'Unknown' },
  reportedBy: { type: String, required: true },
  reporterEmail: { type: String, required: true },
  reason: { type: String, required: true }, // e.g. 'Copyright infringement', 'Spam / Misleading', 'Inappropriate content'
  details: { type: String },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  actionTaken: { type: String, default: 'none' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReportedContent', reportedContentSchema);
