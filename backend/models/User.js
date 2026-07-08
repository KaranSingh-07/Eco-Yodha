import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher'], required: true },
    // Student fields
    school: { type: String },
    grade: { type: String },
    section: { type: String },
    classroomCode: { type: String },
    classApproved: { type: Boolean, default: false },
    // Teacher fields
    institutionName: { type: String },
    department: { type: String },
    phone: { type: String },
    location: { type: String },
    specialization: { type: String },
    classrooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }],
    // Gamification
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    avatar: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
