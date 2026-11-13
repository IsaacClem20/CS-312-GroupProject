
// Import PostgreSQL connection pool
const pool = require("./db/pool");

// Load environment variables from .env
require("dotenv").config();

// Import Express
const express = require("express");

// Initialize Express application
const app = express();

// Configure middleware to parse incoming JSON requests
app.use(express.json());

// Configure middleware to parse form submissions
app.use(express.urlencoded({ extended: true }));

// Set the server port
const PORT = process.env.PORT || 3000;

// Basic homepage route
app.get("/", (req, res) => {
    res.send("Recipe Sharing Platform API is running!");
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Server is running successfully"
    });
});

// Test PostgreSQL database connection
app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT NOW() AS current_time"
        );

        res.json({
            status: "Connected",
            database: "recipe_sharing_db",
            time: result.rows[0].current_time
        });

    } catch (error) {
        console.error("Database connection failed:", error);

        res.status(500).json({
            status: "Error",
            message: "Could not connect to PostgreSQL"
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
