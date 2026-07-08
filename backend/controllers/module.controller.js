import Module from '../models/Module.js';
import Subtopic from '../models/Subtopic.js';
import Quiz from '../models/Quiz.js';
import UserProgress from '../models/UserProgress.js';
import User from '../models/User.js';

export const getModules = async (req, res) => {
  try {
    const modules = await Module.find().sort({ position: 1 });
    
    let progress = null;
    if (req.user.role === 'student') {
      progress = await UserProgress.findOne({ user: req.user._id });
    }

    const modulesWithStatus = modules.map((mod, index) => {
      let status = 'locked';
      if (progress) {
        if (progress.completedModules.includes(mod._id)) {
          status = 'completed';
        } else if (
          progress.currentModule?.toString() === mod._id.toString() ||
          index === 0
        ) {
          status = 'active';
        }
      } else if (index === 0) {
        status = 'active';
      }
      return { ...mod.toObject(), status };
    });

    return res.json(modulesWithStatus);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getSubtopicById = async (req, res) => {
  try {
    const subtopic = await Subtopic.findById(req.params.id).populate('quizRef');
    if (!subtopic) {
      return res.status(404).json({ message: 'Subtopic not found' });
    }
    return res.json(subtopic.toObject());
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getModuleSubtopics = async (req, res) => {
  try {
    const subtopics = await Subtopic.find({ module: req.params.id }).sort({ position: 1 });
    
    let progress = null;
    if (req.user.role === 'student') {
      progress = await UserProgress.findOne({ user: req.user._id });
    }

    const subtopicsWithStatus = subtopics.map((sub, index) => {
      let status = 'locked';
      if (progress) {
        if (progress.completedSubtopics.includes(sub._id)) {
          status = 'completed';
        } else if (progress.currentSubtopic?.toString() === sub._id.toString()) {
          status = 'active';
        } else if (index === 0 && (
            progress.currentModule?.toString() === req.params.id ||
            (!progress.currentModule && progress.completedModules.length === 0)
        )) {
          status = 'active';
        }
      } else if (index === 0) {
        status = 'active';
      }
      return { ...sub.toObject(), status };
    });

    // Fallback to ensure at least the first item is active if nothing is completed and no active subtopic is set
    if (subtopicsWithStatus.length > 0 && !subtopicsWithStatus.some(s => s.status === 'active' || s.status === 'completed')) {
       subtopicsWithStatus[0].status = 'active';
    }

    return res.json(subtopicsWithStatus);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getModuleById = async (req, res) => {
  try {
    const mod = await Module.findById(req.params.id);
    if (!mod) {
      return res.status(404).json({ message: 'Module not found' });
    }
    return res.json(mod.toObject());
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const completeSubtopic = async (req, res) => {
  try {
    const { subtopicId } = req.params;
    
    const { answers, timeTaken } = req.body || {};
    
    let progress = await UserProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await UserProgress.create({ user: req.user._id });
    }

    const subtopic = await Subtopic.findById(subtopicId).populate('module').populate('quizRef');
    if (!subtopic) {
      return res.status(404).json({ message: 'Subtopic not found' });
    }

    let isPassed = true;
    let score = 0;
    let totalQuestions = 0;

    if (subtopic.type.includes('quiz') && subtopic.quizRef) {
      totalQuestions = subtopic.quizRef.questions.length;
      if (answers && Array.isArray(answers)) {
        subtopic.quizRef.questions.forEach((q, idx) => {
          if (answers[idx] === q.correctAnswer) score++;
        });
      }
      
      // Student can clear the quiz with any marks
      isPassed = true;

      const isFirstAttempt = !progress.completedSubtopics.includes(subtopicId);

      // Save QuizSubmission
      import('../models/QuizSubmission.js').then(async ({ default: QuizSubmission }) => {
        await QuizSubmission.create({
          user: req.user._id,
          quiz: subtopic.quizRef._id,
          module: subtopic.module._id,
          subtopic: subtopic._id,
          answers: answers || [],
          score,
          totalQuestions,
          timeTaken: timeTaken || 0,
          isFirstAttempt,
          ecoPointsEarned: (isPassed && isFirstAttempt) ? subtopic.ecoPointsReward || 0 : 0
        });
      });
      
      if (!isPassed) {
        return res.json({ message: 'Quiz failed. Please try again.', passed: false, score, totalQuestions });
      }
    }

    if (!progress.completedSubtopics.includes(subtopicId)) {
      progress.completedSubtopics.push(subtopicId);
      const points = subtopic.ecoPointsReward || 0;
      progress.totalEcoPoints += points;
      
      const category = subtopic.module.category || 'other';
      if (category === 'carbon') progress.carbonScore += points;
      else if (category === 'water') progress.waterScore += points;
      else if (category === 'soil') progress.soilScore += points;
      else progress.otherScore += points;

      if (points > 0) {
        progress.scoreHistory.push({
          date: new Date(),
          category,
          points
        });
      }
    }

    const allModuleSubtopics = await Subtopic.find({ module: subtopic.module._id }).sort({ position: 1 });
    const currentIndex = allModuleSubtopics.findIndex(s => s._id.toString() === subtopicId);
    
    let isModuleComplete = false;

    if (currentIndex < allModuleSubtopics.length - 1) {
      progress.currentSubtopic = allModuleSubtopics[currentIndex + 1]._id;
    } else {
      isModuleComplete = true;
      progress.currentSubtopic = null;
      if (!progress.completedModules.includes(subtopic.module._id)) {
         progress.completedModules.push(subtopic.module._id);
         progress.totalEcoPoints += subtopic.module.ecoPointsReward || 0;

         // Check for linked Quest to unlock
         const { default: Quest } = await import('../models/Quest.js');
         const linkedQuest = await Quest.findOne({ module: subtopic.module._id });
         if (linkedQuest) {
           const alreadyUnlocked = progress.unlockedQuests.some(uq => uq.quest.toString() === linkedQuest._id.toString());
           if (!alreadyUnlocked) {
             const deadline = new Date();
             deadline.setDate(deadline.getDate() + (linkedQuest.daysToComplete || 7));
             progress.unlockedQuests.push({
               quest: linkedQuest._id,
               unlockedAt: new Date(),
               deadline: deadline
             });
           }
         }
      }

      const allModules = await Module.find().sort({ position: 1 });
      const currentModIndex = allModules.findIndex(m => m._id.toString() === subtopic.module._id.toString());
      if (currentModIndex < allModules.length - 1) {
        progress.currentModule = allModules[currentModIndex + 1]._id;
        
        const nextModSubtopics = await Subtopic.find({ module: allModules[currentModIndex + 1]._id }).sort({ position: 1 });
        if (nextModSubtopics.length > 0) {
          progress.currentSubtopic = nextModSubtopics[0]._id;
        }
      }
    }

    await progress.save();

    try {
      const user = await User.findById(req.user._id);
      if (user) {
        user.level = Math.floor(progress.totalEcoPoints / 100) + 1;
        user.xp = progress.totalEcoPoints;
        await user.save();
      }
    } catch (e) {}

    return res.json({ message: 'Subtopic completed', progress, isModuleComplete, passed: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const completeModule = async (req, res) => {
  try {
    const { id } = req.params;
    let progress = await UserProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await UserProgress.create({ user: req.user._id });
    }
    if (!progress.completedModules.includes(id)) {
      progress.completedModules.push(id);
      const mod = await Module.findById(id);
      if (mod) progress.totalEcoPoints += mod.ecoPointsReward || 0;
    }
    const allModules = await Module.find().sort({ position: 1 });
    const currentIndex = allModules.findIndex(m => m._id.toString() === id);
    if (currentIndex < allModules.length - 1) {
      progress.currentModule = allModules[currentIndex + 1]._id;
    }
    await progress.save();
    return res.json({ message: 'Module completed', progress });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getQuizAttempts = async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const { default: QuizSubmission } = await import('../models/QuizSubmission.js');
    
    const attempts = await QuizSubmission.find({ user: req.user._id, subtopic: subtopicId }).sort({ createdAt: -1 });
    return res.json(attempts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
