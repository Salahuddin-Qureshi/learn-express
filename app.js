const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// 1. Security Headers (Helmet)
// Helps secure your apps by setting various HTTP headers.
app.use(helmet({
    crossOriginResourcePolicy: false, // Allow loading images from different origins/protocols
}));

// 2. CORS (Cross-Origin Resource Sharing)
// Allows legitimate requests from other origins (e.g., your frontend).
// app.use(cors());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.CLIENT_URL // Add your deployed Frontend URL here in Render Env Vars
    ],
    credentials: true
}));
const cookieParser = require('cookie-parser'); // Import this
app.use(cookieParser()); // Use this

// 3. Logging (Morgan)
// Logs details about each request (method, URL, status, time) to the console.
app.use(morgan('dev'));

// 4. Rate Limiting
// Limits repeated requests to public APIs and/or endpoints such as password reset.
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes.'
});

// Serve Static Files (e.g., uploaded images)
// This makes http://localhost:4000/uploads/my-pic.jpg work
app.use('/uploads', express.static('uploads'));

// Apply the rate limiting middleware to all requests
app.use(limiter);
// require('express-async-errors'); // 1. IMPORT THIS AT THE VERY TOP (Crucial!)
// Import your new Error Handler
const errorHandler = require('./middleware/errorHandler');
const todoRoutes = require('./routes/todos'); // Import the file we just made
const authRoutes = require('./routes/auth'); // Import the file we just made
const userRoutes = require('./routes/users'); // Import the file we just made

app.use(express.json());

// THIS IS THE MAGIC LINE
// It says: "Any URL that starts with /todos, send it to the todoRoutes file"

app.get('/', (req, res) => {
    res.send('Welcome to the Home Page of the Todo App!');
});

app.use('/todos', todoRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/friends', require('./routes/friends'));
app.use('/messages', require('./routes/messages')); // <--- Add Messages Route

// 404 Handler (Page Not Found)
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error); // Pass it to the Global Error Handler
});

// 🛑 2. USE ERROR HANDLER AT THE VERY END
// Put this AFTER all routes, but BEFORE app.listen
app.use(errorHandler);

// HTTPS Options
// const httpsOptions = {
//     key: fs.readFileSync(path.join(__dirname, 'certificates', 'key.pem')),
//     cert: fs.readFileSync(path.join(__dirname, 'certificates', 'cert.pem'))
// };

// const server = https.createServer(httpsOptions, app);

// server.listen(4000, () => {
//     console.log('Secure Server running on port https://localhost:4000');
// });


module.exports = app;