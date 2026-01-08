const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const redisClient = require('../config/redisClient');
const prisma = require('../prismaClient');

let io;

exports.initSocket = async (server) => {
    // 1. Initialize Socket.io
    io = new Server(server, {
        cors: {
            origin: [
                "http://localhost:5173",
                "http://localhost:3000",
                process.env.CLIENT_URL
            ],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // 2. Setup Redis Adapter (Pub/Sub)
    // We need a separate subClient for Redis Pub/Sub
    try {
        const pubClient = redisClient.duplicate();
        const subClient = redisClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        io.adapter(createAdapter(pubClient, subClient));
        console.log("Socket.io Initialized with Redis Adapter");
    } catch (err) {
        console.warn("⚠️ Redis Adapter failed to connect. Falling back to Memory Adapter.");
        console.warn("   Error:", err.message);
    }

    // 3. Middlewares (Optional: Auth)
    // io.use((socket, next) => { ... verify token ... });

    // 4. Connection Handler
    io.on('connection', (socket) => {
        console.log(`User Connected: ${socket.id}`);

        // A. Join User's Own Room (for private messages)
        // Client should send their userId upon connection or we get it from Auth
        socket.on('join_room', (userId) => {
            socket.join(`user_${userId}`);
            socket.data.userId = userId; // <--- STORE IT HERE
            console.log(`User ${userId} joined room user_${userId}`);
        });

        // B. Send Private Message
        socket.on('send_message', async (data) => {
            // data = { senderId, receiverId, content }
            console.log('Message Received:', data);

            // AUTO-FIX: Use stored userId if client forgets to send it
            const senderId = data.senderId || socket.data.userId;

            if (!senderId || !data.receiverId || !data.content) {
                console.error("❌ Invalid Message Data: Missing senderId, receiverId, or content");
                return;
            }

            // 1. Save to DB
            try {
                const savedMessage = await prisma.message.create({
                    data: {
                        content: data.content,
                        senderId: senderId,
                        receiverId: data.receiverId
                    }
                });

                // 2. Send to Receiver (Real-time)
                // Emit to "user_RECEIVER_ID" room
                io.to(`user_${data.receiverId}`).emit('receive_message', savedMessage);

                // 3. Send back to Sender (so they see it too, if they have multiple tabs)
                socket.emit('message_sent', savedMessage);

            } catch (err) {
                console.error('Error sending message:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log('User Disconnected', socket.id);
        });
    });

    console.log("Socket.io Initialized with Redis Adapter");
};

// Export io instance if needed elsewhere
exports.getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
