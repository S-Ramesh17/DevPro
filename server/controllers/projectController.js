// controllers/projectController.js - Manage software projects
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// Create a new project (admin only)
const createProject = async (req, res) => {
  try {
    const { title, description, techStack, deadline, teamMembers } = req.body;
    const { userId } = req.body; // Admin's ID

    const project = await Project.create({
      title,
      description,
      techStack,
      deadline,
      teamMembers: teamMembers || [],
      createdBy: userId
    });

    const populated = await Project.findById(project._id)
      .populate('teamMembers', 'name email role')
      .populate('createdBy', 'name');

    // Notify team members about the new project
    if (teamMembers && teamMembers.length > 0) {
      const notifications = teamMembers.map(memberId => ({
        userId: memberId,
        message: `You were added to project: ${title}`,
        type: 'project_update'
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('teamMembers', 'name email role avatarColor')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get projects for a specific employee
const getMyProjects = async (req, res) => {
  try {
    const { userId } = req.params;
    const projects = await Project.find({ teamMembers: userId })
      .populate('teamMembers', 'name email role')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a project (admin only)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProject, getProjects, getMyProjects, deleteProject };
