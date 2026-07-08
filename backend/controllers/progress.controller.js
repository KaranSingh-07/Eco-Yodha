import UserProgress from '../models/UserProgress.js';
import User from '../models/User.js';
import Module from '../models/Module.js';
import Classroom from '../models/Classroom.js';

const getWeeklyDateRange = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
};

export const getDashboard = async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await UserProgress.create({ user: req.user._id });
    }

    const totalModules = await Module.countDocuments();
    const completedModules = progress.completedModules.length;

    let teacherName = '';
    let classroomName = '';

    if (req.user.classroomCode && req.user.classApproved) {
      const classroom = await Classroom.findOne({ code: req.user.classroomCode }).populate('teacher', 'name');
      if (classroom) {
        classroomName = classroom.name;
        if (classroom.teacher) {
          teacherName = classroom.teacher.name;
        }
      }
    }

    const { start: startOfWeek, end: endOfWeek } = getWeeklyDateRange(new Date());
    const weeklyPoints = progress.scoreHistory
      ? progress.scoreHistory
          .filter((item) => {
            const itemDate = new Date(item.date);
            return itemDate >= startOfWeek && itemDate <= endOfWeek;
          })
          .reduce((sum, item) => sum + (item.points || 0), 0)
      : 0;

    return res.json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        level: req.user.level,
        xp: req.user.xp,
        school: req.user.school,
        grade: req.user.grade,
        section: req.user.section,
        currentStreak: progress.streak,
        classroomCode: req.user.classroomCode,
        classApproved: req.user.classApproved,
        teacherName,
        classroomName,
      },
      progress: {
        completedModules,
        totalModules,
        carbonScore: progress.carbonScore,
        waterScore: progress.waterScore,
        soilScore: progress.soilScore,
        otherScore: progress.otherScore || 0,
        questScore: progress.questScore || 0,
        totalEcoPoints: progress.totalEcoPoints,
        weeklyPoints,
        streak: progress.streak,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getTrends = async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ user: req.user._id });
    if (!progress) {
      return res.json({
        carbonData: [],
        waterData: [],
        soilData: [],
      });
    }

    const history = progress.scoreHistory || [];
    
    // We want a running total graph. If history is empty, return defaults starting at 0.
    if (history.length === 0) {
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return res.json({
        carbonData: [{ day: today, carbonScore: 0 }],
        waterData: [{ day: today, waterScore: 0 }],
        soilData: [{ day: today, soilScore: 0 }]
      });
    }

    // Group history by date (YYYY-MM-DD)
    const grouped = {};
    history.forEach(item => {
      const d = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!grouped[d]) grouped[d] = { carbon: 0, water: 0, soil: 0 };
      if (item.category === 'carbon') grouped[d].carbon += item.points;
      else if (item.category === 'water') grouped[d].water += item.points;
      else if (item.category === 'soil') grouped[d].soil += item.points;
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
    
    let runCarbon = 0, runWater = 0, runSoil = 0;
    const carbonData = [];
    const waterData = [];
    const soilData = [];

    // Add a starting point of 0 if the first date isn't 0
    if (sortedDates.length > 0) {
       const firstDateStr = sortedDates[0];
       const previousDay = new Date(new Date(firstDateStr).getTime() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
       carbonData.push({ day: previousDay, carbonScore: 0 });
       waterData.push({ day: previousDay, waterScore: 0 });
       soilData.push({ day: previousDay, soilScore: 0 });
    }

    sortedDates.forEach(date => {
      runCarbon += grouped[date].carbon;
      runWater += grouped[date].water;
      runSoil += grouped[date].soil;

      carbonData.push({ day: date, carbonScore: runCarbon });
      waterData.push({ day: date, waterScore: runWater });
      soilData.push({ day: date, soilScore: runSoil });
    });

    return res.json({ carbonData, waterData, soilData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const updateStreak = async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await UserProgress.create({ user: req.user._id });
    }

    const today = new Date();
    const lastActive = progress.lastActiveDate;

    if (lastActive) {
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        progress.streak += 1;
      } else if (diffDays > 1) {
        progress.streak = 1;
      }
    } else {
      progress.streak = 1;
    }

    progress.lastActiveDate = today;
    await progress.save();

    return res.json({ streak: progress.streak });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
