const prisma = require('../prismaClient');

// GET /messages/:friendId
exports.getMessages = async (req, res) => {
    const friendId = parseInt(req.params.friendId);

    // Validate
    if (!friendId) return res.status(400).json({ error: 'Friend ID required' });

    try {
        // Fetch all messages where I am sender OR receiver, and the friend is the other party.
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: req.user.id, receiverId: friendId },
                    { senderId: friendId, receiverId: req.user.id }
                ]
            },
            orderBy: {
                createdAt: 'asc' // Oldest first (chat style)
            }
        });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
