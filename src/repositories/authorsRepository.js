import pool from '../db/pool.js';

async function getAll() {
  const result = await pool.query(
    'SELECT id, name, email, bio, joined_at FROM authors ORDER BY id',
  );
  return result.rows;
}

async function getById(id) {
  const result = await pool.query(
    'SELECT id, name, email, bio, joined_at FROM authors WHERE id = $1',
    [id],
  );
  return result.rows[0] || null;
}

async function create({ name, email, password_hash, bio }) {
  const result = await pool.query(
    `INSERT INTO authors (name, email, password_hash, bio)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, bio, joined_at`,
    [name, email, password_hash, bio || null],
  );
  return result.rows[0];
}

export default { getAll, getById, create };
