-- 1. Create 'users' table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    last_login TIMESTAMP DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL
);

-- 2. Create 'todos' table
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    task VARCHAR(255) NOT NULL,
    user_id INT,
    completed BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Insert Dummy Users
INSERT INTO users (email, password, last_login, ip_address) VALUES 
('ali@example.com', 'fake_hash_123', NOW(), '::1'),
('salahuddi@example.com', 'fake_hash_456', NOW(), '192.168.1.5');

-- 4. Insert Dummy Todos
INSERT INTO todos (task, user_id) VALUES 
('Learn Express.js', 1),
('Fix Database Error', 1),
('Setup Authentication', 1),
('Project Planning', 2),
('Design UI', 2);
