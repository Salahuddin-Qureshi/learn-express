-- 1. Clean up old tables (Safety Step)
-- We drop 'todos' first because it depends on 'users'
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS users;

-- 2. Create 'users' table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    last_login DATETIME DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL
);

-- 3. Create 'todos' table
CREATE TABLE todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task VARCHAR(255) NOT NULL,
    user_id INT,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Insert Dummy Users
-- (Note: 'fake_hash' means you can't login as these users via API, 
--  but they exist for testing database relationships)
INSERT INTO users (id, email, password, last_login, ip_address) VALUES 
(1, 'ali@example.com', 'fake_hash_123', NOW(), '::1'),
(2, 'salahuddi@example.com', 'fake_hash_456', NOW(), '192.168.1.5');

-- 5. Insert Dummy Todos (Linked to User 1 and User 2)
INSERT INTO todos (task, user_id) VALUES 
('Learn Express.js', 1),
('Fix Database Error', 1),
('Setup Authentication', 1),
('Buy Groceries', 1),
('Go to Gym', 1),
('Read Documentation', 1),
('Test Pagination', 1),
('Write SQL Script', 1),
('Deploy to Render', 1),
('Sleep', 1),
('Project Planning', 2),
('Design UI', 2);