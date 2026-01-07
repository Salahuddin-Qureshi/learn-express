const prisma = require('../prismaClient');

// Service methods return DATA, not JSON responses
exports.getAllTodos = async (userId, skip, take) => {
    return await prisma.todos.findMany({
        where: { user_id: userId },
        skip: skip,
        take: take
    });
};

exports.countTodos = async (userId) => {
    return await prisma.todos.count({
        where: { user_id: userId }
    });
};

exports.createTodo = async (userId, taskText) => {
    return await prisma.todos.create({
        data: {
            task: taskText,
            user_id: userId
        }
    });
};

exports.updateTodo = async (userId, todoId, isCompleted) => {
    // Check if it exists first
    const todo = await prisma.todos.findFirst({
        where: { id: todoId, user_id: userId }
    });

    if (!todo) return null; // Return null if not found

    return await prisma.todos.update({
        where: { id: todoId },
        data: { completed: isCompleted }
    });
};

exports.deleteTodo = async (userId, todoId) => {
    const result = await prisma.todos.deleteMany({
        where: { id: todoId, user_id: userId }
    });
    return result.count > 0; // Return true if deleted, false if not found
};