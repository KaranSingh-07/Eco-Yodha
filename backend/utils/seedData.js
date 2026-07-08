import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import connectDB from '../config/db.js';
import Module from '../models/Module.js';
import Subtopic from '../models/Subtopic.js';
import Quiz from '../models/Quiz.js';
import Quest from '../models/Quest.js';
import Badge from '../models/Badge.js';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAll = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Module.deleteMany({});
    await Subtopic.deleteMany({});
    await Quiz.deleteMany({});
    await Quest.deleteMany({});
    await Badge.deleteMany({});

    console.log('Seeding Users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const studentUser = await User.findOneAndUpdate(
      { email: 'student@test.com' },
      {
        name: 'Test Student',
        password: hashedPassword,
        role: 'student',
        school: 'Punjab Public School',
        level: 1,
        xp: 0,
        avatar: 'TS',
        classApproved: true
      },
      { upsert: true, new: true }
    );

    await UserProgress.findOneAndUpdate(
      { user: studentUser._id },
      {
        completedModules: [],
        completedSubtopics: [],
        carbonScore: 0,
        waterScore: 0,
        soilScore: 0,
        otherScore: 0,
        questScore: 0,
        totalEcoPoints: 0,
        weeklyPoints: 0,
        streak: 1,
      },
      { upsert: true, new: true }
    );

    const teacherUser = await User.findOneAndUpdate(
      { email: 'teacher@test.com' },
      {
        name: 'Test Teacher',
        password: hashedPassword,
        role: 'teacher',
        institutionName: 'Punjab Environmental Council',
        avatar: 'TT',
        grade: '10',
        section: 'A'
      },
      { upsert: true, new: true }
    );

    // Create a classroom for the teacher
    const Classroom = (await import('../models/Classroom.js')).default;
    await Classroom.deleteMany({ code: 'CLASS1' });
    await Classroom.create({
      name: '10 - Section A',
      code: 'CLASS1',
      teacher: teacherUser._id,
      students: [studentUser._id]
    });

    studentUser.classroomCode = 'CLASS1';
    await studentUser.save();

    console.log('Users and Classroom seeded successfully');

    console.log('Seeding Badges...');
    const badges = await Badge.insertMany([
      { name: "Water Warrior", description: "Complete all water modules", rarity: "legendary", icon: "WaterWarrior", criteria: "All water lectures completed" },
      { name: "Eco Starter", description: "Complete first quest", rarity: "common", icon: "Star", criteria: "First community quest approved" },
      { name: "Quiz Master", description: "Perfect score on 3 quizzes", rarity: "rare", icon: "Trophy", criteria: "3 quiz submissions with 100% score" },
      { name: "Punjab Pioneer", description: "Complete Punjab quest", rarity: "epic", icon: "Target", criteria: "Punjab Quest approved" },
      { name: "Community Leader", description: "Submit 5 community tasks", rarity: "epic", icon: "Users", criteria: "5 quests approved" },
      { name: "Biodiversity Scout", description: "Complete biodiversity survey", rarity: "rare", icon: "Leaf", criteria: "Biodiversity survey quest approved" },
      { name: "Climate Champion", description: "Earn 500 eco-points", rarity: "legendary", icon: "Award", criteria: "Total points exceed 500" },
      { name: "Carbon Crusher", description: "Complete carbon module", rarity: "rare", icon: "Wind", criteria: "All carbon lectures completed" }
    ]);
    console.log(`Badges seeded: ${badges.length}`);

    const punjabBadge = badges.find(b => b.name === "Punjab Pioneer");
    const communityBadge = badges.find(b => b.name === "Community Leader");
    const bioBadge = badges.find(b => b.name === "Biodiversity Scout");

    console.log('Seeding Modules and Subtopics...');
    const moduleData = [
      {
        title: 'Module 1: Introduction to Climate Change',
        description: 'Understand the basics of climate change, global warming, and the greenhouse effect.',
        category: 'carbon',
        subtopics: [
          { title: 'What is Climate Change?', type: 'video' },
          { title: 'Mini-Quiz 1: Basics', type: 'mini-quiz' },
          { title: 'The Greenhouse Effect', type: 'video' },
          { title: 'Mini-Quiz 2: Greenhouse Gases', type: 'mini-quiz' },
          { title: 'Mega-Quiz: Module 1 Mastery', type: 'mega-quiz' }
        ]
      },
      {
        title: 'Module 2: Carbon Footprint & Reduction',
        description: 'Learn how to measure and reduce your personal carbon footprint.',
        category: 'carbon',
        subtopics: [
          { title: 'Understanding Carbon Footprint', type: 'video' },
          { title: 'Mini-Quiz 1: Measurement', type: 'mini-quiz' },
          { title: 'Daily Habits for Reduction', type: 'video' },
          { title: 'Mini-Quiz 2: Actionable Steps', type: 'mini-quiz' },
          { title: 'Mega-Quiz: Module 2 Mastery', type: 'mega-quiz' }
        ]
      },
      {
        title: 'Module 3: Water Conservation',
        description: 'Explore the importance of water conservation and methods to save water at home.',
        category: 'water',
        subtopics: [
          { title: 'The Global Water Crisis', type: 'video' },
          { title: 'Mini-Quiz 1: Scarcity', type: 'mini-quiz' },
          { title: 'Water Saving Techniques', type: 'video' },
          { title: 'Mini-Quiz 2: Conservation', type: 'mini-quiz' },
          { title: 'Mega-Quiz: Module 3 Mastery', type: 'mega-quiz' }
        ]
      },
      {
        title: 'Module 4: Renewable Energy',
        description: 'Dive into solar, wind, and other forms of clean, renewable energy sources.',
        category: 'other',
        subtopics: [
          { title: 'Types of Renewable Energy', type: 'video' },
          { title: 'Mini-Quiz 1: Energy Sources', type: 'mini-quiz' },
          { title: 'The Future of Clean Tech', type: 'video' },
          { title: 'Mini-Quiz 2: Innovations', type: 'mini-quiz' },
          { title: 'Mega-Quiz: Module 4 Mastery', type: 'mega-quiz' }
        ]
      },
      {
        title: 'Module 5: Biodiversity & Ecosystems',
        description: 'Discover the rich variety of life on Earth and why preserving it is vital.',
        category: 'soil',
        subtopics: [
          { title: 'What is Biodiversity?', type: 'video' },
          { title: 'Mini-Quiz 1: Ecosystems', type: 'mini-quiz' },
          { title: 'Threats to Wildlife', type: 'video' },
          { title: 'Mini-Quiz 2: Conservation', type: 'mini-quiz' },
          { title: 'Mega-Quiz: Module 5 Mastery', type: 'mega-quiz' }
        ]
      }
    ];

    const createdModules = {};

    for (let i = 0; i < moduleData.length; i++) {
      const modData = moduleData[i];
      const newModule = await Module.create({
        title: modData.title,
        description: modData.description,
        position: i + 1,
        category: modData.category,
        ecoPointsReward: 100
      });

      createdModules[modData.title] = newModule;
      console.log(`Created Module: ${newModule.title}`);

      for (let j = 0; j < modData.subtopics.length; j++) {
        const subData = modData.subtopics[j];
        
        let quizRef = null;
        if (subData.type.includes('quiz')) {
          const numQuestions = subData.type === 'mega-quiz' ? 10 : 4;
          const questions = Array.from({ length: numQuestions }, (_, qIndex) => ({
            question: `Sample Question ${qIndex + 1} for ${subData.title}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0
          }));
          
          const newQuiz = await Quiz.create({
            module: newModule._id,
            questions
          });
          quizRef = newQuiz._id;
        }

        await Subtopic.create({
          module: newModule._id,
          title: subData.title,
          type: subData.type,
          videoUrl: subData.type === 'video' ? 'sample-video.mp4' : undefined,
          quizRef,
          position: j + 1,
          ecoPointsReward: subData.type === 'mega-quiz' ? 50 : 20
        });
      }
    }

    // Seed Quests linked to Modules
    await Quest.insertMany([
      {
        title: "Stubble Burning Awareness Campaign",
        region: "Punjab",
        description: "Document 3 conversations with farmers or community members about alternatives to stubble burning. Submit photo evidence and brief summaries.",
        status: "active",
        points: 150,
        doublePoints: true,
        deadline: new Date("2026-06-20"),
        badges: communityBadge ? [communityBadge._id] : [],
        requiredLevel: 1,
        module: createdModules['Module 1: Introduction to Climate Change']._id
      },
      {
        title: "Punjab Water Conservation Quest",
        region: "Punjab",
        description: "Measure household water usage and implement a 24-hour conservation strategy. Track your water meter readings before and after implementing conservation techniques.",
        status: "active",
        points: 200,
        doublePoints: true,
        deadline: new Date("2026-06-15"),
        badges: punjabBadge ? [punjabBadge._id] : [],
        requiredLevel: 1,
        module: createdModules['Module 3: Water Conservation']._id
      },
      {
        title: "Urban Biodiversity Survey",
        region: "Delhi",
        description: "Identify and photograph 10 different plant species in your local area. Create a simple biodiversity map of your neighborhood.",
        status: "locked",
        points: 180,
        doublePoints: false,
        deadline: new Date("2026-06-25"),
        badges: bioBadge ? [bioBadge._id] : [],
        requiredLevel: 3,
        module: createdModules['Module 5: Biodiversity & Ecosystems']._id
      }
    ]);
    console.log('Quests seeded');

    console.log('All data successfully seeded!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedAll();
