import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], required: true },
    icon: { type: String }, // e.g. "WaterWarrior", "Star"
    criteria: { type: String },
  },
  { timestamps: true }
);

const Badge = mongoose.model('Badge', badgeSchema);
export default Badge;
