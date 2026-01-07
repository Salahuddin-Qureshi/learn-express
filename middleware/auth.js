const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access Denied: No Token Provided!" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid Token" });
        }

        // 🟢 DEBUG LOG 1: Token is valid
        console.log("✅ Token Verified for User:", user.id);

        req.user = user;

        // Wrap the DB part in a TRY block so it never crashes the request
        try {
            const userIp = req.ip || req.socket.remoteAddress || '0.0.0.0';

            // 🟢 DEBUG LOG 2: Attempting DB Update
            console.log("⏳ Updating IP for user:", user.id);

            // Use Prisma instead of raw SQL
            await prisma.users.update({
                where: { id: user.id },
                data: {
                    last_login: new Date(),
                    ip_address: userIp
                }
            });

        } catch (dbError) {
            // If DB fails, just log it, BUT allow the user to proceed!
            console.error("⚠️ Tracking Error (Ignored):", dbError.message);
        }

        // 🟢 DEBUG LOG 3: Moving to Next()
        console.log("➡️ Calling next()");

        next(); // Use next() to pass control to the route
    });
}

module.exports = authenticateToken;
