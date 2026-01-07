const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const prisma = require('../prismaClient');
const crypto = require('crypto');



function generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
}


exports.register = async (req, res) => {
    // 1. Validation Logic
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        // 2. Business Logic
        const { email, password } = req.body;

        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: "Profile picture is required" });
        }
        const profilePicPath = req.file.path;

        const existingUser = await prisma.users.findUnique({
            where: {
                email: email
            }
        });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.users.create({
            data: {
                email: email,
                password: hashedPassword,
                profile_pic: profilePicPath
            }
        });

        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and Password are required" });
    }

    try {
        const existingUser = await prisma.users.findUnique({
            where: {
                email: email
            }
        });
        if (!existingUser) return res.status(400).json({ error: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, existingUser.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // 4. Generate the Token
        const accessToken = jwt.sign(
            { id: existingUser.id, email: existingUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 3. Generate Refresh Token (Long Lived - 7 days)
        const refreshToken = generateRefreshToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

        // 4. Save Refresh Token to DB
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                user_id: existingUser.id,
                expires_at: expiresAt
            }
        });

        // Capture IP
        const userIp = req.ip || req.socket.remoteAddress;

        // Update Login Time
        await prisma.users.update({
            where: {
                id: existingUser.id
            },
            data: {
                last_login: new Date(),
                ip_address: userIp
            }
        });

        // 5. Send Token
        // res.json({
        //     message: "Login successful",
        //     accessToken: accessToken,
        //     refreshToken: refreshToken
        // });

        // 5. Send Token
        // Cookie Options
        const cookieOptions = {
            httpOnly: true, // JS cannot read this
            secure: true,   // HTTPS only (we have https!)
            sameSite: 'None', // Needed for cross-origin (port 5173 -> 4000)
            expires: expiresAt
        };

        res.cookie('refreshToken', refreshToken, cookieOptions); // Set Cookie

        res.json({
            message: "Login successful",
            accessToken: accessToken,
            user: {
                id: existingUser.id,
                email: existingUser.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.refreshToken = async (req, res) => {
    // const { refreshToken } = req.body;
    const refreshToken = req.cookies.refreshToken; // <-- NEW (read from cookie)
    if (!refreshToken) return res.status(400).json({ error: "Token required" });

    try {
        // 1. Find Token in DB
        const tokenRecord = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { users: true } // getting user data too
        });

        // 2. Security Checks
        if (!tokenRecord) {
            // Token doesn't exist? Maybe a hacker trying random strings.
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        if (tokenRecord.revoked) {
            // CRITICAL: Token reused! This refers to the "Family" security check.
            // A hacker (or you) tried to use an old token.
            // Action: Revoke ALL tokens for this user.
            await prisma.refreshToken.updateMany({
                where: { user_id: tokenRecord.user_id },
                data: { revoked: true }
            });
            return res.status(403).json({ error: "Breach detected. Please login again." });
        }

        if (new Date() > tokenRecord.expires_at) {
            return res.status(403).json({ error: "Token expired" });
        }

        // 3. Rotation (The Magic)
        // A. Revoke the OLD one
        await prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revoked: true }
        });

        // B. Generate NEW one
        const newRefreshToken = generateRefreshToken();
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 7);

        await prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                user_id: tokenRecord.user_id,
                expires_at: newExpiresAt
            }
        });

        // C. Generate NEW Access Token
        const newAccessToken = jwt.sign(
            { id: tokenRecord.user_id, email: tokenRecord.users.email },
            process.env.JWT_SECRET,
            { expiresIn: '1m' }
        );

        // 4. Send Token
        // Cookie Options
        const cookieOptions = {
            httpOnly: true, // JS cannot read this
            secure: true,   // HTTPS only (we have https!)
            sameSite: 'None', // Needed for cross-origin (port 5173 -> 4000)
            expires: newExpiresAt
        };

        res.cookie('refreshToken', newRefreshToken, cookieOptions); // Set Cookie

        res.json({
            message: "Refresh token generated successfully",
            accessToken: newAccessToken,
            user: {
                id: tokenRecord.user_id,
                email: tokenRecord.users.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.logout = (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    };

    res.clearCookie('refreshToken', cookieOptions);
    res.json({ message: "Logged out successfully" });
};