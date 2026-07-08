import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Classroom from '../models/Classroom.js';
import generateToken from '../utils/generateToken.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'teacher']),
  school: z.string().optional(),
  grade: z.string().optional(),
  section: z.string().optional(),
  classroomCode: z.string().optional(),
  institutionName: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  specialization: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerUser = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Custom validations based on role
    if (validatedData.role === 'student') {
      if (!validatedData.classroomCode) {
        return res.status(400).json({ message: 'Classroom code is required for students' });
      }
      const classroomExists = await Classroom.findOne({ code: validatedData.classroomCode.trim().toUpperCase() });
      if (!classroomExists) {
        return res.status(400).json({ message: 'Invalid classroom code. Please check with your teacher.' });
      }
      // Normalize classroom code
      validatedData.classroomCode = validatedData.classroomCode.trim().toUpperCase();
    } else if (validatedData.role === 'teacher') {
      if (!validatedData.grade || !validatedData.section) {
        return res.status(400).json({ message: 'Grade and section are required for teachers' });
      }
      if (!validatedData.institutionName) {
        return res.status(400).json({ message: 'Institution Name is required for teachers' });
      }
    }

    const userExists = await User.findOne({ email: validatedData.email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    const initials = validatedData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const userData = {
      ...validatedData,
      password: hashedPassword,
      avatar: initials,
    };

    if (validatedData.role === 'student') {
      userData.classApproved = true; // Changed to true to allow immediate login
    }

    const user = await User.create(userData);

    if (user) {
      if (user.role === 'student') {
        await UserProgress.create({
          user: user._id,
          completedModules: [],
          carbonScore: 0,
          waterScore: 0,
          soilScore: 0,
          totalEcoPoints: 0,
          weeklyPoints: 0,
          streak: 0,
        });
      } else if (user.role === 'teacher') {
        // Generate unique 6-character code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        let codeExists = true;
        while (codeExists) {
          code = '';
          for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          const checkClass = await Classroom.findOne({ code });
          if (!checkClass) {
            codeExists = false;
          }
        }

        const classroomName = `${validatedData.grade} - Section ${validatedData.section}`;
        const classroom = await Classroom.create({
          name: classroomName,
          code: code,
          teacher: user._id,
          students: [],
        });

        user.classrooms = [classroom._id];
        await user.save();
      }

      // Automatically login the student since they are auto-approved
      if (user.role === 'student') {
        return res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          token: generateToken(user._id, user.role),
        });
      }

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id, user.role),
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const authUser = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Create an account' });
    }

    if (await bcrypt.compare(password, user.password)) {
      if (user.role === 'student' && !user.classApproved) {
        return res.status(401).json({ message: 'not verified' });
      }
      if (user.role === 'student') {
        const progress = await UserProgress.findOne({ user: user._id });
        if (progress) {
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
          user.currentStreak = progress.streak;
          user.lastActiveDate = today;
          await user.save();
        }
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id, user.role),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    let query = User.findById(req.user._id).select('-password');
    if (req.user.role === 'teacher') {
      query = query.populate('classrooms');
    }
    const user = await query;
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      if (user.role === 'student') {
        user.school = req.body.school || user.school;
        user.grade = req.body.grade || user.grade;
        user.section = req.body.section || user.section;
      } else {
        user.institutionName = req.body.institutionName || user.institutionName;
        user.department = req.body.department || user.department;
        user.phone = req.body.phone || user.phone;
        user.location = req.body.location || user.location;
        user.specialization = req.body.specialization || user.specialization;
      }

      const updatedUser = await user.save();

      return res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        token: generateToken(updatedUser._id, updatedUser.role),
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
