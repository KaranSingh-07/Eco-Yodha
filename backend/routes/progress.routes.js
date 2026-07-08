import express from 'express';
import {
  getDashboard,
  getTrends,
  updateStreak,
} from '../controllers/progress.controller.js';
import protect from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/dashboard', protect, roleCheck(['student']), getDashboard);
router.get('/trends', protect, roleCheck(['student']), getTrends);
router.put('/streak', protect, roleCheck(['student']), updateStreak);

export default router;
