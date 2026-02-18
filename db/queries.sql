SELECT title FROM posts;

SELECT p.title, a.name AS author
FROM posts p
JOIN authors a ON a.id = p.author_id;

SELECT * FROM authors;

SELECT * FROM authors ORDER BY name ASC;

SELECT a.name, COUNT(p.id) AS post_count
FROM authors a
LEFT JOIN posts p ON p.author_id = a.id
GROUP BY a.id, a.name
ORDER BY post_count DESC;

SELECT p.title, p.summary, p.published_at
FROM posts p
JOIN authors a ON a.id = p.author_id
WHERE a.id = 3;

SELECT title, published_at FROM posts ORDER BY published_at ASC;

SELECT * FROM tags;

SELECT t.name, COUNT(pt.post_id) AS usage_count
FROM tags t
LEFT JOIN post_tags pt ON pt.tag_id = t.id
GROUP BY t.id, t.name
ORDER BY usage_count DESC;

SELECT t.name
FROM tags t
JOIN post_tags pt ON pt.tag_id = t.id
WHERE pt.post_id = 1;

SELECT p.title, p.summary, p.published_at
FROM posts p
JOIN post_tags pt ON pt.post_id = p.id
WHERE pt.tag_id = 1;
