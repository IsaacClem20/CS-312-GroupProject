
-- ==========================================
-- Recipe Sharing Platform
-- Initial Database Seed Data
-- PostgreSQL 15
-- ==========================================

-- Insert predefined dietary tags

INSERT INTO dietary_tags (tag_name)
VALUES
    ('Vegetarian'),
    ('Vegan'),
    ('Gluten-Free'),
    ('Dairy-Free'),
    ('Nut-Free'),
    ('Low-Carb'),
    ('Keto'),
    ('Pescatarian')
ON CONFLICT (tag_name) DO NOTHING;
