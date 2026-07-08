import express from 'express';
import {
  getWeeklyLeaderboard,
  getGlobalLeaderboard,
  getMyRank,
} from '../controllers/leaderboard.controller.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.get('/weekly', protect, getWeeklyLeaderboard);
router.get('/global', protect, getGlobalLeaderboard);
router.get('/me', protect, getMyRank);

export default router;
