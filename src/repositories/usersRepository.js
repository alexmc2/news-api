
import pool from '../db/pool.js';


async function getAll() {
  const result = await pool.query('SELECT id, name, email FROM users ORDER BY id ASC');
  return result.rows;
}

async function create({ name, email }) {
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email',
    [name, email]
  );

  return result.rows[0];
}

export default {
  getAll,
  create
};

