import pool from '../db/pool.js';

async function getAll() {
  const result = await pool.query(
    `SELECT p.id, p.title, p.summary, p.body, p.published_at,
            p.author_id, a.name AS author_name
     FROM posts p
     JOIN authors a ON a.id = p.author_id
     ORDER BY p.published_at DESC`,
  );
  return result.rows;
}

async function getById(id) {
  const result = await pool.query(
    `SELECT p.id, p.title, p.summary, p.body, p.published_at,
            p.author_id, a.name AS author_name
     FROM posts p
     JOIN authors a ON a.id = p.author_id
     WHERE p.id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

async function getByAuthorId(authorId) {
  const result = await pool.query(
    `SELECT id, title, summary, body, published_at, author_id
     FROM posts
     WHERE author_id = $1
     ORDER BY published_at DESC`,
    [authorId],
  );
  return result.rows;
}

async function create({ author_id, title, summary, body }) {
  const result = await pool.query(
    `INSERT INTO posts (author_id, title, summary, body)
     VALUES ($1, $2, $3, $4)
     RETURNING id, author_id, title, summary, body, published_at`,
    [author_id, title, summary || null, body],
  );
  return result.rows[0];
}

async function update(id, fields) {
  const keys = Object.keys(fields);
  const values = Object.values(fields);

  const setClauses = keys.map((key, i) => `${key} = $${i + 1}`);
  values.push(id);

  const result = await pool.query(
    `UPDATE posts SET ${setClauses.join(', ')}
     WHERE id = $${values.length}
     RETURNING id, author_id, title, summary, body, published_at`,
    values,
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM posts WHERE id = $1 RETURNING id',
    [id],
  );
  return result.rows[0] || null;
}

export default { getAll, getById, getByAuthorId, create, update, remove };
