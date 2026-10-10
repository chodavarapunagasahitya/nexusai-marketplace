const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const storage = require('../services/storage');
const { authenticate, JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id || user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'client', title = '', bio = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await storage.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const defaultAvatar = role === 'creator'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const newUser = await storage.createUser({
      name,
      email,
      password: hashedPassword,
      role,
      avatar: defaultAvatar,
      title: title || (role === 'creator' ? 'AI Content Specialist' : 'Digital Creator / Client'),
      bio: bio || (role === 'creator' ? 'Passionate about leveraging AI to create next-generation digital media.' : 'Looking for high quality creators to build innovative campaigns.')
    });

    // If registered as creator, create default CreatorProfile
    if (role === 'creator') {
      await storage.createOrUpdateCreatorProfile(newUser.id || newUser._id, {
        name: newUser.name,
        title: newUser.title,
        bio: newUser.bio,
        avatar: newUser.avatar,
        category: 'General Content',
        skills: ['AI Content Generation', 'Digital Storytelling', 'Prompting'],
        languages: ['English'],
        hourlyRate: 50,
        startingPrice: 150,
        availability: 'Available',
        portfolio: [],
        packages: [
          {
            name: 'Basic Starter',
            price: 150,
            deliveryDays: 3,
            revisions: 2,
            features: ['1 x Core Content Deliverable', 'AI Optimization Pass', 'Standard Commercial Use']
          }
        ]
      });
    }

    const token = generateToken(newUser);
    const { password: _, ...userSafe } = newUser._doc || newUser;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await storage.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    const token = generateToken(user);
    const { password: _, ...userSafe } = user._doc || user;

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// POST /api/auth/demo-login (Quick 1-click login for Client, Creator, or Admin)
router.post('/demo-login', async (req, res) => {
  try {
    const { role = 'client' } = req.body;
    let targetEmail = 'client@techflow.com';

    if (role === 'creator') {
      targetEmail = 'elena@creator.io';
    } else if (role === 'admin') {
      targetEmail = 'admin@nexusai.io';
    }

    const user = await storage.findUserByEmail(targetEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: `Demo user for role ${role} not found.` });
    }

    const token = generateToken(user);
    const { password: _, ...userSafe } = user._doc || user;

    return res.json({
      success: true,
      message: `Signed in as Demo ${role.toUpperCase()}`,
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Demo login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during demo login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await storage.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { password: _, ...userSafe } = user._doc || user;
    return res.json({ success: true, user: userSafe });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving user profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, title, bio, avatar } = req.body;
    const updated = await storage.updateUser(req.user.id, {
      ...(name && { name }),
      ...(title && { title }),
      ...(bio && { bio }),
      ...(avatar && { avatar })
    });
    const { password: _, ...userSafe } = updated._doc || updated;
    return res.json({ success: true, message: 'Profile updated!', user: userSafe });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

module.exports = router;
