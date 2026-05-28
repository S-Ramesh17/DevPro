// controllers/taskController.js - Task CRUD + Smart DevOps features
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create a new task (admin only)
// Also sends notifications to assigned members
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, deadline, priority, createdBy } = req.body;

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo: assignedTo || [],
      deadline,
      priority: priority || 'medium',
      createdBy
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email role avatarColor')
      .populate('projectId', 'title techStack')
      .populate('createdBy', 'name');

    // ===== Create notifications for assigned employees =====
    if (assignedTo && assignedTo.length > 0) {
      const notifications = assignedTo.map(userId => ({
        userId,
        message: `New task assigned: "${title}"`,
        type: 'task_assigned'
      }));
      await Notification.insertMany(notifications);
    }

    // Emit Socket.IO event — handled in index.js via global io
    if (global.io) {
      global.io.emit('task:created', populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tasks (admin view)
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name email role avatarColor')
      .populate('projectId', 'title techStack')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // ===== Smart Feature: Mark overdue and urgent tasks =====
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const enriched = tasks.map(task => {
      const obj = task.toObject();
      if (task.deadline) {
        if (task.deadline < now && task.status !== 'completed') {
          obj.alertType = 'overdue';
        } else if (task.deadline <= twoDaysFromNow && task.status !== 'completed') {
          obj.alertType = 'urgent';
        }
      }
      return obj;
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks for a specific employee
const getMyTasks = async (req, res) => {
  try {
    const { userId } = req.params;

    const tasks = await Task.find({ assignedTo: userId })
      .populate('projectId', 'title techStack')
      .populate('createdBy', 'name')
      .sort({ deadline: 1 }); // Sort by deadline ascending (urgent first)

    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const enriched = tasks.map(task => {
      const obj = task.toObject();
      if (task.deadline) {
        if (task.deadline < now && task.status !== 'completed') {
          obj.alertType = 'overdue';
        } else if (task.deadline <= twoDaysFromNow && task.status !== 'completed') {
          obj.alertType = 'urgent';
        }
      }
      return obj;
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task status (employee or admin)
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate('assignedTo', 'name email role avatarColor')
      .populate('projectId', 'title');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // If task completed, notify admin and create notification
    if (status === 'completed') {
      // Find admin users and notify them
      const admins = await User.find({ role: 'admin' });
      const adminNotifs = admins.map(admin => ({
        userId: admin._id,
        message: `Task completed: "${task.title}"`,
        type: 'task_completed'
      }));
      if (adminNotifs.length > 0) await Notification.insertMany(adminNotifs);
    }

    // Emit Socket.IO event for real-time dashboard update
    if (global.io) {
      global.io.emit('task:updated', task);
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a task (admin only)
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    if (global.io) global.io.emit('task:deleted', { id });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== SMART FEATURE: Workload Balancing =====
// Suggests employees with the fewest active tasks
// Also filters by role if a role preference is given
const getSuggestedEmployees = async (req, res) => {
  try {
    const { role } = req.query; // Optional: filter by role

    // Get all employees (non-admin)
    const query = role ? { role } : { role: { $ne: 'admin' } };
    const employees = await User.find(query);

    // Count active tasks per employee
    const activeTasks = await Task.find({ status: { $ne: 'completed' } });

    const taskCount = {};
    activeTasks.forEach(task => {
      task.assignedTo.forEach(uid => {
        const id = uid.toString();
        taskCount[id] = (taskCount[id] || 0) + 1;
      });
    });

    // Build employee objects with their workload
    const result = employees.map(emp => ({
      _id: emp._id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      avatarColor: emp.avatarColor,
      activeTasks: taskCount[emp._id.toString()] || 0 // Default 0 if no tasks
    }));

    // Sort: least busy first (workload balancing algorithm)
    result.sort((a, b) => a.activeTasks - b.activeTasks);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== ANALYTICS: Team productivity stats =====
const getAnalytics = async (req, res) => {
  try {
    const allTasks = await Task.find();
    const employees = await User.find({ role: { $ne: 'admin' } });

    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'completed').length;
    const pending = allTasks.filter(t => t.status === 'pending').length;
    const inProgress = allTasks.filter(t => t.status === 'in-progress').length;
    const blocked = allTasks.filter(t => t.status === 'blocked').length;

    // Per-employee performance
    const empStats = employees.map(emp => {
      const empTasks = allTasks.filter(t =>
        t.assignedTo.some(uid => uid.toString() === emp._id.toString())
      );
      return {
        name: emp.name,
        role: emp.role,
        avatarColor: emp.avatarColor,
        total: empTasks.length,
        completed: empTasks.filter(t => t.status === 'completed').length,
        pending: empTasks.filter(t => t.status === 'pending').length
      };
    });

    res.json({ total, completed, pending, inProgress, blocked, empStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getMyTasks,
  updateTaskStatus,
  deleteTask,
  getSuggestedEmployees,
  getAnalytics
};
