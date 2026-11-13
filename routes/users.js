
const express = require("express");
const pool = require("../db/pool");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/users/me
// Retrieve the currently logged-in user's profile
router.get("/me", requireAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT user_id, username, email, created_at
             FROM users
             WHERE user_id = $1`,
            [req.session.user.user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "User profile not found."
            });
        }

        return res.status(200).json({
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Profile retrieval error:", error);

        return res.status(500).json({
            error: "Unable to retrieve user profile."
        });
    }
});


// PUT /api/users/me
// Update the currently logged-in user's username and email
router.put("/me", requireAuth, async (req, res) => {
    try {
        const { username, email } = req.body;

        // 1. Validate required fields
        if (!username || !email) {
            return res.status(400).json({
                error: "Username and email are required."
            });
        }

        // 2. Normalize input
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

        // 3. Check whether another account uses this username or email
        const existingUser = await pool.query(
            `SELECT user_id
             FROM users
             WHERE (LOWER(username) = LOWER($1)
                OR LOWER(email) = LOWER($2))
                AND user_id <> $3`,
            [cleanUsername, cleanEmail, req.session.user.user_id]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: "That username or email is already in use."
            });
        }

        // 4. Update the user's profile
        const result = await pool.query(
            `UPDATE users
             SET username = $1, email = $2
             WHERE user_id = $3
             RETURNING user_id, username, email, created_at`,
            [cleanUsername, cleanEmail, req.session.user.user_id]
        );

        const updatedUser = result.rows[0];

        // 5. Update the session with the new user information
        req.session.user.username = updatedUser.username;
        req.session.user.email = updatedUser.email;

        return req.session.save((error) => {
            if (error) {
                console.error("Profile session update error:", error);

                return res.status(500).json({
                    error: "Profile updated, but session could not be saved."
                });
            }

            return res.status(200).json({
                message: "Profile updated successfully.",
                user: updatedUser
            });
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "That username or email is already in use."
            });
        }

        console.error("Profile update error:", error);

        return res.status(500).json({
            error: "Unable to update user profile."
        });
    }
});


module.exports = router;
