const mongoose = require('mongoose');

const creatorProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  category: { type: String, required: true }, // e.g. 'Tech & AI', 'Video & Motion', 'Copywriting & Content', 'Social Media'
  skills: [{ type: String }],
  languages: [{ type: String }],
  hourlyRate: { type: Number, default: 45 },
  startingPrice: { type: Number, default: 150 },
  rating: { type: Number, default: 4.9 },
  reviewsCount: { type: Number, default: 24 },
  availability: { type: String, enum: ['Available', 'Busy', 'Booked'], default: 'Available' },
  location: { type: String, default: 'San Francisco, CA' },
  completedProjects: { type: Number, default: 32 },
  portfolio: [{
    id: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    imageUrl: { type: String },
    link: { type: String },
    metrics: { type: String }, // e.g. '1.2M Views'
    date: { type: String }
  }],
  packages: [{
    name: { type: String }, // Basic, Standard, Premium
    price: { type: Number },
    deliveryDays: { type: Number },
    revisions: { type: Number },
    features: [{ type: String }]
  }],
  reviews: [{
    id: { type: String },
    clientName: { type: String },
    clientAvatar: { type: String },
    rating: { type: Number },
    comment: { type: String },
    date: { type: String },
    projectTitle: { type: String }
  }],
  analytics: {
    monthlyEarnings: [{ month: String, amount: Number }],
    profileViews: { type: Number, default: 1420 },
    clientRetentionRate: { type: Number, default: 88 },
    responseTimeHours: { type: Number, default: 2 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CreatorProfile', creatorProfileSchema);
