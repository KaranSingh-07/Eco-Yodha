import User from '../models/User.js';
import Classroom from '../models/Classroom.js';
import UserProgress from '../models/UserProgress.js';
import QuestSubmission from '../models/QuestSubmission.js';

export const getTeacherStats = async (req, res) => {
  try {
    const classrooms = await Classroom.find({ teacher: req.user._id });
    const studentIds = classrooms.flatMap((c) => c.students);
    const codes = classrooms.map(c => c.code);

    const totalStudents = studentIds.length;
    const pendingApprovals = await User.countDocuments({
      role: 'student',
      classroomCode: { $in: codes },
      classApproved: false
    });

    const students = await User.find({ _id: { $in: studentIds } }).select(
      'level xp'
    );
    const avgLevel =
      students.length > 0
        ? (students.reduce((sum, s) => sum + (s.level || 1), 0) / students.length).toFixed(1)
        : '0.0';
    const avgPoints =
      students.length > 0
        ? Math.round(
            students.reduce((sum, s) => sum + (s.xp || 0), 0) / students.length
          )
        : 0;

    return res.json({
      totalStudents,
      pendingApprovals,
      avgLevel: parseFloat(avgLevel),
      avgPoints,
      activeClasses: classrooms.length,
      classroomNames: classrooms.map((c) => c.name),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getTeacherRoster = async (req, res) => {
  try {
    const classrooms = await Classroom.find({ teacher: req.user._id });
    const studentIds = classrooms.flatMap((c) => c.students);

    const students = await User.find({ _id: { $in: studentIds } })
      .select('-password')
      .lean();

    const roster = await Promise.all(
      students.map(async (student) => {
        const progress = await UserProgress.findOne({ user: student._id });
        const totalPoints = progress?.totalEcoPoints || 0;
        const grade =
          totalPoints >= 2000
            ? 'A'
            : totalPoints >= 1500
            ? 'A-'
            : totalPoints >= 1000
            ? 'B+'
            : totalPoints >= 500
            ? 'B'
            : 'C';

        return {
          _id: student._id,
          name: student.name,
          avatar: student.avatar,
          level: student.level || 1,
          ecoPoints: totalPoints,
          carbonScore: progress?.carbonScore || 0,
          waterScore: progress?.waterScore || 0,
          soilScore: progress?.soilScore || 0,
          grade,
        };
      })
    );

    roster.sort((a, b) => b.ecoPoints - a.ecoPoints);
    return res.json(roster);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getStudentReport = async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId)
      .select('-password')
      .lean();
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const progress = await UserProgress.findOne({ user: student._id });
    return res.json({
      student,
      progress: progress || {
        completedModules: [],
        carbonScore: 0,
        waterScore: 0,
        soilScore: 0,
        totalEcoPoints: 0,
        streak: 0,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getTeacherAnalytics = async (req, res) => {
  try {
    const classrooms = await Classroom.find({ teacher: req.user._id });
    const studentIds = classrooms.flatMap((c) => c.students);
    const progressDocs = await UserProgress.find({ user: { $in: studentIds } });

    // Eco-Points Distribution
    const distribution = [
      { name: 'Beginner (0-500)', count: 0 },
      { name: 'Intermediate (501-1500)', count: 0 },
      { name: 'Advanced (1500+)', count: 0 },
    ];
    let totalCarbon = 0, totalWater = 0, totalSoil = 0;

    progressDocs.forEach(p => {
      if (p.totalEcoPoints <= 500) distribution[0].count++;
      else if (p.totalEcoPoints <= 1500) distribution[1].count++;
      else distribution[2].count++;

      totalCarbon += p.carbonScore || 0;
      totalWater += p.waterScore || 0;
      totalSoil += p.soilScore || 0;
    });

    const avgScores = progressDocs.length > 0 ? [
      { name: 'Carbon footprint', score: totalCarbon / progressDocs.length },
      { name: 'Water conservation', score: totalWater / progressDocs.length },
      { name: 'Soil & Biodiversity', score: totalSoil / progressDocs.length },
    ] : [];

    return res.json({ distribution, avgScores });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const verifyStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { action } = req.body; // 'approve' or 'deny'

    const classroom = await Classroom.findOne({ teacher: req.user._id });
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found for this teacher' });
    }

    if (action === 'approve') {
      if (!classroom.students.includes(studentId)) {
        classroom.students.push(studentId);
        await classroom.save();
      }
      // Set classApproved = true
      await User.findByIdAndUpdate(studentId, { classApproved: true });
      return res.json({ message: 'Student approved successfully' });
    } else {
      // Clear classroom code and set classApproved = false
      await User.findByIdAndUpdate(studentId, {
        classroomCode: '',
        classApproved: false
      });
      // Remove from students array if present
      classroom.students = classroom.students.filter(id => id.toString() !== studentId);
      await classroom.save();
      return res.json({ message: 'Student verification denied' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getPendingStudents = async (req, res) => {
  try {
    const classrooms = await Classroom.find({ teacher: req.user._id });
    const codes = classrooms.map(c => c.code);

    const pendingStudents = await User.find({
      role: 'student',
      classroomCode: { $in: codes },
      classApproved: false
    }).select('name email school grade section createdAt');

    return res.json(pendingStudents);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
