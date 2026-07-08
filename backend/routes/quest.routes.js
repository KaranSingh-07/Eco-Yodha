import express from 'express';
import {
  getQuests,
  getQuestById,
  submitQuest,
  getPendingSubmissions,
  verifySubmission,
  getMySubmissions,
  getTeacherQuests,
  gradeSubmission,
} from '../controllers/quest.controller.js';
import protect from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', protect, getQuests);
router.get('/my', protect, getMySubmissions);
router.get('/teacher/all', protect, roleCheck(['teacher']), getTeacherQuests);
router.post('/teacher/grade/:id', protect, roleCheck(['teacher']), gradeSubmission);
router.get('/submissions/pending', protect, roleCheck(['teacher']), getPendingSubmissions);
router.get('/:id', protect, getQuestById);
router.post('/:id/submit', protect, roleCheck(['student']), upload.array('files', 5), submitQuest);
router.put('/submissions/:id/verify', protect, roleCheck(['teacher']), verifySubmission);

export default router;
