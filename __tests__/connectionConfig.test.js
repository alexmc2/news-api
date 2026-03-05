import { beforeEach, afterEach, describe, expect, test } from '@jest/globals';

import { getConnectionString, getPoolConfig } from '../src/db/connectionConfig.js';

const ENV_KEYS = [
  'NODE_ENV',
  'DATABASE_URL',
  'DATABASE_PUBLIC_URL',
  'DATABASE_SSL',
  'DATABASE_SSL_REJECT_UNAUTHORIZED',
  'PGSSLMODE',
  'PGUSER',
  'PGPASSWORD',
  'PGHOST',
  'PGPORT',
  'PGDATABASE',
];

let envSnapshot = {};

beforeEach(() => {
  envSnapshot = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = envSnapshot[key];

    if (value === undefined) {
      delete process.env[key];
      continue;
    }

    process.env[key] = value;
  }
});

describe('connectionConfig', () => {
  test('builds a valid connection string when PGHOST is IPv6', () => {
    process.env.PGUSER = 'reader';
    process.env.PGPASSWORD = 'secret';
    process.env.PGHOST = '::1';
    process.env.PGPORT = '5432';
    process.env.PGDATABASE = 'news_api';

    expect(getConnectionString()).toBe(
      'postgresql://reader:secret@[::1]:5432/news_api',
    );
  });

  test('enables certificate verification for PGSSLMODE=verify-full', () => {
    process.env.DATABASE_URL = 'postgresql://reader:secret@db.example.com:5432/news_api';
    process.env.PGSSLMODE = 'verify-full';

    expect(getPoolConfig().ssl).toEqual({ rejectUnauthorized: true });
  });

  test('keeps certificate verification off for PGSSLMODE=require', () => {
    process.env.DATABASE_URL = 'postgresql://reader:secret@db.example.com:5432/news_api';
    process.env.PGSSLMODE = 'require';

    expect(getPoolConfig().ssl).toEqual({ rejectUnauthorized: false });
  });

  test('allows explicit certificate verification override by env var', () => {
    process.env.DATABASE_URL = 'postgresql://reader:secret@db.example.com:5432/news_api';
    process.env.PGSSLMODE = 'require';
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED = 'true';

    expect(getPoolConfig().ssl).toEqual({ rejectUnauthorized: true });
  });
});
