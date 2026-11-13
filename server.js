// Required imports
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const authRoutes = require("./routes/auth");
const requireAuth = require("./middleware/authMiddleware");
const userRoutes = require("./routes/users");
const recipeRoutes = require("./routes/recipes");

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

// Configure session management using PostgreSQL
app.use(
    session({
        store: new PgSession({
            pool: pool,
            createTableIfMissing: true
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            httpOnly: true,
            secure: false, // Set to true when deploying with HTTPS
            sameSite: "lax"
        }
    })
);

// Set the server port
const PORT = process.env.PORT || 3000;

// Authentication routes
app.use("/api/auth", authRoutes);

// Temporary endpoint to test authentication middleware
app.get("/api/protected-test", requireAuth, (req, res) => {
    res.json({
        message: "You are authenticated!",
        user: req.session.user
    });
});

// User profile routes
app.use("/api/users", userRoutes);

// Recipe management routes
app.use("/api/recipes", recipeRoutes);

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
