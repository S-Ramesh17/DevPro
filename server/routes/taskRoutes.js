// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getMyTasks,
  updateTaskStatus,
  deleteTask,
  getSuggestedEmployees,
  getAnalytics
} = require('../controllers/taskController');

router.post('/', createTask);
router.get('/', getAllTasks);
router.get('/analytics', getAnalytics);
router.get('/suggest', getSuggestedEmployees);   // ?role=developer
router.get('/my/:userId', getMyTasks);
router.put('/:id', updateTaskStatus);
router.delete('/:id', deleteTask);

module.exports = router;
