import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import experimentRoutes from './routes/experiment.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet());
app.use(cors({
  origin: env.clientOrigin,
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'SciLab AI Backend',
    status: 'healthy',
    time: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, '0.0.0.0', () => {
  console.log(`SciLab AI backend running on http://0.0.0.0:${env.port}`);
});
