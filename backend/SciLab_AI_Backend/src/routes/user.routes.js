import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { profile, loginHistory } from '../controllers/user.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/me', profile);
router.get('/me/logins', loginHistory);

export default router;
