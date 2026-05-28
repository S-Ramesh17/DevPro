// controllers/authController.js - Login, Register, and Seed default users
const User = require('../models/User');

// Random colors for user avatars
const avatarColors = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2'];

// Register a new employee (not admin)
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Prevent registering as admin (admins are pre-seeded)
    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be created via registration' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Assign a random avatar color
    const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'developer',
      avatarColor: color
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarColor: user.avatarColor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return user info (no password)
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarColor: user.avatarColor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seed default users on server start
const seedDefaultUsers = async () => {
  try {
    const defaults = [
      { name: 'Admin User',        email: 'admin@test.com',  password: '1234', role: 'admin',     avatarColor: '#7c3aed' },
      { name: 'Dev Engineer',      email: 'dev@test.com',    password: '1234', role: 'developer', avatarColor: '#2563eb' },
      { name: 'QA Tester',         email: 'qa@test.com',     password: '1234', role: 'qa',        avatarColor: '#16a34a' },
      { name: 'DevOps Engineer',   email: 'devops@test.com', password: '1234', role: 'devops',    avatarColor: '#d97706' },
    ];

    for (const u of defaults) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`✅ Seeded: ${u.email}`);
      }
    }
  } catch (error) {
    console.error('Seed error:', error.message);
  }
};

module.exports = { register, login, seedDefaultUsers };
