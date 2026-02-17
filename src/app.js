
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';
import healthRouter from './routes/health.js';
import usersRouter from './routes/users.js';


const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({
    message: 'API is running',
    endpoints: {
      health: 'GET /health',
      users: 'GET /api/users',
      createUser: 'POST /api/users'
    }
  });
});

app.use('/health', healthRouter);
app.use('/api/users', usersRouter);

app.use(notFound);
app.use(errorHandler);

export default app;

