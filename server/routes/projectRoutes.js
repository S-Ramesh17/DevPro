// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { createProject, getProjects, getMyProjects, deleteProject } = require('../controllers/projectController');

router.post('/', createProject);
router.get('/', getProjects);
router.get('/my/:userId', getMyProjects);
router.delete('/:id', deleteProject);

module.exports = router;
