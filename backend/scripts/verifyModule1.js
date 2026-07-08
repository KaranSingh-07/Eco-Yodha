import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Module from '../models/Module.js';
import Subtopic from '../models/Subtopic.js';
import Quiz from '../models/Quiz.js';
import Video from '../models/video.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUri = process.env.MONGODB_URI;

const verify = async () => {
  try {
    await mongoose.connect(dbUri);
    console.log('\n--- MongoDB Verification Connection Established ---');

    // 1. Find Module 1
    const moduleTitle = 'Module 1: Introduction to Climate Change';
    const targetModule = await Module.findOne({ title: { $regex: new RegExp(moduleTitle, 'i') } });
    if (!targetModule) {
      console.log('❌ Module 1 not found!');
      process.exit(1);
    }
    console.log(`✅ Module 1 Found: "${targetModule.title}" (ID: ${targetModule._id})`);

    // 2. Fetch Subtopics and populate Quiz references
    const subtopics = await Subtopic.find({ module: targetModule._id }).sort({ position: 1 }).populate('quizRef');
    console.log(`✅ Found ${subtopics.length} subtopics:`);

    for (const sub of subtopics) {
      console.log(`\n🔹 Position ${sub.position}: "${sub.title}" (${sub.type.toUpperCase()})`);
      if (sub.type === 'video') {
        console.log(`   videoUrl in Subtopic: "${sub.videoUrl}"`);
        if (mongoose.Types.ObjectId.isValid(sub.videoUrl)) {
          const videoMeta = await Video.findById(sub.videoUrl);
          if (videoMeta) {
            console.log(`   ✅ Valid Video Document Found in MongoDB!`);
            console.log(`      Title: "${videoMeta.title}"`);
            console.log(`      GridFS file ID (filename): "${videoMeta.filename}"`);
          } else {
            console.log(`   ❌ Video Document NOT found for ID: ${sub.videoUrl}`);
          }
        } else {
          console.log(`   ⚠️ videoUrl is not a valid MongoDB ObjectId.`);
        }
      } else if (sub.type.includes('quiz')) {
        if (sub.quizRef) {
          console.log(`   ✅ Linked Quiz Document Found!`);
          console.log(`      Total Questions: ${sub.quizRef.questions.length}`);
          sub.quizRef.questions.forEach((q, idx) => {
            console.log(`      Q${idx + 1}: "${q.question}"`);
            console.log(`         Options: [${q.options.join(' | ')}]`);
            console.log(`         Correct Answer Index: ${q.correctAnswer} ("${q.options[q.correctAnswer]}")`);
          });
        } else {
          console.log(`   ❌ No Quiz reference linked to this subtopic.`);
        }
      }
    }

    console.log('\n--- Verification Finished successfully ---');
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during verification:', err);
    if (mongoose.connection) mongoose.connection.close();
    process.exit(1);
  }
};

verify();
