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
    expect(response.body).toEqual({
      message: 'Guardian 2 API',
      endpoints: {
        health: 'GET /health',
        authors_list: 'GET /api/authors',
        authors_create: 'POST /api/authors',
        authors_get: 'GET /api/authors/:id',
        authors_posts: 'GET /api/authors/:id/posts',
        posts_list: 'GET /api/posts',
        posts_create: 'POST /api/posts',
        posts_get: 'GET /api/posts/:id',
        posts_update: 'PATCH /api/posts/:id',
        posts_delete: 'DELETE /api/posts/:id',
        posts_tags: 'GET /api/posts/:id/tags',
        posts_authors: 'GET /api/posts/:id/authors',
        tags_list: 'GET /api/tags',
        tags_posts: 'GET /api/tags/:id/posts',
      },
    });
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

  test('GET /api/posts/999 returns 404', async () => {
    const response = await request(app).get('/api/posts/999');

    expect(response.status).toBe(404);
  });

  test('POST /api/posts with missing title returns 422', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({ body: 'some text', author_ids: [1] });

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
      .send({ title: 'Test Post', body: 'Test body content', author_ids: [1] });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Post');
  });

  test('POST /api/posts with multiple authors returns 201', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({
        title: 'Collab Post',
        body: 'Written by two authors',
        author_ids: [1, 2],
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('POST /api/posts with empty author_ids returns 422', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({ title: 'Bad Post', body: 'No authors', author_ids: [] });

    expect(response.status).toBe(422);
  });

  test('PATCH /api/posts/:id updates a post', async () => {
    const created = await request(app)
      .post('/api/posts')
      .send({ title: 'To Update', body: 'Original body', author_ids: [1] });

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
      .send({ title: 'To Delete', body: 'Will be removed', author_ids: [1] });

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

  test('GET /api/tags returns an array', async () => {
    const response = await request(app).get('/api/tags');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('GET /api/posts/1/tags returns tags for a post', async () => {
    const response = await request(app).get('/api/posts/1/tags');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('name');
  });

  test('GET /api/posts/999/tags returns 404', async () => {
    const response = await request(app).get('/api/posts/999/tags');

    expect(response.status).toBe(404);
  });

  test('GET /api/tags/1/posts returns posts for a tag', async () => {
    const response = await request(app).get('/api/tags/1/posts');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('GET /api/tags/999/posts returns 404', async () => {
    const response = await request(app).get('/api/tags/999/posts');

    expect(response.status).toBe(404);
  });

  test('GET /api/posts/2/authors returns authors for a post', async () => {
    const response = await request(app).get('/api/posts/2/authors');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(1);
  });

  test('GET /api/posts/999/authors returns 404', async () => {
    const response = await request(app).get('/api/posts/999/authors');

    expect(response.status).toBe(404);
  });
});

describe('GET /api/posts — filtering, pagination, sorting', () => {
  test('returns paginated response shape', async () => {
    const response = await request(app).get('/api/posts');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.pagination).toEqual(
      expect.objectContaining({
        page: expect.any(Number),
        per_page: expect.any(Number),
        total: expect.any(Number),
        total_pages: expect.any(Number),
      }),
    );
  });

  test('respects per_page and page', async () => {
    const response = await request(app).get('/api/posts?per_page=2&page=1');

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeLessThanOrEqual(2);
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.per_page).toBe(2);
  });

  test('filters by author_id', async () => {
    const response = await request(app).get('/api/posts?author_id=4');

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test('filters by date range', async () => {
    const response = await request(app).get(
      '/api/posts?from=2024-01-01&to=2024-06-30',
    );

    expect(response.status).toBe(200);
    for (const post of response.body.data) {
      const d = new Date(post.published_at);
      expect(d >= new Date('2024-01-01')).toBe(true);
      expect(d <= new Date('2024-06-30')).toBe(true);
    }
  });

  test('searches by q', async () => {
    const response = await request(app).get('/api/posts?q=climate');

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test('sorts by title asc', async () => {
    const response = await request(app).get(
      '/api/posts?sort=title&order=asc&per_page=100',
    );

    expect(response.status).toBe(200);
    const titles = response.body.data.map((p) => p.title);
    const sorted = [...titles].sort((a, b) => a.localeCompare(b));
    expect(titles).toEqual(sorted);
  });

  test('returns 400 for invalid author_id', async () => {
    const response = await request(app).get('/api/posts?author_id=abc');

    expect(response.status).toBe(400);
  });

  test('returns 400 for invalid page', async () => {
    const response = await request(app).get('/api/posts?page=-1');

    expect(response.status).toBe(400);
  });

  test('returns 400 for invalid sort', async () => {
    const response = await request(app).get('/api/posts?sort=invalid');

    expect(response.status).toBe(400);
  });

  test('returns empty data for page beyond total', async () => {
    const response = await request(app).get('/api/posts?page=9999');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.pagination.total).toBeGreaterThan(0);
  });

  test('returns 400 for invalid from date', async () => {
    const response = await request(app).get('/api/posts?from=not-a-date');

    expect(response.status).toBe(400);
  });

  test('returns 400 for invalid to date', async () => {
    const response = await request(app).get('/api/posts?to=Jan+1+2024');

    expect(response.status).toBe(400);
  });

  test('returns 400 for invalid order', async () => {
    const response = await request(app).get('/api/posts?order=invalid');

    expect(response.status).toBe(400);
  });

  test('returns 400 for per_page over max', async () => {
    const response = await request(app).get('/api/posts?per_page=101');

    expect(response.status).toBe(400);
  });

  test('returns 400 for empty q', async () => {
    const response = await request(app).get('/api/posts?q=');

    expect(response.status).toBe(400);
  });
});
