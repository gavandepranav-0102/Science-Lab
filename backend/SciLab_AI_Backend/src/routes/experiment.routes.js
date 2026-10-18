import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listHistory, getHistoryItem, saveExperiment,
  deleteHistoryItem, clearHistory
} from '../controllers/experiment.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/history', listHistory);
router.get('/history/:id', getHistoryItem);
router.post('/history', saveExperiment);
router.delete('/history/:id', deleteHistoryItem);
router.delete('/history', clearHistory);

export default router;
