const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'creator', 'admin'], default: 'client' },
  avatar: { type: String, default: '' },
  title: { type: String, default: '' },
  bio: { type: String, default: '' },
  favorites: [{ type: String }], // creator IDs
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' }
});

module.exports = mongoose.model('User', userSchema);
