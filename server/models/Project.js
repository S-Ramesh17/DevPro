// models/Project.js - Software project schema
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // Tech stack used in the project (e.g. "React, Node.js, MongoDB")
  techStack: {
    type: String,
    trim: true
  },
  deadline: {
    type: Date
  },
  // Array of user IDs assigned to this project
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Who created this project (always admin)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
