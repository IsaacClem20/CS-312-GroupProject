
const express = require("express");
const pool = require("../db/pool");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/recipes
// Create a new recipe
router.post("/", requireAuth, async (req, res) => {
    const {
        title,
        ingredients,
        instructions,
        cuisine,
        meal_type,
        cooking_time,
        difficulty,
        dietary_tags
    } = req.body;

    const userId = req.session.user.user_id;

    try {
        // 1. Validate required fields
        if (
            !title || !ingredients || !instructions ||
            !cuisine || !meal_type || !cooking_time || !difficulty
        ) {
            return res.status(400).json({
                error: "All required recipe fields must be provided."
            });
        }

        // 2. Validate and normalize input
        const cleanTitle = title.trim();
        const cleanIngredients = ingredients.trim();
        const cleanInstructions = instructions.trim();
        const cleanCuisine = cuisine.trim();
        const cleanMealType = meal_type.trim();
        const cleanDifficulty = difficulty.trim();

        const cookingTime = Number(cooking_time);

        if (
            !cleanTitle || !cleanIngredients || !cleanInstructions ||
            !cleanCuisine || !cleanMealType
        ) {
            return res.status(400).json({
                error: "Recipe fields cannot contain only whitespace."
            });
        }

        if (
            !Number.isInteger(cookingTime) ||
            cookingTime <= 0
        ) {
            return res.status(400).json({
                error: "Cooking time must be a positive whole number."
            });
        }

        if (!["Easy", "Medium", "Hard"].includes(cleanDifficulty)) {
            return res.status(400).json({
                error: "Difficulty must be Easy, Medium, or Hard."
            });
        }

        // 3. Validate dietary tags
        const tags = dietary_tags === undefined ? [] : dietary_tags;

        if (!Array.isArray(tags)) {
            return res.status(400).json({
                error: "Dietary tags must be provided as an array."
            });
        }

        const cleanTags = [...new Set(tags)];

        if (
            cleanTags.some(tag =>
                typeof tag !== "string" || !tag.trim()
            )
        ) {
            return res.status(400).json({
                error: "Dietary tags must contain valid tag names."
            });
        }

        const normalizedTags = cleanTags.map(tag => tag.trim());

        // 4. Start a database transaction
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // Insert the recipe
            const recipeResult = await client.query(
                `INSERT INTO recipes (
                    user_id,
                    title,
                    ingredients,
                    instructions,
                    cuisine,
                    meal_type,
                    cooking_time,
                    difficulty
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *`,
                [
                    userId,
                    cleanTitle,
                    cleanIngredients,
                    cleanInstructions,
                    cleanCuisine,
                    cleanMealType,
                    cookingTime,
                    cleanDifficulty
                ]
            );

            const newRecipe = recipeResult.rows[0];

            // Associate dietary tags with the recipe
            for (const tagName of normalizedTags) {
                const tagResult = await client.query(
                    `SELECT tag_id
                     FROM dietary_tags
                     WHERE LOWER(tag_name) = LOWER($1)`,
                    [tagName]
                );

                if (tagResult.rows.length === 0) {
                    throw new Error(`Unknown dietary tag: ${tagName}`);
                }

                await client.query(
                    `INSERT INTO recipe_dietary_tags (recipe_id, tag_id)
                     VALUES ($1, $2)`,
                    [newRecipe.recipe_id, tagResult.rows[0].tag_id]
                );
            }

            await client.query("COMMIT");

            return res.status(201).json({
                message: "Recipe created successfully.",
                recipe: newRecipe,
                dietary_tags: normalizedTags
            });

        } catch (error) {
            await client.query("ROLLBACK");
            throw error;

        } finally {
            client.release();
        }

    } catch (error) {
        if (error.message.startsWith("Unknown dietary tag:")) {
            return res.status(400).json({
                error: error.message
            });
        }

        console.error("Recipe creation error:", error);

        return res.status(500).json({
            error: "Unable to create recipe."
        });
    }
});

module.exports = router;
