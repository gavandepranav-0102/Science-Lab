import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiters.js';
import { chat } from '../controllers/ai.controller.js';

const router = Router();

router.post('/chat', requireAuth, aiLimiter, chat);

export default router;
