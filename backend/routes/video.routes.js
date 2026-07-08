import express from 'express';
import { getVideos, streamVideo, uploadVideo, deleteVideo } from '../controllers/video.controller.js';
import protect from '../middleware/auth.js';
import videoUpload from '../middleware/videoUpload.js';

const router = express.Router();

// Public list of videos (students can view)
router.get('/', getVideos);

// Stream video file (protected – only authenticated users)
router.get('/:id', protect, streamVideo);

// Admin upload (teacher role) – protected
router.post('/', protect, videoUpload.single('file'), uploadVideo);

// Admin delete – protected
router.delete('/:id', protect, deleteVideo);

export default router;
