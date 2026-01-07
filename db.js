const { Pool } = require('pg');
const config = require('./config/config');

const pool = new Pool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    port: config.db.port,
});

// Debugging: Check if config is loaded (Don't log the actual password!)
console.log("-----------------------------------------");
console.log("🔌 Database Config Check:");
console.log("   Host:", process.env.DB_HOST);
console.log("   User:", process.env.DB_USER);
console.log("   Database:", process.env.DB_NAME);
console.log("   Password Type:", typeof process.env.DB_PASSWORD);
console.log("-----------------------------------------");

if (!process.env.DB_PASSWORD) {
    console.error("❌ ERROR: DB_PASSWORD is missing in .env file!");
}

module.exports = pool;

