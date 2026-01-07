const todoService = require('../services/todoService');
const Joi = require('joi');
const redisClient = require('../config/redisClient');

// Helper to generate a unique cache key for a user
const getCacheKey = (userId, page, limit) => `todos:${userId}:p${page}:l${limit}`;

// Helper to invalidate all cache keys for a specific user
const invalidateUserCache = async (userId) => {
    // This finds keys matching the pattern and deletes them
    // Note: In a massive production app, 'keys' command is slow, but fine for learning.
    const keys = await redisClient.keys(`todos:${userId}:*`);
    if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(`🗑️ Cleared cache for user ${userId}`);
    }
};


exports.getTodos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;
        const skip = (page - 1) * limit;

        // 1. GENERATE CACHE KEY
        const cacheKey = getCacheKey(req.user.id, page, limit);

        // 2. CHECK REDIS CACHE
        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log('⚡ Using Redis Cache');
                return res.json(JSON.parse(cachedData));
            }
        } catch (err) {
            console.error('Redis Error:', err);
            // Fallback to database if Redis fails
        }

        console.log('🐢 Using Database');

        // 3. FETCH FROM DB
        const todos = await todoService.getAllTodos(req.user.id, skip, limit);
        const total = await todoService.countTodos(req.user.id);

        const responseData = {
            page: page,
            limit: limit,
            todos: todos,
            totalTodos: total
        };

        // 4. SAVE TO REDIS (Set expiry to 1 hour)
        try {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
        } catch (err) {
            console.error('Redis Save Error:', err);
        }

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
};

exports.addTodo = async (req, res) => {
    try {
        const schema = Joi.object({
            task: Joi.string().required(),
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const newTodo = await todoService.createTodo(req.user.id, req.body.task);

        // Invalidate Cache
        await invalidateUserCache(req.user.id);

        res.status(201).json(newTodo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create todo' });
    }
};

exports.updateTodo = async (req, res) => {
    try {
        const updated = await todoService.updateTodo(
            req.user.id,
            parseInt(req.body.id),
            req.body.completed === 'true' || req.body.completed === true
        );

        if (!updated) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Invalidate Cache
        await invalidateUserCache(req.user.id);

        res.json({ message: 'Todo updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update todo' });
    }
};

exports.deleteTodo = async (req, res) => {
    try {
        const success = await todoService.deleteTodo(req.user.id, parseInt(req.body.id));

        if (!success) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Invalidate Cache
        await invalidateUserCache(req.user.id);

        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete todo' });
    }
};