import dns from 'node:dns';
// Force Node.js to use Google and Cloudflare DNS
dns.setServers(['8.8.8.8', '1.1.1.1']); 
import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import videoRoutes from './routes/video.routes.js';
import classroomRoutes from './routes/classroom.routes.js';
import moduleRoutes from './routes/module.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import questRoutes from './routes/quest.routes.js';
import badgeRoutes from './routes/badge.routes.js';
import progressRoutes from './routes/progress.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import uploadRoutes from './routes/upload.routes.js';

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/classroom', classroomRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/videos', videoRoutes);

app.get('/', (req, res) => {
  res.send('Eco-Yodha API is running successfully...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
