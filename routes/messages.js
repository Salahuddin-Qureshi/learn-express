const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

// GET /messages/123 -> Fetch history with User 123
router.get('/:friendId', chatController.getMessages);

module.exports = router;
