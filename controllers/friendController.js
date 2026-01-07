const prisma = require('../prismaClient');

// 1. List Users (Searchable)
exports.listUsers = async (req, res) => {
    try {
        const users = await prisma.users.findMany({
            where: {
                id: { not: req.user.id } // Don't show myself
            },
            select: { id: true, email: true, profile_pic: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
};

// 2. Send Friend Request
exports.sendRequest = async (req, res) => {
    const { receiverId } = req.body;
    try {
        // Check if request already exists
        const existing = await prisma.friendRequest.findFirst({
            where: {
                senderId: req.user.id,
                receiverId: receiverId
            }
        });
        if (existing) return res.status(400).json({ error: 'Request already sent' });

        const request = await prisma.friendRequest.create({
            data: {
                senderId: req.user.id,
                receiverId: receiverId,
                status: 'PENDING'
            }
        });
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send request' });
    }
};

// 3. Accept/Reject Request
exports.respondToRequest = async (req, res) => {
    const { requestId, status } = req.body; // status = 'ACCEPTED' or 'REJECTED'
    try {
        const request = await prisma.friendRequest.update({
            where: { id: requestId },
            data: { status: status }
        });
        res.json(request);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update request' });
    }
};

// 3.5 List Pending Requests (Incoming)
exports.listPendingRequests = async (req, res) => {
    try {
        const requests = await prisma.friendRequest.findMany({
            where: {
                receiverId: req.user.id,
                status: 'PENDING'
            },
            include: {
                sender: { select: { id: true, email: true, profile_pic: true } }
            }
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};

// 4. List My Friends (Accepted Only)
exports.listFriends = async (req, res) => {
    try {
        const friends = await prisma.friendRequest.findMany({
            where: {
                OR: [
                    { senderId: req.user.id, status: 'ACCEPTED' },
                    { receiverId: req.user.id, status: 'ACCEPTED' }
                ]
            },
            include: {
                sender: { select: { id: true, email: true, profile_pic: true } },
                receiver: { select: { id: true, email: true, profile_pic: true } }
            }
        });

        // Clean up data to just return "The Other Person"
        const formattedFriends = friends.map(f => {
            return f.senderId === req.user.id ? f.receiver : f.sender;
        });

        res.json(formattedFriends);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
};
