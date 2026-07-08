import { api } from "./api";

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  rank: number;
}

export const getLeaderboard = async () => {
  return api.get('/leaderboard');
};
