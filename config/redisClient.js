// config/redisClient.js
const result = require('dotenv').config(); // Ensure env vars are loaded
const redis = require('redis');

// 1. Create the Client
const client = redis.createClient({
    // defaults to localhost:6379, usage matches Memurai defaults
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// 2. Handle Events
client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Connected to Redis'));

// 3. Connect! (Redis v4+ is async)
(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.error('Could not connect to Redis:', err);
    }
})();

// 4. Export the client
module.exports = client;