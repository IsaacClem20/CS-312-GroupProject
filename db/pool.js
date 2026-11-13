
// Import the PostgreSQL client
const { Pool } = require("pg");

// Load environment variables
require("dotenv").config();

// Create a connection pool using environment variables
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Log successful database connections
pool.on("connect", () => {
    console.log("Connected to PostgreSQL database.");
});

// Handle unexpected database errors
pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL error:", err);
});

// Export the pool so other files can use it
module.exports = pool;
