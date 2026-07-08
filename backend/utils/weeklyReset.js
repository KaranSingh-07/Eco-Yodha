import mongoose from 'mongoose';
import UserProgress from '../models/UserProgress.js';

// Define a simple settings schema to store reset metadata persistently in the database
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true }
});

let Settings;
try {
  Settings = mongoose.model('Settings');
} catch (e) {
  Settings = mongoose.model('Settings', settingsSchema);
}

/**
 * Checks if the weekly leaderboard points need to be reset.
 * Resets occur on Sunday at 11:59 PM.
 * This is self-healing: if the server is down during the Sunday reset window,
 * it will perform the reset immediately upon next startup.
 */
export const checkWeeklyReset = async () => {
  try {
    const now = new Date();
    const lastResetDoc = await Settings.findOne({ key: 'lastLeaderboardReset' });

    // Helper to get Sunday 11:59:59 PM of the week containing a specific date
    const getSundayOfWeek = (d) => {
      const date = new Date(d);
      const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const diff = date.getDate() - day; // Adjust date to Sunday of this week
      const sunday = new Date(date.setDate(diff));
      sunday.setHours(23, 59, 59, 999);
      return sunday;
    };

    const currentWeekSunday = getSundayOfWeek(now);

    let shouldReset = false;

    if (!lastResetDoc) {
      // First time initialization
      await Settings.create({ key: 'lastLeaderboardReset', value: now.toISOString() });
      console.log('[WEEKLY RESET] Leaderboard scheduler initialized.');
    } else {
      const lastResetDate = new Date(lastResetDoc.value);
      const lastResetWeekSunday = getSundayOfWeek(lastResetDate);

      // If we are in a later week than the last reset, and we have passed this week's Sunday 11:59 PM
      if (now.getTime() > currentWeekSunday.getTime() && lastResetWeekSunday.getTime() < currentWeekSunday.getTime()) {
        shouldReset = true;
      }
    }

    if (shouldReset) {
      console.log('[WEEKLY RESET] Sunday 11:59 PM milestone crossed. Resetting weekly sprint points for all users...');
      
      const result = await UserProgress.updateMany({}, { weeklyPoints: 0 });
      console.log(`[WEEKLY RESET] Reset weekly points for ${result.modifiedCount} student profiles.`);

      if (lastResetDoc) {
        lastResetDoc.value = now.toISOString();
        await lastResetDoc.save();
      }
    }
  } catch (error) {
    console.error('[WEEKLY RESET] Failed to execute weekly reset check:', error);
  }
};

/**
 * Starts a background interval to run the reset check periodically.
 */
export const initWeeklyResetScheduler = () => {
  // Run immediate check at startup
  checkWeeklyReset();

  // Run check every 30 minutes in the background
  setInterval(async () => {
    await checkWeeklyReset();
  }, 1000 * 60 * 30);
};
