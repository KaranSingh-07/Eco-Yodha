import express from 'express';
import {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
} from '../controllers/auth.controller.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/me').get(protect, getUserProfile);
router.route('/profile').put(protect, updateUserProfile);

export default router;
