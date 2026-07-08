import Quiz from '../models/Quiz.js';
import Module from '../models/Module.js';
import QuizSubmission from '../models/QuizSubmission.js';
import UserProgress from '../models/UserProgress.js';
import User from '../models/User.js';

export const getQuizByModule = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ module: req.params.moduleId }).populate('module');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found for this module' });
    }
    return res.json(quiz);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // Array of selected option indices
    const { moduleId } = req.params;

    const quiz = await Quiz.findOne({ module: moduleId });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const mod = await Module.findById(moduleId);
    if (!mod) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        score++;
      }
    });

    const totalQuestions = quiz.questions.length;
    const percentage = score / totalQuestions;
    const ecoPointsEarned = Math.round((mod.ecoPointsReward || 30) * percentage);

    // Save submission
    const submission = await QuizSubmission.create({
      user: req.user._id,
      quiz: quiz._id,
      module: moduleId,
      answers,
      score,
      totalQuestions,
      ecoPointsEarned,
    });

    // Update progress
    let progress = await UserProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await UserProgress.create({ user: req.user._id });
    }

    progress.totalEcoPoints += ecoPointsEarned;
    const title = mod.title.toLowerCase();
    if (title.includes('carbon')) {
      progress.carbonScore += ecoPointsEarned;
    } else if (title.includes('water')) {
      progress.waterScore += ecoPointsEarned;
    } else if (title.includes('soil')) {
      progress.soilScore += ecoPointsEarned;
    }

    if (!progress.completedModules.includes(moduleId)) {
      progress.completedModules.push(moduleId);
    }

    // Unlock next module
    const allModules = await Module.find().sort({ position: 1 });
    const currentIndex = allModules.findIndex(m => m._id.toString() === moduleId);
    if (currentIndex < allModules.length - 1) {
      progress.currentModule = allModules[currentIndex + 1]._id;
    }

    await progress.save();

    // Update user level
    const user = await User.findById(req.user._id);
    if (user) {
      user.level = Math.floor(progress.totalEcoPoints / 100) + 1;
      user.xp = progress.totalEcoPoints;
      await user.save();
    }

    // Auto-award badges
    try {
      const { checkAndAwardBadges } = await import('../utils/badgeHelper.js');
      await checkAndAwardBadges(req.user._id);
    } catch (err) {
      console.error('Badge award failed:', err);
    }

    return res.json({
      score,
      totalQuestions,
      percentage: Math.round(percentage * 100),
      ecoPointsEarned,
      correctAnswers: quiz.questions.map(q => q.correctAnswer),
      explanations: quiz.questions.map(q => q.explanation),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const generateQuizWithAI = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required for AI generation' });
    }

    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;
    if (!apiKey) {
      return res.status(500).json({ message: 'AI service API key is missing. Please add it to your .env file.' });
    }

    const prompt = `Generate a 3-question multiple-choice quiz about the following educational video topic. 
    Title: ${title}
    Description: ${description || 'Environmental science'}
    
    Return ONLY a raw JSON array of objects. Do not wrap it in markdown or backticks. 
    Each object must have the following exact schema:
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": 0,
      "explanation": "string",
      "timestamp": 10
    }`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.3, // low temp for JSON consistency
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Groq API Error:', errData);
      return res.status(500).json({ message: 'Failed to generate quiz from AI service' });
    }

    const data = await response.json();
    let reply = data.choices[0]?.message?.content;
    
    // Clean up markdown wrapping if the AI ignored instructions
    if (reply.startsWith('\`\`\`json')) {
      reply = reply.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    }

    try {
      const parsedQuestions = JSON.parse(reply.trim());
      return res.json({ questions: parsedQuestions });
    } catch (parseErr) {
      console.error('Failed to parse AI JSON:', reply);
      return res.status(500).json({ message: 'AI returned invalid JSON format' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
