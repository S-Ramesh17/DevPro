// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, markAllRead } = require('../controllers/notificationController');

router.get('/:userId', getMyNotifications);
router.put('/:id/read', markAsRead);
router.put('/all/:userId/read', markAllRead);

module.exports = router;
