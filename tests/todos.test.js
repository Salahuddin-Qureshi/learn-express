const request = require('supertest');
const app = require('../app');
const prisma = require('../prismaClient'); // Import Prisma to clean up DB

describe('Full API Integration Test', () => {

    let token = '';
    const testUser = {
        email: `test_${Date.now()}@example.com`,
        password: 'password123'
    };
    let todoId = 0;

    // 🧹 Clean up before we start (Optional but good practice)
    beforeAll(async () => {
        // await prisma.users.deleteMany({ where: { email: testUser.email } });
    });

    // 🧹 Clean up after we finish
    afterAll(async () => {
        // Delete the test user and their todos (Cascade delete handles todos)
        await prisma.users.deleteMany({
            where: {
                email: testUser.email
            }
        });
        await prisma.$disconnect();
    });

    // TEST 1: Register User
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toContain('User registered successfully');
    });

    // TEST 2: Login & Get Token
    it('should login and return a token', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send(testUser);

        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
        token = res.body.token; // 🔑 Save token for next steps
    });

    // TEST 3: Create Todo (Using Token)
    it('should create a new todo', async () => {
        const res = await request(app)
            .post('/todos/addtodos')
            .set('Authorization', `Bearer ${token}`) // 🛡️ Attach Token
            .send({ task: 'Test Jest Task' });

        expect(res.statusCode).toEqual(201);
        expect(res.body.task).toEqual('Test Jest Task');
        todoId = res.body.id; // 📌 Save ID for Update/Delete
    });

    // TEST 4: Get Todos
    it('should fetch all todos', async () => {
        const res = await request(app)
            .get('/todos')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });

    // TEST 5: Update Todo
    it('should mark todo as completed', async () => {
        const res = await request(app)
            .put('/todos/updatetodos')
            .set('Authorization', `Bearer ${token}`)
            .send({
                id: todoId,
                completed: true
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toContain('Todo updated successfully');
    });

    // TEST 6: Delete Todo
    it('should delete the todo', async () => {
        const res = await request(app)
            .delete('/todos/deletetodos')
            .set('Authorization', `Bearer ${token}`)
            .send({ id: todoId });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toContain('Item deleted successfully');
    });

});