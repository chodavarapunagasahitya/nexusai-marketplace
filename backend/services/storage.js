const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');
const CreatorProfile = require('../models/CreatorProfile');
const Project = require('../models/Project');
const AIGeneration = require('../models/AIGeneration');
const Message = require('../models/Message');
const ReportedContent = require('../models/ReportedContent');

const {
  seedUsers,
  seedCreators,
  seedProjects,
  seedAIGenerations,
  seedMessages,
  seedReportedContent
} = require('../data/seedData');

const DB_FILE_PATH = path.join(__dirname, '../data/nexus_database.json');
const DB_TEMP_PATH = path.join(__dirname, '../data/nexus_database.json.tmp');

let isWriting = false;
const writeQueue = [];

// Helper to save to disk atomically and safely
const saveToDisk = (store) => {
  return new Promise((resolve) => {
    writeQueue.push({ store, resolve });
    processWriteQueue();
  });
};

const processWriteQueue = () => {
  if (isWriting || writeQueue.length === 0) return;
  isWriting = true;

  const item = writeQueue.shift();
  try {
    const data = JSON.stringify(item.store, null, 2);
    // Write to temp file first, then atomically rename
    fs.writeFileSync(DB_TEMP_PATH, data, 'utf8');
    fs.renameSync(DB_TEMP_PATH, DB_FILE_PATH);
    item.resolve(true);
  } catch (err) {
    console.error('Failed to persist database to disk atomically:', err.message);
    try {
      // Fallback write if rename fails
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(item.store, null, 2), 'utf8');
      item.resolve(true);
    } catch (e) {
      console.error('Critical fallback disk write failed:', e.message);
      item.resolve(false);
    }
  } finally {
    isWriting = false;
    if (writeQueue.length > 0) {
      setImmediate(processWriteQueue);
    }
  }
};


// Helper to load from disk file
const loadFromDisk = () => {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Could not read existing database file, falling back to initial seed.');
  }

  const initial = {
    users: JSON.parse(JSON.stringify(seedUsers)),
    creators: JSON.parse(JSON.stringify(seedCreators)),
    projects: JSON.parse(JSON.stringify(seedProjects)),
    aiGenerations: JSON.parse(JSON.stringify(seedAIGenerations)),
    messages: JSON.parse(JSON.stringify(seedMessages)),
    reportedContent: JSON.parse(JSON.stringify(seedReportedContent))
  };
  saveToDisk(initial);
  return initial;
};

// Initialize persistent store
const localStore = loadFromDisk();

// Check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

// Seed MongoDB if connected and empty
const seedMongoIfNeeded = async () => {
  try {
    if (!isMongoConnected()) return;
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding MongoDB with initial marketplace data...');
      await User.insertMany(seedUsers);
      await CreatorProfile.insertMany(seedCreators);
      await Project.insertMany(seedProjects);
      await AIGeneration.insertMany(seedAIGenerations);
      await Message.insertMany(seedMessages);
      await ReportedContent.insertMany(seedReportedContent);
      console.log('✅ MongoDB seeded successfully!');
    }
  } catch (err) {
    console.error('⚠️ MongoDB seeding warning:', err.message);
  }
};

