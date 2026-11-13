
-- ==========================================
-- Recipe Sharing Platform
-- Database Schema
-- PostgreSQL 15
-- ==========================================

-- ==========================================
-- 1. USERS TABLE
-- Stores registered user accounts
-- ==========================================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- 2. RECIPES TABLE
-- Stores recipes submitted by users
-- ==========================================

CREATE TABLE recipes (
    recipe_id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    title VARCHAR(150) NOT NULL,
    ingredients TEXT NOT NULL,
    instructions TEXT NOT NULL,

    cuisine VARCHAR(50) NOT NULL,
    meal_type VARCHAR(50) NOT NULL,

    cooking_time INTEGER NOT NULL
        CHECK (cooking_time > 0),

    difficulty VARCHAR(20) NOT NULL
        CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),

    image_path TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recipe_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- ==========================================
-- 3. DIETARY TAGS TABLE
-- Stores available dietary preferences
-- ==========================================

CREATE TABLE dietary_tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(50) NOT NULL UNIQUE
);


-- ==========================================
-- 4. RECIPE DIETARY TAGS TABLE
-- Connects recipes to dietary preferences
-- ==========================================

CREATE TABLE recipe_dietary_tags (
    recipe_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,

    PRIMARY KEY (recipe_id, tag_id),

    FOREIGN KEY (recipe_id)
        REFERENCES recipes(recipe_id)
        ON DELETE CASCADE,

    FOREIGN KEY (tag_id)
        REFERENCES dietary_tags(tag_id)
        ON DELETE CASCADE
);


-- ==========================================
-- 5. INDEXES
-- Improve commonly used database lookups
-- ==========================================

CREATE INDEX idx_recipes_user_id
    ON recipes(user_id);

CREATE INDEX idx_recipes_title
    ON recipes(title);

CREATE INDEX idx_recipes_cuisine
    ON recipes(cuisine);

CREATE INDEX idx_recipes_meal_type
    ON recipes(meal_type);

CREATE INDEX idx_recipe_dietary_tag
    ON recipe_dietary_tags(tag_id);
