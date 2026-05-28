// controllers/seedController.js - Populate demo data on first run
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

const seedDemoData = async () => {
  try {
    // Only seed if no projects exist yet
    const existingProjects = await Project.countDocuments();
    if (existingProjects > 0) return;

    const admin = await User.findOne({ role: 'admin' });
    const dev = await User.findOne({ role: 'developer' });
    const qa = await User.findOne({ role: 'qa' });
    const devops = await User.findOne({ role: 'devops' });

    if (!admin || !dev) return; // Wait for users to be seeded first

    // Create sample projects
    const projects = await Project.insertMany([
      {
        title: 'AI Chatbot System',
        description: 'Build an intelligent customer support chatbot using NLP',
        techStack: 'Python, FastAPI, React, MongoDB',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        teamMembers: [dev._id, qa._id],
        createdBy: admin._id,
        status: 'active'
      },
      {
        title: 'CI/CD Dashboard',
        description: 'Internal DevOps dashboard for pipeline monitoring and alerts',
        techStack: 'Node.js, React, Docker, Jenkins',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        teamMembers: [dev._id, devops._id],
        createdBy: admin._id,
        status: 'active'
      },
      {
        title: 'Cloud Monitoring Tool',
        description: 'Real-time AWS resource monitoring and cost alerting system',
        techStack: 'React, Node.js, AWS SDK, Socket.IO',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        teamMembers: [devops._id, qa._id, dev._id],
        createdBy: admin._id,
        status: 'active'
      }
    ]);

    // Create sample tasks
    await Task.insertMany([
      {
        title: 'Design chatbot conversation flow',
        description: 'Map out all possible user intents and bot responses',
        projectId: projects[0]._id,
        assignedTo: [dev._id],
        status: 'completed',
        priority: 'high',
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdBy: admin._id
      },
      {
        title: 'Integrate NLP model API',
        description: 'Connect the FastAPI backend to OpenAI or Hugging Face',
        projectId: projects[0]._id,
        assignedTo: [dev._id],
        status: 'in-progress',
        priority: 'critical',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdBy: admin._id
      },
      {
        title: 'Write test cases for chatbot',
        description: 'Cover edge cases, error handling, and performance tests',
        projectId: projects[0]._id,
        assignedTo: [qa._id],
        status: 'pending',
        priority: 'medium',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: admin._id
      },
      {
        title: 'Set up Jenkins pipeline',
        description: 'Configure automated build and deploy pipeline for CI/CD dashboard',
        projectId: projects[1]._id,
        assignedTo: [devops._id],
        status: 'in-progress',
        priority: 'high',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdBy: admin._id
      },
      {
        title: 'Build pipeline status UI',
        description: 'React dashboard showing live build status, logs, and metrics',
        projectId: projects[1]._id,
        assignedTo: [dev._id],
        status: 'pending',
        priority: 'high',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        createdBy: admin._id
      },
      {
        title: 'Configure AWS CloudWatch alerts',
        description: 'Set up billing, CPU, and memory alerts for production servers',
        projectId: projects[2]._id,
        assignedTo: [devops._id],
        status: 'blocked',
        priority: 'critical',
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        createdBy: admin._id
      }
    ]);

    // Create sample notifications
    await Notification.insertMany([
      { userId: dev._id,    message: 'You were assigned: Integrate NLP model API',     type: 'task_assigned'   },
      { userId: qa._id,     message: 'You were assigned: Write test cases for chatbot', type: 'task_assigned'   },
      { userId: devops._id, message: 'Configure AWS CloudWatch alerts is due tomorrow', type: 'deadline_alert'  },
      { userId: admin._id,  message: 'Task completed: Design chatbot conversation flow', type: 'task_completed' }
    ]);

    console.log('✅ Demo data seeded successfully');
  } catch (error) {
    console.error('Demo seed error:', error.message);
  }
};

module.exports = { seedDemoData };
