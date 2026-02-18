SELECT title FROM posts;

SELECT p.title, a.name AS author
FROM posts p
JOIN post_authors pa ON pa.post_id = p.id
JOIN authors a ON a.id = pa.author_id;

SELECT * FROM authors;

SELECT * FROM authors ORDER BY name ASC;

SELECT a.name, COUNT(pa.post_id) AS post_count
FROM authors a
LEFT JOIN post_authors pa ON pa.author_id = a.id
GROUP BY a.id, a.name
ORDER BY post_count DESC;

SELECT p.title, p.summary, p.published_at
FROM posts p
JOIN post_authors pa ON pa.post_id = p.id
WHERE pa.author_id = 3;

SELECT title, published_at FROM posts ORDER BY published_at ASC;

SELECT a.name
FROM authors a
JOIN post_authors pa ON pa.author_id = a.id
WHERE pa.post_id = 2;

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

-- ============================================================
-- Task 4: What else could we add to this database?
-- ============================================================
--
-- 1. Comments — a comments table with post_id FK, author name
--    or user_id, body, and created_at. Supports threaded
--    replies via a parent_comment_id self-referencing FK.
--
-- 2. Categories — broader groupings than tags, e.g. "Opinion",
--    "News", "Review". Each post belongs to one category
--    (many-to-one), giving an extra level of organisation.
--
-- 3. Likes / Reactions — a table linking users to posts (or
--    comments) with a reaction type. Unique constraint on
--    (user_id, post_id) prevents duplicate likes.
--
-- 4. Media / Images — a table storing image URLs, alt text,
--    width, height, and a position for ordering. Linked to
--    posts via post_id FK, allowing multiple images per post.
--
-- 5. Draft / Published status — add a `status` column to
--    posts (e.g. 'draft', 'published', 'archived') so authors
--    can save work-in-progress before publishing.
--
-- 6. User accounts & roles — separate readers from authors
--    and admins. A roles table or a role column on a users
--    table, with permissions controlling who can publish,
--    edit, or moderate.
--
-- 7. Revision history — store previous versions of a post
--    in a post_revisions table so editors can view diffs and
--    roll back changes.
-- ============================================================
