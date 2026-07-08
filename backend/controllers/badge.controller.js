import Badge from '../models/Badge.js';
import UserBadge from '../models/UserBadge.js';

export const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find();
    return res.json(badges);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getMyBadges = async (req, res) => {
  try {
    const userBadges = await UserBadge.find({ user: req.user._id }).populate('badge');
    const badges = userBadges.map(ub => ({ ...ub.badge.toObject(), earned: true, earnedAt: ub.createdAt }));
    return res.json(badges);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const awardBadge = async (req, res) => {
  try {
    const { userId, badgeId } = req.body;
    
    // Check if already awarded
    const existing = await UserBadge.findOne({ user: userId, badge: badgeId });
    if (existing) {
      return res.status(400).json({ message: 'Badge already awarded' });
    }

    const userBadge = await UserBadge.create({ user: userId, badge: badgeId });
    return res.status(201).json(userBadge);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
