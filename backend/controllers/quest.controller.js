import Quest from '../models/Quest.js';
import QuestSubmission from '../models/QuestSubmission.js';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';

export const getQuests = async (req, res) => {
  try {
    const quests = await Quest.find().populate('badges');
    
    let unlockedQuests = [];
    if (req.user.role === 'student') {
      const progress = await UserProgress.findOne({ user: req.user._id });
      if (progress) {
        unlockedQuests = progress.unlockedQuests || [];
      }
    }

    const questsWithStatus = quests.map((quest) => {
      let status = 'locked';
      let deadline = null;
      let isOverdue = false;

      if (req.user.role === 'student') {
        const unlocked = unlockedQuests.find(uq => uq.quest.toString() === quest._id.toString());
        if (unlocked) {
          status = 'active';
          deadline = unlocked.deadline;
          if (deadline && new Date() > new Date(deadline)) {
            isOverdue = true;
          }
        }
      } else {
        status = quest.status;
      }
      return { ...quest.toObject(), status, deadline, isOverdue };
    });

    return res.json(questsWithStatus);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getQuestById = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id).populate('badges');
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    let submission = null;
    let deadline = null;
    let status = 'locked';

    if (req.user.role === 'student') {
      submission = await QuestSubmission.findOne({ user: req.user._id, quest: quest._id });
      const progress = await UserProgress.findOne({ user: req.user._id });
      if (progress) {
        const unlocked = progress.unlockedQuests.find(uq => uq.quest.toString() === quest._id.toString());
        if (unlocked) {
          status = 'active';
          deadline = unlocked.deadline;
        }
      }
    }

    return res.json({ ...quest.toObject(), submission, status, deadline });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const submitQuest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quest = await Quest.findById(id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    // Check if already submitted
    const existing = await QuestSubmission.findOne({ user: req.user._id, quest: id });
    if (existing) {
      return res.status(400).json({ message: 'Already submitted this quest' });
    }

    const progress = await UserProgress.findOne({ user: req.user._id });
    const unlocked = progress?.unlockedQuests.find(uq => uq.quest.toString() === id.toString());
    
    let remark = 'On Time';
    if (unlocked && unlocked.deadline && new Date() > new Date(unlocked.deadline)) {
      remark = 'Late Submission';
    }

    // Process uploaded files
    const files = (req.files || []).map(f => ({
      url: `/uploads/${f.filename}`,
      filename: f.originalname,
    }));

    const submission = await QuestSubmission.create({
      user: req.user._id,
      quest: id,
      files,
      status: 'pending',
      remark,
      submittedAt: new Date()
    });

    return res.status(201).json(submission);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getPendingSubmissions = async (req, res) => {
  try {
    const submissions = await QuestSubmission.find({ status: 'pending' })
      .populate('user', '-password')
      .populate('quest');
    return res.json(submissions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Teacher route: Get all quests with all students from their classroom
export const getTeacherQuests = async (req, res) => {
  try {
    // 1. Get Teacher's classrooms
    const { default: Classroom } = await import('../models/Classroom.js');
    const classrooms = await Classroom.find({ teacher: req.user._id });
    const classroomCodes = classrooms.map(c => c.code);

    // 2. Get students in these classrooms
    const students = await User.find({ role: 'student', classApproved: true, classroomCode: { $in: classroomCodes } }).select('_id name avatar');
    const studentIds = students.map(s => s._id);

    // 3. Fetch all active quests
    const quests = await Quest.find({ status: 'active' });

    // 4. For each quest, fetch submissions for the teacher's students
    const data = [];
    for (let quest of quests) {
      const submissions = await QuestSubmission.find({ quest: quest._id, user: { $in: studentIds } }).populate('user', 'name avatar');
      
      const studentsStatus = students.map(student => {
        const sub = submissions.find(s => s.user._id.toString() === student._id.toString());
        return {
          student,
          submission: sub || null,
          hasSubmitted: !!sub
        };
      });

      data.push({
        ...quest.toObject(),
        studentStatuses: studentsStatus
      });
    }

    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Original verify for simple approval/rejection (used elsewhere potentially, keeping for safety)
export const verifySubmission = async (req, res) => {
  // ... existing code ...
  res.status(500).json({message: "Use gradeSubmission instead"});
};

export const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { pointsAwarded, teacherComment } = req.body;

    const submission = await QuestSubmission.findById(id).populate('quest');
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.status === 'approved') {
      return res.status(400).json({ message: 'Submission already graded' });
    }

    const quest = submission.quest;
    const maxPoints = quest.doublePoints ? quest.points * 2 : quest.points;
    const finalPoints = Math.min(Number(pointsAwarded) || 0, maxPoints);

    submission.status = 'approved';
    submission.teacherComment = teacherComment || '';
    submission.awardedPoints = finalPoints;
    submission.verifiedBy = req.user._id;
    submission.verifiedAt = new Date();
    await submission.save();

    // Award badges associated with this quest
    if (quest.badges && quest.badges.length > 0) {
      const UserBadge = (await import('../models/UserBadge.js')).default;
      for (const badgeId of quest.badges) {
        const existing = await UserBadge.findOne({ user: submission.user, badge: badgeId });
        if (!existing) {
          await UserBadge.create({ user: submission.user, badge: badgeId });
        }
      }
    }

    if (finalPoints > 0) {
      let progress = await UserProgress.findOne({ user: submission.user });
      if (!progress) progress = await UserProgress.create({ user: submission.user });

      progress.questScore = (progress.questScore || 0) + finalPoints;
      progress.totalEcoPoints += finalPoints;
      
      progress.scoreHistory.push({
        date: new Date(),
        category: 'other',
        points: finalPoints
      });
      
      await progress.save();

      // Update user level
      const user = await User.findById(submission.user);
      if (user) {
        user.level = Math.floor(progress.totalEcoPoints / 100) + 1;
        user.xp = progress.totalEcoPoints;
        await user.save();
      }
    }

    return res.json({ message: 'Submission graded successfully', submission });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await QuestSubmission.find({ user: req.user._id })
      .populate('quest');
    return res.json(submissions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
