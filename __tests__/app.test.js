import { describe, expect, test, afterAll } from '@jest/globals';
import request from 'supertest';

import app from '../src/app.js';
import pool from '../src/db/pool.js';

afterAll(async () => {
  await pool.end();
});

describe('API', () => {
  test('GET / returns API info', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Guardian 2 API');
  });

  test('GET /health returns { ok: true }', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  test('GET /api/authors returns an array', async () => {
    const response = await request(app).get('/api/authors');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/authors with missing name returns 422', async () => {
    const response = await request(app)
      .post('/api/authors')
      .send({ email: 'test@example.com', password_hash: 'abc123' });

    expect(response.status).toBe(422);
    expect(response.body.message).toBeDefined();
  });

  test('GET /api/posts returns an array', async () => {
    const response = await request(app).get('/api/posts');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/posts/999 returns 404', async () => {
    const response = await request(app).get('/api/posts/999');

    expect(response.status).toBe(404);
  });

  test('POST /api/posts with missing title returns 422', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({ body: 'some text', author_id: 1 });

    expect(response.status).toBe(422);
    expect(response.body.message).toBeDefined();
  });

  test('GET /unknown returns 404', async () => {
    const response = await request(app).get('/unknown');

    expect(response.status).toBe(404);
  });
});
