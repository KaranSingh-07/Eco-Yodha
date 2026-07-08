import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Module from '../models/Module.js';
import Subtopic from '../models/Subtopic.js';
import Quiz from '../models/Quiz.js';
import UserProgress from '../models/UserProgress.js';
import Quest from '../models/Quest.js';
import Badge from '../models/Badge.js';

dotenv.config({ path: '.env' });

const seedModules = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eco-yodha');
    console.log('MongoDB Connected for seeding');

    // Clear existing data
    await Module.deleteMany({});
    await Subtopic.deleteMany({});
    await Quiz.deleteMany({});
    await Quest.deleteMany({});
    await Badge.deleteMany({});
    
    // Also reset user progress related to modules to avoid broken refs
    await UserProgress.updateMany({}, {
      $set: { 
        completedModules: [], 
        completedSubtopics: [], 
        currentModule: null, 
        currentSubtopic: null,
        unlockedQuests: [],
        questScore: 0,
        otherScore: 0,
        totalEcoPoints: 0
      }
    });
    console.log('Cleared existing modules, subtopics, quizzes, quests, and badges');

    // Seed Badges
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

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedModules();
