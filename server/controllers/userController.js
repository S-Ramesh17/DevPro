// controllers/userController.js - Manage team members
const User = require('../models/User');

// Get all employees (non-admin users)
const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: { $ne: 'admin' } })
      .select('-password') // Never send passwords
      .sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (admin view)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an employee (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin' });

    await User.findByIdAndDelete(id);
    res.json({ message: 'Employee removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEmployees, getAllUsers, deleteUser };
