const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = require('./app'); // Import the app we prepared

let server;
const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV === 'production') {
    // In production (Render), allow the cloud provider to handle SSL (Termination)
    // The application itself runs on HTTP behind the proxy
    server = http.createServer(app);
    console.log(`Running in Production mode on port ${PORT}`);
} else {
    // Local Development
    try {
        const httpsOptions = {
            key: fs.readFileSync(path.join(__dirname, 'certificates', 'key.pem')),
            cert: fs.readFileSync(path.join(__dirname, 'certificates', 'cert.pem'))
        };
        server = https.createServer(httpsOptions, app);
        console.log(`Secure Server running locally on https://localhost:${PORT}`);
    } catch (e) {
        console.log('Certificates not found or invalid. Falling back to HTTP.');
        server = http.createServer(app);
        console.log(`Server running locally on http://localhost:${PORT}`);
    }
}

// Initialize Socket.io
const socketService = require('./services/socketService');
socketService.initSocket(server);

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});