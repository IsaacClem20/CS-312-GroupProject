
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db/pool");

const router = express.Router();

// POST /api/auth/register
// Creates a new user account
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                error: "Username, email, and password are required."
            });
        }

        // 2. Normalize username and email
        const cleanUsername = username.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanUsername || !cleanEmail) {
            return res.status(400).json({
                error: "Username and email cannot be empty."
            });
        }

        if (cleanUsername.length > 50 || cleanEmail.length > 255) {
            return res.status(400).json({
                error: "Username or email is too long."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: "Password must be at least 8 characters long."
            });
        }

        // 3. Check whether username or email already exists
        const existingUser = await pool.query(
            `SELECT user_id
             FROM users
             WHERE LOWER(username) = LOWER($1)
                OR LOWER(email) = LOWER($2)`,
            [cleanUsername, cleanEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: "That username or email is already registered."
            });
        }

        // 4. Hash the password before storing it
        const passwordHash = await bcrypt.hash(password, 12);

        // 5. Insert the new user into PostgreSQL
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING user_id, username, email, created_at`,
            [cleanUsername, cleanEmail, passwordHash]
        );

        const newUser = result.rows[0];

        // 6. Create a fresh session for the newly registered user
        req.session.regenerate((sessionError) => {
            if (sessionError) {
                console.error("Session creation error:", sessionError);

                return res.status(500).json({
                    error: "Account created, but login could not be established."
                });
            }

            req.session.user = {
                user_id: newUser.user_id,
                username: newUser.username,
                email: newUser.email
            };

            req.session.save((saveError) => {
                if (saveError) {
                    console.error("Session save error:", saveError);

                    return res.status(500).json({
                        error: "Account created, but login could not be established."
                    });
                }

                return res.status(201).json({
                    message: "Account created successfully.",
                    user: req.session.user
                });
            });
        });

    } catch (error) {
        // Handle duplicate username/email conflicts
        if (error.code === "23505") {
            return res.status(409).json({
                error: "That username or email is already registered."
            });
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            error: "An unexpected error occurred during registration."
        });
    }
});


// POST /api/auth/login
// Authenticates an existing user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required."
            });
        }

        // 2. Normalize the email
        const cleanEmail = email.trim().toLowerCase();

        // 3. Find the user in PostgreSQL
        const result = await pool.query(
            `SELECT user_id, username, email, password_hash
             FROM users
             WHERE LOWER(email) = LOWER($1)`,
            [cleanEmail]
        );

        // 4. Check whether the account exists
        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "Invalid email or password."
            });
        }

        const user = result.rows[0];

        // 5. Compare the submitted password with the stored hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Invalid email or password."
            });
        }

        // 6. Regenerate the session after successful authentication
        req.session.regenerate((sessionError) => {
            if (sessionError) {
                console.error("Session regeneration error:", sessionError);

                return res.status(500).json({
                    error: "Unable to establish login session."
                });
            }

            // Store basic user information in the session
            req.session.user = {
                user_id: user.user_id,
                username: user.username,
                email: user.email
            };

            // 7. Save the session
            req.session.save((saveError) => {
                if (saveError) {
                    console.error("Login session save error:", saveError);

                    return res.status(500).json({
                        error: "Unable to save login session."
                    });
                }

                return res.status(200).json({
                    message: "Login successful.",
                    user: req.session.user
                });
            });
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            error: "An unexpected error occurred during login."
        });
    }
});


// POST /api/auth/logout
// Logs out the currently authenticated user
router.post("/logout", (req, res) => {

    // Check whether a session exists
    if (!req.session) {
        return res.status(401).json({
            error: "You are not logged in."
        });
    }

    // Destroy the current session
    req.session.destroy((error) => {
        if (error) {
            console.error("Logout error:", error);

            return res.status(500).json({
                error: "Unable to log out."
            });
        }

        // Clear the session cookie from the browser
        res.clearCookie("connect.sid");

        return res.status(200).json({
            message: "Logout successful."
        });
    });
});

module.exports = router;
