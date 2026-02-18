import pool from '../db/pool.js';

async function getAll() {
  const result = await pool.query('SELECT id, name FROM tags ORDER BY name');
  return result.rows;
}

async function getById(id) {
  const result = await pool.query('SELECT id, name FROM tags WHERE id = $1', [
    id,
  ]);
  return result.rows[0] || null;
}

async function getByPostId(postId) {
  const result = await pool.query(
    `SELECT t.id, t.name
     FROM tags t
     JOIN post_tags pt ON pt.tag_id = t.id
     WHERE pt.post_id = $1
     ORDER BY t.name`,
    [postId],
  );
  return result.rows;
}

async function getPostsByTagId(tagId) {
  const result = await pool.query(
    `SELECT p.id, p.title, p.summary, p.published_at,
            p.author_id, a.name AS author_name
     FROM posts p
     JOIN post_tags pt ON pt.post_id = p.id
     JOIN authors a ON a.id = p.author_id
     WHERE pt.tag_id = $1
     ORDER BY p.published_at DESC`,
    [tagId],
  );
  return result.rows;
}

export default { getAll, getById, getByPostId, getPostsByTagId };
