import express from 'express';
import {
  getQuizByModule,
  submitQuiz,
  generateQuizWithAI,
} from '../controllers/quiz.controller.js';
import protect from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/generate', protect, generateQuizWithAI);
router.get('/:moduleId', protect, getQuizByModule);
router.post('/:moduleId/submit', protect, submitQuiz);

export default router;
