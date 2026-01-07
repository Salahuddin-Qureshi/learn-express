const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const authenticateToken = require('../middleware/auth');

// All routes require login
router.use(authenticateToken);

router.get('/users', friendController.listUsers);          // List all users to add
router.post('/request', friendController.sendRequest);     // Send a request
router.get('/requests', friendController.listPendingRequests); // <--- See who wants to be friends
router.put('/respond', friendController.respondToRequest); // Accept/Reject
router.get('/', friendController.listFriends);             // List my friends

module.exports = router;
