import express from 'express';
import {
  getAllBadges,
  getMyBadges,
  awardBadge,
} from '../controllers/badge.controller.js';
import protect from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', protect, getAllBadges);
router.get('/my', protect, getMyBadges);
router.post('/award', protect, roleCheck(['teacher']), awardBadge);

export default router;
