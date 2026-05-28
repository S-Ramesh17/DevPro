// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getEmployees, getAllUsers, deleteUser } = require('../controllers/userController');

router.get('/', getAllUsers);
router.get('/employees', getEmployees);
router.delete('/:id', deleteUser);

module.exports = router;
