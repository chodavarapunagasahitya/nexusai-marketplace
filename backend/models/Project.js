const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  creatorId: { type: String, required: true },
  creatorName: { type: String, required: true },
  category: { type: String, default: 'General Content' },
  budget: { type: Number, required: true },
  deadline: { type: String, required: true },
  status: {
    type: String,
    enum: ['Requested', 'Accepted', 'In Progress', 'Under Review', 'Completed'],
    default: 'Requested'
  },
  deliverables: [{
    title: { type: String },
    completed: { type: Boolean, default: false }
  }],
  revisions: [{
    id: { type: String },
    requestedBy: { type: String },
    feedback: { type: String },
    requestedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'addressed'], default: 'pending' }
  }],
  files: [{
    name: { type: String },
    size: { type: String },
    uploadedBy: { type: String },
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  pendingAction: { type: String, default: 'Awaiting creator acceptance' },
  feedback: {
    rating: { type: Number },
    comment: { type: String },
    submittedAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
