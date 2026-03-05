import 'dotenv/config';

import fs from 'node:fs/promises';
import path from 'node:path';

import { Pool } from 'pg';
import {
  getConnectionString,
  getPoolConfig,
  isLocalConnection,
} from '../src/db/connectionConfig.js';

const RETRIES = 20;
const RETRY_DELAY_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDatabase(pool) {
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch {
      console.log('Waiting for database...');
      await sleep(RETRY_DELAY_MS);
    }
  }

  throw new Error('Unable to connect to database after 20 retries.');
}

async function run() {
  const connectionString = getConnectionString();
  const allowDestructiveOperations =
    process.env.ALLOW_DESTRUCTIVE_DB_OPERATIONS === 'true';

  if (
    connectionString &&
    !allowDestructiveOperations &&
    !isLocalConnection(connectionString)
  ) {
    console.error(
      'Refusing to run db:setup against a non-local database. ' +
        'Set ALLOW_DESTRUCTIVE_DB_OPERATIONS=true to override.',
    );
    process.exit(1);
  }

  let pool;

  try {
    pool = new Pool(getPoolConfig());
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('You can copy .env.example to .env to get started.');
    process.exit(1);
  }

  try {
    await waitForDatabase(pool);
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('Database schema applied.');
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
