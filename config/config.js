require('dotenv').config();

// Validation: Check for missing keys immediately!
const requiredEnvs = ['DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];

requiredEnvs.forEach((key) => {
    if (!process.env[key]) {
        console.error(`❌ FATAL ERROR: Missing ${key} in .env file`);
        process.exit(1);
    }
});

const config = {
    port: process.env.PORT || 4000,
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h'
    }
};

module.exports = config;