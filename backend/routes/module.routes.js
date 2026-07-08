import express from 'express';
import {
  getModules,
  getModuleById,
  completeModule,
  getModuleSubtopics,
  completeSubtopic,
  getSubtopicById,
  getQuizAttempts,
} from '../controllers/module.controller.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getModules);
router.get('/:id', protect, getModuleById);
router.get('/:id/subtopics', protect, getModuleSubtopics);
router.get('/subtopics/:id', protect, getSubtopicById);
router.get('/subtopics/:subtopicId/attempts', protect, getQuizAttempts);
router.put('/:id/complete', protect, completeModule);
router.put('/subtopics/:subtopicId/complete', protect, completeSubtopic);

export default router;
