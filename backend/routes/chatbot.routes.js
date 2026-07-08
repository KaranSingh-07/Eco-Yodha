import express from 'express';
import { sendMessage } from '../controllers/chatbot.controller.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, sendMessage);

export default router;
