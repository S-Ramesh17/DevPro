// models/User.js - User database schema with IT roles
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  // IT-sector specific roles
  role: {
    type: String,
    enum: ['admin', 'developer', 'qa', 'devops'],
    default: 'developer'
  },
  // Avatar color for UI (assigned randomly on creation)
  avatarColor: {
    type: String,
    default: '#2563eb'
  }
}, {
  timestamps: true // Auto adds createdAt and updatedAt
});

// Hash password before saving to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare login password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
