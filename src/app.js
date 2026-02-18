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
      authors: 'GET /api/authors',
      posts: 'GET /api/posts',
      tags: 'GET /api/tags',
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
