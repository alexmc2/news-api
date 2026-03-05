import { Pool } from 'pg';
import { getPoolConfig } from './connectionConfig.js';

const pool = new Pool(getPoolConfig());

export default pool;
