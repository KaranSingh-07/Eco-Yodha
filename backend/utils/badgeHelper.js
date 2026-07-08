import Badge from '../models/Badge.js';
import UserBadge from '../models/UserBadge.js';
import QuizSubmission from '../models/QuizSubmission.js';
import QuestSubmission from '../models/QuestSubmission.js';
import UserProgress from '../models/UserProgress.js';
import Module from '../models/Module.js';
import Quest from '../models/Quest.js';

export const checkAndAwardBadges = async (userId) => {
  try {
    // 1. Fetch all badge definitions
    const allBadges = await Badge.find();
    if (allBadges.length === 0) return;

    // 2. Fetch badges already earned by the user to avoid duplicate awarding
    const earnedUserBadges = await UserBadge.find({ user: userId });
    const earnedBadgeIds = earnedUserBadges.map((ub) => ub.badge.toString());

    const awardIfEligible = async (badgeName) => {
      const badge = allBadges.find((b) => b.name.toLowerCase() === badgeName.toLowerCase());
      if (!badge) {
        console.warn(`[BADGE AUTO-AWARD] Badge definition not found for: "${badgeName}"`);
        return;
      }

      if (!earnedBadgeIds.includes(badge._id.toString())) {
        await UserBadge.create({ user: userId, badge: badge._id });
        console.log(`[BADGE AUTO-AWARD] Automatically awarded badge "${badge.name}" to user ${userId}`);
      }
    };

    // 3. Fetch user progress
    const progress = await UserProgress.findOne({ user: userId });
    if (!progress) return;

    // --- CRITERIA CHECK ---

    // A. "Climate Champion" - Total points exceed 500
    if (progress.totalEcoPoints >= 500) {
      await awardIfEligible("Climate Champion");
    }

    // B. "Water Warrior" - Complete all water modules
    const waterModules = await Module.find({ title: { $regex: /water/i } });
    if (waterModules.length > 0) {
      const completedWater = waterModules.filter((m) => progress.completedModules.includes(m._id.toString()));
      if (completedWater.length === waterModules.length) {
        await awardIfEligible("Water Warrior");
      }
    }

    // C. "Carbon Crusher" - Complete all carbon modules
    const carbonModules = await Module.find({ title: { $regex: /carbon/i } });
    if (carbonModules.length > 0) {
      const completedCarbon = carbonModules.filter((m) => progress.completedModules.includes(m._id.toString()));
      if (completedCarbon.length === carbonModules.length) {
        await awardIfEligible("Carbon Crusher");
      }
    }

    // D. "Quiz Master" - Perfect score on 3 quizzes
    const submissions = await QuizSubmission.find({ user: userId });
    const perfectCount = submissions.filter((sub) => sub.score === sub.totalQuestions).length;
    if (perfectCount >= 3) {
      await awardIfEligible("Quiz Master");
    }

    // E. "Eco Starter" - First community quest approved
    const approvedQuests = await QuestSubmission.find({ user: userId, status: 'approved' }).populate('quest');
    if (approvedQuests.length >= 1) {
      await awardIfEligible("Eco Starter");
    }

    // F. "Community Leader" - Submit 5 community tasks
    if (approvedQuests.length >= 5) {
      await awardIfEligible("Community Leader");
    }

    // G. "Punjab Pioneer" - Punjab quest approved
    const hasPunjabQuestApproved = approvedQuests.some(
      (sub) => sub.quest && sub.quest.region && sub.quest.region.toLowerCase() === 'punjab'
    );
    if (hasPunjabQuestApproved) {
      await awardIfEligible("Punjab Pioneer");
    }

    // H. "Biodiversity Scout" - Biodiversity survey quest approved
    const hasBiodiversityQuestApproved = approvedQuests.some(
      (sub) => sub.quest && sub.quest.title && sub.quest.title.toLowerCase().includes('biodiversity')
    );
    if (hasBiodiversityQuestApproved) {
      await awardIfEligible("Biodiversity Scout");
    }

  } catch (error) {
    console.error('[BADGE AUTO-AWARD] Error checking user badge status:', error);
  }
};
