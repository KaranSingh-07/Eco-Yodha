import express from 'express';
import {
  createClassroom,
  joinClassroom,
  getTeacherStudents,
} from '../controllers/classroom.controller.js';
import protect from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/create', protect, roleCheck(['teacher']), createClassroom);
router.post('/join', protect, roleCheck(['student']), joinClassroom);
router.get('/students', protect, roleCheck(['teacher']), getTeacherStudents);

export default router;
