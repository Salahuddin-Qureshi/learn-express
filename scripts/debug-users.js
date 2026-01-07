const prisma = require('../prismaClient');

async function checkUsers() {
    const users = await prisma.users.findMany({
        select: { id: true, email: true, last_login: true }
    });
    console.log('--- DB DUMP ---');
    console.log(users);
    console.log('--- Current Server Time ---');
    console.log(new Date());
}

checkUsers()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
