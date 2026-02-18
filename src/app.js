import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';
import healthRouter from './routes/health.js';
import authorsRouter from './routes/authors.js';
import postsRouter from './routes/posts.js';
import tagsRouter from './routes/tags.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({
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

app.use('/health', healthRouter);
app.use('/api/authors', authorsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/tags', tagsRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
