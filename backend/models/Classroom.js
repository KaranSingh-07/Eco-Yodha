import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "10-A"
    code: { type: String, required: true, unique: true }, // 6-digit code
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const Classroom = mongoose.model('Classroom', classroomSchema);
export default Classroom;
