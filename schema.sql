-- E-Commerce Product Recommendation System PostgreSQL DDL Schema

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    image_url VARCHAR(500),
    stock INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- 3. User Behavior / Interactions Table
CREATE TABLE IF NOT EXISTS user_behavior (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'view', 'click', 'cart', 'purchase', 'rating'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    rating INTEGER, -- nullable, populated for rating action or reviews
    CONSTRAINT chk_rating CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
);
CREATE INDEX IF NOT EXISTS idx_behavior_user ON user_behavior(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_product ON user_behavior(product_id);
CREATE INDEX IF NOT EXISTS idx_behavior_action ON user_behavior(action_type);
CREATE INDEX IF NOT EXISTS idx_behavior_timestamp ON user_behavior(timestamp);

-- 4. ML Recommendations Cache Table
CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    score DOUBLE PRECISION NOT NULL,
    algorithm VARCHAR(100) NOT NULL, -- 'svd', 'content', 'hybrid', 'trending'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT _user_product_algo_uc UNIQUE (user_id, product_id, algorithm)
);
CREATE INDEX IF NOT EXISTS idx_recs_user ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recs_product ON recommendations(product_id);
CREATE INDEX IF NOT EXISTS idx_recs_algorithm ON recommendations(algorithm);
