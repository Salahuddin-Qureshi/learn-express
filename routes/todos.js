const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const todoController = require('../controllers/todoController'); // Import Controller

router.use(express.json());

// Routes just map URLs to Controller Functions
router.get('/', authenticateToken, todoController.getTodos);
router.post('/addtodos', authenticateToken, todoController.addTodo);
router.put('/updatetodos', authenticateToken, todoController.updateTodo);
router.delete('/deletetodos', authenticateToken, todoController.deleteTodo);

module.exports = router;