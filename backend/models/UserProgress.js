import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    completedModules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    currentModule: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    completedSubtopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subtopic' }],
    currentSubtopic: { type: mongoose.Schema.Types.ObjectId, ref: 'Subtopic' },
    carbonScore: { type: Number, default: 0 },
    waterScore: { type: Number, default: 0 },
    soilScore: { type: Number, default: 0 },
    otherScore: { type: Number, default: 0 },
    questScore: { type: Number, default: 0 },
    totalEcoPoints: { type: Number, default: 0 },
    unlockedQuests: [{
      quest: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest' },
      unlockedAt: { type: Date, default: Date.now },
      deadline: { type: Date }
    }],
    scoreHistory: [{
      date: { type: Date, default: Date.now },
      category: { type: String, enum: ['soil', 'water', 'carbon', 'other'] },
      points: { type: Number }
    }],
    weeklyPoints: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
  },
  { timestamps: true }
);

const UserProgress = mongoose.model('UserProgress', userProgressSchema);
export default UserProgress;
