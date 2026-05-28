// models/Notification.js - Real-time notification schema
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Who should see this notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  // Type determines icon/color in the UI
  type: {
    type: String,
    enum: ['task_assigned', 'task_completed', 'deadline_alert', 'project_update'],
    default: 'task_assigned'
  },
  // Has the user seen this notification?
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
