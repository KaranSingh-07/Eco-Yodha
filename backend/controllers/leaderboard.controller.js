import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';

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

export const getWeeklyLeaderboard = async (req, res) => {
  try {
    let userClassroomCode = req.user.classroomCode;
    if (req.user.role === 'teacher') {
      const Classroom = (await import('../models/Classroom.js')).default;
      const classroom = await Classroom.findOne({ teacher: req.user._id });
      if (classroom) {
        userClassroomCode = classroom.code;
      }
    }

    if (!userClassroomCode) {
      return res.json([]);
    }

    const users = await User.find({
      role: 'student',
      classroomCode: userClassroomCode,
      classApproved: true,
    })
      .select('name avatar level')
      .lean();

    const { start: startOfWeek, end: endOfWeek } = getWeeklyDateRange(new Date());

    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const progress = await UserProgress.findOne({ user: user._id });
        const weeklyPoints = progress ? progress.scoreHistory
          .filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startOfWeek && itemDate <= endOfWeek;
          })
          .reduce((sum, item) => sum + (item.points || 0), 0) : 0;

        return {
          rank: 0,
          name: user.name,
          avatar: user.avatar,
          points: weeklyPoints,
          level: user.level || 1,
          weeklyGain: weeklyPoints,
        };
      })
    );

    leaderboard.sort((a, b) => b.points - a.points);
    leaderboard.forEach((entry, i) => (entry.rank = i + 1));

    return res.json(leaderboard);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getGlobalLeaderboard = async (req, res) => {
  try {
    let userClassroomCode = req.user.classroomCode;
    if (req.user.role === 'teacher') {
      const Classroom = (await import('../models/Classroom.js')).default;
      const classroom = await Classroom.findOne({ teacher: req.user._id });
      if (classroom) {
        userClassroomCode = classroom.code;
      }
    }

    if (!userClassroomCode) {
      return res.json([]);
    }

    const users = await User.find({
      role: 'student',
      classroomCode: userClassroomCode,
      classApproved: true,
    })
      .select('name avatar level xp')
      .lean();

    const leaderboard = users.map((user) => ({
      rank: 0,
      name: user.name,
      avatar: user.avatar,
      points: user.xp || 0,
      level: user.level || 1,
    }));

    leaderboard.sort((a, b) => b.points - a.points);
    leaderboard.forEach((entry, i) => (entry.rank = i + 1));

    return res.json(leaderboard);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getMyRank = async (req, res) => {
  try {
    let userClassroomCode = req.user.classroomCode;
    if (req.user.role === 'teacher') {
      const Classroom = (await import('../models/Classroom.js')).default;
      const classroom = await Classroom.findOne({ teacher: req.user._id });
      if (classroom) {
        userClassroomCode = classroom.code;
      }
    }

    if (!userClassroomCode) {
      return res.json({ rank: 1, totalStudents: 1 });
    }

    const users = await User.find({
      role: 'student',
      classroomCode: userClassroomCode,
      classApproved: true,
    })
      .select('name avatar level xp')
      .lean();

    const leaderboard = users.map((user) => ({
      name: user.name,
      avatar: user.avatar,
      points: user.xp || 0,
      level: user.level || 1,
    }));

    leaderboard.sort((a, b) => b.points - a.points);
    const myIndex = leaderboard.findIndex((e) => e.name === req.user.name);

    return res.json({
      rank: myIndex >= 0 ? myIndex + 1 : leaderboard.length + 1,
      totalStudents: leaderboard.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
