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

  test('POST /api/posts creates a post and returns 201', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({ title: 'Test Post', body: 'Test body content', author_id: 1 });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Post');
  });

  test('PATCH /api/posts/:id updates a post', async () => {
    const created = await request(app)
      .post('/api/posts')
      .send({ title: 'To Update', body: 'Original body', author_id: 1 });

    const response = await request(app)
      .patch(`/api/posts/${created.body.id}`)
      .send({ title: 'Updated Title' });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Title');
    expect(response.body.body).toBe('Original body');
  });

  test('DELETE /api/posts/:id returns 204', async () => {
    const created = await request(app)
      .post('/api/posts')
      .send({ title: 'To Delete', body: 'Will be removed', author_id: 1 });

    const response = await request(app).delete(`/api/posts/${created.body.id}`);
    expect(response.status).toBe(204);

    const check = await request(app).get(`/api/posts/${created.body.id}`);
    expect(check.status).toBe(404);
  });

  test('GET /api/authors/:id/posts returns posts for an author', async () => {
    const response = await request(app).get('/api/authors/1/posts');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('GET /api/authors/999/posts returns 404', async () => {
    const response = await request(app).get('/api/authors/999/posts');

    expect(response.status).toBe(404);
  });
});
