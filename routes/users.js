// GET /auth/active-users
const express = require('express');
const router = express.Router();
// const db = require('../db');
const authenticateToken = require('../middleware/auth'); // Import the Guard
const prisma = require('../prismaClient');


// router.get('/active-users', async (req, res) => {
//     try {
//         // SQL: Select users where last_login was in the last 1 HOUR
//         const sql = `
//             SELECT id, email, last_login 
//             FROM users 
//             WHERE last_login >= NOW() - INTERVAL '1 hour'
//         `;

//         const { rows } = await db.query(sql);

//         res.json({
//             count: rows.length,
//             users: rows
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

router.get('/active-users', async (req, res) => {
    try {
        // Look how readable this is! No more "SELECT * FROM WHERE..."
        const activeUsers = await prisma.users.findMany({
            where: {
                // "gte" means "Greater Than or Equal to"
                // We calculate the time 1 hour ago in JavaScript
                last_login: {
                    gte: new Date(Date.now() - 60 * 60 * 1000)
                }
            },
            select: {
                id: true,
                email: true,
                last_login: true
            }
        });

        res.json({
            count: activeUsers.length,
            users: activeUsers
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;