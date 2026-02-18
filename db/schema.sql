DROP TABLE IF EXISTS post_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS authors;

CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    joined_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES authors(id),
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    body TEXT NOT NULL,
    published_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE post_tags (
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);