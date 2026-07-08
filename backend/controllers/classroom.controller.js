import Classroom from '../models/Classroom.js';
import User from '../models/User.js';
import crypto from 'crypto';

export const createClassroom = async (req, res) => {
  try {
    const { name } = req.body;
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    const classroom = await Classroom.create({
      name,
      code,
      teacher: req.user._id,
      students: [],
    });

    // Add classroom to teacher's classrooms array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { classrooms: classroom._id },
    });

    return res.status(201).json(classroom);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const joinClassroom = async (req, res) => {
  try {
    const { code } = req.body;
    
    const classroom = await Classroom.findOne({ code });
    if (!classroom) {
      return res.status(404).json({ message: 'Invalid classroom code' });
    }

    if (classroom.students.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already joined this classroom' });
    }

    classroom.students.push(req.user._id);
    await classroom.save();

    await User.findByIdAndUpdate(req.user._id, {
      classroomCode: code,
    });

    return res.json({ message: 'Successfully joined classroom', classroom });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getTeacherStudents = async (req, res) => {
  try {
    const classrooms = await Classroom.find({ teacher: req.user._id }).populate('students', '-password');
    const students = classrooms.flatMap(c => c.students);
    return res.json(students);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
