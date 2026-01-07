const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs'); // Import the hashing tool
const jwt = require('jsonwebtoken'); // Import the new library
const authenticateToken = require('../middleware/auth'); // Import the Guard
const Joi = require('joi');
const authController = require('../controllers/authController'); // Import the brain
const upload = require('../middleware/upload'); // Import the middleware


// LOOK HOW CLEAN THIS IS! 👇
// router.post('/register', authController.register);
// 'profilePic' is the name of the field coming from the frontend/Postman
router.post('/register', upload.single('profile_pic'), authController.register);

router.post('/login', authController.login);

router.post('/refresh-token', authController.refreshToken);

router.post('/logout', authController.logout);


// REGISTER ROUTE
// router.post('/register', async (req, res) => {
//     const { email, password } = req.body;

//     const registerSchema = Joi.object({
//     email: Joi.string().email().required(),
//     password: Joi.string().min(6).required()
//     });

//     // 1. Validation
//     const { error } = registerSchema.validate({ email, password });
//     if (error) {
//         return res.status(400).json({ error: error.details[0].message });
//     }

//     try {
//         // 2. Check if user already exists
//         const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

//         if (existingUser.length > 0) {
//             return res.status(400).json({ error: "User already exists" });
//         }

//         // 3. Hash the Password (The Magic Step) 🔒
//         // 10 is the "salt rounds" (how slow/secure the process is)
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // 4. Save User to Database
//         await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

//         res.status(201).json({ message: "User registered successfully!" });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Server error" });
//     }
// });

// POST /auth/register
// router.post('/register', async (req, res) => {

//     // --- 🛡️ VALIDATION START ---

//     // 1. Define the Rules
//     const schema = Joi.object({
//         email: Joi.string().email().required().messages({
//             'string.email': 'Please enter a valid email address',
//             'any.required': 'Email is required'
//         }),
//         password: Joi.string().min(6).required().messages({
//             'string.min': 'Password must be at least 6 characters long'
//         })
//     });

//     // 2. Validate the incoming data (req.body)
//     // abortEarly: false means "Show ALL errors", not just the first one
//     const { error } = schema.validate(req.body);

//     // 3. If there is an error, STOP here!
//     if (error) {
//         // We return the specific message from Joi (e.g., "Password must be at least 6 characters")
//         return res.status(400).json({ error: error.details[0].message });
//     }

//     // --- 🛡️ VALIDATION END ---


//     // ... The rest of your existing logic (Check DB, Hash Password, Save) ...
//     const { email, password } = req.body;

//     try {
//         const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
//         if (existingUser.length > 0) return res.status(400).json({ error: "User already exists" });

//         const hashedPassword = await bcrypt.hash(password, 10);
//         await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

//         res.status(201).json({ message: "User registered successfully!" });
//     } catch (err) {
//         res.status(500).json({ error: "Server error" });
//     }
// });



// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     if (!email || !password) {
//         return res.status(400).json({ error: "Email and Password are required" });
//     }

//     try{
//         const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
//         if (rows.length === 0) {
//             return res.status(400).json({ error: "Invalid email or password" });
//         }

//         const user = rows[0];
//         const isMatch = await bcrypt.compare(password, user.password);
//         console.log(rows[0].email);

//         if (!isMatch) {
//             return res.status(400).json({ error: "Invalid email or password" });
//         }

//         // 4. Generate the Token (The "Badge")
//         // We put the user.id INSIDE the token payload


//         const token = jwt.sign(
//             { id: user.id, email: user.email },             // Payload (Data hidden in token)
//             process.env.JWT_SECRET,      // Secret Key
//             { expiresIn: '1h' }          // Token expires in 1 hour
//         );

//         // 🕵️‍♂️ CAPTURE IP HERE
//         // '::1' means Localhost. Real IPs show up when deployed.
//         const userIp = req.ip || req.socket.remoteAddress;

//         // ✅ UPDATE BOTH: Time AND IP Address
//         await db.query('UPDATE users SET last_login = NOW(), ip_address = ? WHERE id = ?', [userIp, user.id]);

//         // 5. Send Token to user
//         res.json({ 
//             message: "Login successful", 
//             token: token 
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Server error" });
//     }
// });

module.exports = router;