const storage = {
  isMongoConnected,
  seedMongoIfNeeded,

  // DATABASE & DATASET HUB METHODS
  async getDatabaseStats() {
    const counts = {
      users: isMongoConnected() ? await User.countDocuments() : localStore.users.length,
      creators: isMongoConnected() ? await CreatorProfile.countDocuments() : localStore.creators.length,
      projects: isMongoConnected() ? await Project.countDocuments() : localStore.projects.length,
      aiGenerations: isMongoConnected() ? await AIGeneration.countDocuments() : localStore.aiGenerations.length,
      messages: isMongoConnected() ? await Message.countDocuments() : localStore.messages.length,
      reportedContent: isMongoConnected() ? await ReportedContent.countDocuments() : localStore.reportedContent.length
    };

    const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);

    return {
      connected: true,
      engine: isMongoConnected() ? 'MongoDB (Mongoose Active)' : 'Persistent JSON Document Store',
      mongoConnected: isMongoConnected(),
      databaseFile: 'backend/data/nexus_database.json',
      collections: Object.keys(counts).length,
      counts,
      totalRecords,
      status: 'Ready & Synced',
      lastSynced: new Date()
    };
  },

  async reseedDataset() {
    localStore.users = JSON.parse(JSON.stringify(seedUsers));
    localStore.creators = JSON.parse(JSON.stringify(seedCreators));
    localStore.projects = JSON.parse(JSON.stringify(seedProjects));
    localStore.aiGenerations = JSON.parse(JSON.stringify(seedAIGenerations));
    localStore.messages = JSON.parse(JSON.stringify(seedMessages));
    localStore.reportedContent = JSON.parse(JSON.stringify(seedReportedContent));
    saveToDisk(localStore);

    if (isMongoConnected()) {
      try {
        await User.deleteMany({});
        await CreatorProfile.deleteMany({});
        await Project.deleteMany({});
        await AIGeneration.deleteMany({});
        await Message.deleteMany({});
        await ReportedContent.deleteMany({});
        await seedMongoIfNeeded();
      } catch (e) {
        console.error('Mongo reseed error:', e.message);
      }
    }

    return await this.getDatabaseStats();
  },

  async connectMongoDB(mongoUri) {
    if (!mongoUri) throw new Error('MongoDB URI is required');
    try {
      if (mongoose.connection && mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
      await seedMongoIfNeeded();
      return { success: true, message: 'Successfully connected to MongoDB and synced datasets!' };
    } catch (err) {
      throw new Error(`Failed to connect to MongoDB: ${err.message}`);
    }
  },

  async getFullDataset() {
    if (isMongoConnected()) {
      return {
        users: await User.find().select('-password'),
        creators: await CreatorProfile.find(),
        projects: await Project.find(),
        aiGenerations: await AIGeneration.find(),
        messages: await Message.find(),
        reportedContent: await ReportedContent.find()
      };
    }
    return {
      users: localStore.users.map(({ password, ...u }) => u),
      creators: localStore.creators,
      projects: localStore.projects,
      aiGenerations: localStore.aiGenerations,
      messages: localStore.messages,
      reportedContent: localStore.reportedContent
    };
  },

  // USERS
  async findUserByEmail(email) {
    if (isMongoConnected()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    return localStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (isMongoConnected()) {
      return await User.findById(id) || await User.findOne({ id });
    }
    return localStore.users.find(u => u._id === id || u.id === id) || null;
  },

  async createUser(userData) {
    const id = 'usr_' + uuidv4().slice(0, 8);
    const user = {
      _id: id,
      id,
      ...userData,
      email: userData.email.toLowerCase(),
      createdAt: new Date(),
      favorites: []
    };

    if (isMongoConnected()) {
      return await User.create(user);
    }
    localStore.users.push(user);
    saveToDisk(localStore);
    return user;
  },

  async updateUser(id, updateData) {
    if (isMongoConnected()) {
      return await User.findOneAndUpdate(
        { $or: [{ _id: id }, { id }] },
        { $set: updateData },
        { new: true }
      );
    }
    const idx = localStore.users.findIndex(u => u._id === id || u.id === id);
    if (idx !== -1) {
      localStore.users[idx] = { ...localStore.users[idx], ...updateData };
      saveToDisk(localStore);
      return localStore.users[idx];
    }
    return null;
  },

  async getAllUsers() {
    if (isMongoConnected()) {
      return await User.find().select('-password');
    }
    return localStore.users.map(({ password, ...rest }) => rest);
  },

  async toggleFavorite(userId, creatorId) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    let favs = user.favorites || [];
    if (favs.includes(creatorId)) {
      favs = favs.filter(id => id !== creatorId);
    } else {
      favs.push(creatorId);
    }
    return await this.updateUser(userId, { favorites: favs });
  },

  // CREATORS
  async getCreators(filters = {}) {
    let list = [];
    if (isMongoConnected()) {
      list = await CreatorProfile.find();
    } else {
      list = [...localStore.creators];
    }

    if (filters.category && filters.category !== 'All') {
      list = list.filter(c => c.category.toLowerCase().includes(filters.category.toLowerCase()));
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(s) || 
        c.title.toLowerCase().includes(s) ||
        (c.skills && c.skills.some(sk => sk.toLowerCase().includes(s)))
      );
    }
    if (filters.maxBudget) {
      list = list.filter(c => c.startingPrice <= Number(filters.maxBudget));
    }
    if (filters.minRating) {
      list = list.filter(c => c.rating >= Number(filters.minRating));
    }
    if (filters.availability && filters.availability !== 'All') {
      list = list.filter(c => c.availability.toLowerCase() === filters.availability.toLowerCase());
    }
    if (filters.language && filters.language !== 'All') {
      list = list.filter(c => c.languages && c.languages.some(l => l.toLowerCase() === filters.language.toLowerCase()));
    }

    return list;
  },

  async getCreatorById(id) {
    if (isMongoConnected()) {
      return await CreatorProfile.findOne({ $or: [{ _id: id }, { id }, { userId: id }] });
    }
    return localStore.creators.find(c => c._id === id || c.id === id || c.userId === id) || null;
  },

  async createOrUpdateCreatorProfile(userId, profileData) {
    if (isMongoConnected()) {
      const existing = await CreatorProfile.findOne({ userId });
      if (existing) {
        return await CreatorProfile.findOneAndUpdate({ userId }, { $set: profileData }, { new: true });
      }
      return await CreatorProfile.create({
        _id: 'prof_' + uuidv4().slice(0, 8),
        id: 'prof_' + uuidv4().slice(0, 8),
        userId,
        ...profileData
      });
    }

    const idx = localStore.creators.findIndex(c => c.userId === userId);
    if (idx !== -1) {
      localStore.creators[idx] = { ...localStore.creators[idx], ...profileData };
      saveToDisk(localStore);
      return localStore.creators[idx];
    }
    const newProfile = {
      _id: 'prof_' + uuidv4().slice(0, 8),
      id: 'prof_' + uuidv4().slice(0, 8),
      userId,
      ...profileData,
      rating: 5.0,
      reviewsCount: 0,
      completedProjects: 0,
      portfolio: profileData.portfolio || [],
      reviews: []
    };
    localStore.creators.push(newProfile);
    saveToDisk(localStore);
    return newProfile;
  },

  // PROJECTS
  async getProjects(filter = {}) {
    let list = [];
    if (isMongoConnected()) {
      list = await Project.find();
    } else {
      list = [...localStore.projects];
    }

    if (filter.clientId) {
      list = list.filter(p => p.clientId === filter.clientId);
    }
    if (filter.creatorId) {
      list = list.filter(p => p.creatorId === filter.creatorId);
    }
    if (filter.status && filter.status !== 'All') {
      list = list.filter(p => p.status === filter.status);
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getProjectById(id) {
    if (isMongoConnected()) {
      return await Project.findOne({ $or: [{ _id: id }, { id }] });
    }
    return localStore.projects.find(p => p._id === id || p.id === id) || null;
  },

  async createProject(projectData) {
    const id = 'proj_' + uuidv4().slice(0, 8);
    const newProject = {
      _id: id,
      id,
      ...projectData,
      status: projectData.status || 'Requested',
      revisions: [],
      files: projectData.files || [],
      deliverables: (projectData.deliverables || []).map(d => typeof d === 'string' ? { title: d, completed: false } : d),
      pendingAction: 'Awaiting creator review',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isMongoConnected()) {
      return await Project.create(newProject);
    }
    localStore.projects.unshift(newProject);
    saveToDisk(localStore);
    return newProject;
  },

  async updateProject(id, updateData) {
    updateData.updatedAt = new Date();
    if (isMongoConnected()) {
      return await Project.findOneAndUpdate(
        { $or: [{ _id: id }, { id }] },
        { $set: updateData },
        { new: true }
      );
    }
    const idx = localStore.projects.findIndex(p => p._id === id || p.id === id);
    if (idx !== -1) {
      localStore.projects[idx] = { ...localStore.projects[idx], ...updateData };
      saveToDisk(localStore);
      return localStore.projects[idx];
    }
    return null;
  },

  // AI GENERATIONS
  async getAIGenerations(userId, isSaved = null) {
    let list = [];
    if (isMongoConnected()) {
      const q = { userId };
      if (isSaved !== null) q.isSaved = isSaved;
      list = await AIGeneration.find(q);
    } else {
      list = localStore.aiGenerations.filter(g => g.userId === userId);
      if (isSaved !== null) {
        list = list.filter(g => g.isSaved === isSaved);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async createAIGeneration(genData) {
    const id = 'gen_' + uuidv4().slice(0, 8);
    const newGen = {
      _id: id,
      id,
      ...genData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isMongoConnected()) {
      return await AIGeneration.create(newGen);
    }
    localStore.aiGenerations.unshift(newGen);
    saveToDisk(localStore);
    return newGen;
  },

  async updateAIGeneration(id, updateData) {
    if (isMongoConnected()) {
      return await AIGeneration.findOneAndUpdate(
        { $or: [{ _id: id }, { id }] },
        { $set: updateData },
        { new: true }
      );
    }
    const idx = localStore.aiGenerations.findIndex(g => g._id === id || g.id === id);
    if (idx !== -1) {
      localStore.aiGenerations[idx] = { ...localStore.aiGenerations[idx], ...updateData };
      saveToDisk(localStore);
      return localStore.aiGenerations[idx];
    }
    return null;
  },

  async deleteAIGeneration(id) {
    if (isMongoConnected()) {
      return await AIGeneration.findOneAndDelete({ $or: [{ _id: id }, { id }] });
    }
    const idx = localStore.aiGenerations.findIndex(g => g._id === id || g.id === id);
    if (idx !== -1) {
      const deleted = localStore.aiGenerations.splice(idx, 1);
      saveToDisk(localStore);
      return deleted[0];
    }
    return null;
  },

  // MESSAGES
  async getMessages(conversationId) {
    let list = [];
    if (isMongoConnected()) {
      list = await Message.find({
        $or: [{ conversationId }, { projectId: conversationId }]
      });
    } else {
      list = localStore.messages.filter(m => 
        m.conversationId === conversationId || 
        m.projectId === conversationId ||
        (m.conversationId && m.conversationId.split('_conv_').reverse().join('_conv_') === conversationId)
      );
    }
    return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  async getAllUserConversations(userId) {
    let allMsgs = [];
    if (isMongoConnected()) {
      allMsgs = await Message.find({
        $or: [{ senderId: userId }, { receiverId: userId }]
      });
    } else {
      allMsgs = localStore.messages.filter(m => m.senderId === userId || m.receiverId === userId);
    }

    const convMap = {};
    for (const msg of allMsgs) {
      const convId = msg.conversationId || (msg.projectId ? msg.projectId : [msg.senderId, msg.receiverId].sort().join('_conv_'));
      if (!convMap[convId]) {
        convMap[convId] = {
          conversationId: convId,
          id: convId,
          projectId: msg.projectId,
          lastMessage: msg,
          unreadCount: 0,
          otherUserId: msg.senderId === userId ? msg.receiverId : msg.senderId
        };
      }
      if (new Date(msg.createdAt) > new Date(convMap[convId].lastMessage.createdAt)) {
        convMap[convId].lastMessage = msg;
      }
      if (msg.receiverId === userId && !msg.read) {
        convMap[convId].unreadCount++;
      }
    }

    const result = Object.values(convMap);
    for (const conv of result) {
      const otherUser = await this.findUserById(conv.otherUserId);
      conv.otherUser = otherUser ? {
        id: otherUser.id || otherUser._id,
        name: otherUser.name,
        avatar: otherUser.avatar,
        role: otherUser.role,
        title: otherUser.title
      } : { name: 'Marketplace Partner', avatar: '' };
    }

    return result.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
  },

  async createMessage(msgData) {
    const id = 'msg_' + uuidv4().slice(0, 8);
    const newMsg = {
      _id: id,
      id,
      ...msgData,
      createdAt: new Date()
    };

    if (isMongoConnected()) {
      return await Message.create(newMsg);
    }
    localStore.messages.push(newMsg);
    saveToDisk(localStore);
    return newMsg;
  },

  // REPORTED CONTENT
  async getReportedContent() {
    if (isMongoConnected()) {
      return await ReportedContent.find().sort({ createdAt: -1 });
    }
    return localStore.reportedContent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async updateReportedContent(id, updateData) {
    if (isMongoConnected()) {
      return await ReportedContent.findOneAndUpdate(
        { $or: [{ _id: id }, { id }] },
        { $set: updateData },
        { new: true }
      );
    }
    const idx = localStore.reportedContent.findIndex(r => r._id === id || r.id === id);
    if (idx !== -1) {
      localStore.reportedContent[idx] = { ...localStore.reportedContent[idx], ...updateData };
      saveToDisk(localStore);
      return localStore.reportedContent[idx];
    }
    return null;
  }
};

module.exports = storage;
