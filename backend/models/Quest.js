import mongoose from 'mongoose';

const questSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    region: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['active', 'locked'], default: 'active' },
    points: { type: Number, required: true },
    doublePoints: { type: Boolean, default: false },
    deadline: { type: Date }, // Global deadline (optional)
    daysToComplete: { type: Number, default: 7 }, // Dynamic deadline relative to unlock date
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
    requiredLevel: { type: Number, default: 1 },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  },
  { timestamps: true }
);

const Quest = mongoose.model('Quest', questSchema);
export default Quest;
