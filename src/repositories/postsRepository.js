import pool from '../db/pool.js';

async function getAll() {
  const result = await pool.query(
    `SELECT p.id, p.title, p.summary, p.body, p.published_at
     FROM posts p
     ORDER BY p.published_at DESC`,
  );
  return result.rows;
}

async function getById(id) {
  const result = await pool.query(
    `SELECT p.id, p.title, p.summary, p.body, p.published_at
     FROM posts p
     WHERE p.id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

async function getByAuthorId(authorId) {
  const result = await pool.query(
    `SELECT p.id, p.title, p.summary, p.body, p.published_at
     FROM posts p
     JOIN post_authors pa ON pa.post_id = p.id
     WHERE pa.author_id = $1
     ORDER BY p.published_at DESC`,
    [authorId],
  );
  return result.rows;
}

async function getAuthorsByPostId(postId) {
  const result = await pool.query(
    `SELECT a.id, a.name, a.email, a.bio, a.joined_at
     FROM authors a
     JOIN post_authors pa ON pa.author_id = a.id
     WHERE pa.post_id = $1
     ORDER BY a.name`,
    [postId],
  );
  return result.rows;
}

async function create({ title, summary, body, author_ids }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const postResult = await client.query(
      `INSERT INTO posts (title, summary, body)
       VALUES ($1, $2, $3)
       RETURNING id, title, summary, body, published_at`,
      [title, summary || null, body],
    );
    const post = postResult.rows[0];

    for (const authorId of author_ids) {
      await client.query(
        'INSERT INTO post_authors (post_id, author_id) VALUES ($1, $2)',
        [post.id, authorId],
      );
    }

    await client.query('COMMIT');
    return post;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function update(id, fields) {
  const keys = Object.keys(fields);
  const values = Object.values(fields);

  const setClauses = keys.map((key, i) => `${key} = $${i + 1}`);
  values.push(id);

  const result = await pool.query(
    `UPDATE posts SET ${setClauses.join(', ')}
     WHERE id = $${values.length}
     RETURNING id, title, summary, body, published_at`,
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

export default {
  getAll,
  getById,
  getByAuthorId,
  getAuthorsByPostId,
  create,
  update,
  remove,
};
