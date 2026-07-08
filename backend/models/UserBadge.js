import mongoose from 'mongoose';

const userBadgeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  },
  { timestamps: true }
);

// Prevent duplicate badges for the same user
userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

const UserBadge = mongoose.model('UserBadge', userBadgeSchema);
export default UserBadge;
