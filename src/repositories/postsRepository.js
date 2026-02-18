import pool from '../db/pool.js';

async function getAll(filters = {}) {
  const { author_id, from, to, q, sort, order, page, per_page } = filters;

  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (author_id) {
    conditions.push(
      `p.id IN (SELECT post_id FROM post_authors WHERE author_id = $${paramIndex})`,
    );
    values.push(author_id);
    paramIndex++;
  }

  if (from) {
    conditions.push(`p.published_at >= $${paramIndex}`);
    values.push(from);
    paramIndex++;
  }

  if (to) {
    conditions.push(`p.published_at <= $${paramIndex}`);
    values.push(to);
    paramIndex++;
  }

  if (q) {
    conditions.push(
      `(p.title ILIKE $${paramIndex} OR p.summary ILIKE $${paramIndex})`,
    );
    values.push(`%${q}%`);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total matching rows
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM posts p ${whereClause}`,
    values,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Sorting
  const allowedSorts = ['published_at', 'title'];
  const sortColumn = allowedSorts.includes(sort) ? sort : 'published_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  // Pagination
  const limit = per_page;
  const offset = (page - 1) * per_page;

  const dataValues = [...values, limit, offset];

  const result = await pool.query(
    `SELECT p.id, p.title, p.summary, p.body, p.published_at
     FROM posts p
     ${whereClause}
     ORDER BY p.${sortColumn} ${sortOrder}
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    dataValues,
  );

  return { rows: result.rows, total };
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
