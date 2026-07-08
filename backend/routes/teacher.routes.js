import express from 'express';
import {
  getTeacherStats,
  getTeacherRoster,
  getStudentReport,
  verifyStudent,
  getTeacherAnalytics,
  getPendingStudents,
} from '../controllers/teacher.controller.js';
import protect from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/stats', protect, roleCheck(['teacher']), getTeacherStats);
router.get('/analytics', protect, roleCheck(['teacher']), getTeacherAnalytics);
router.get('/roster', protect, roleCheck(['teacher']), getTeacherRoster);
router.get('/report/:studentId', protect, roleCheck(['teacher']), getStudentReport);
router.put('/verify/:studentId', protect, roleCheck(['teacher']), verifyStudent);
router.get('/pending-students', protect, roleCheck(['teacher']), getPendingStudents);

export default router;
