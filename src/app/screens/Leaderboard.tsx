import { Trophy, TrendingUp, Crown, Medal, Award, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../services/api";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  level: number;
  weeklyGain?: number;
}

export function Leaderboard() {
  const [tab, setTab] = useState<"weekly" | "global">("weekly");
  const [weeklyData, setWeeklyData] = useState<LeaderboardEntry[]>([]);
  const [globalData, setGlobalData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weekly, global] = await Promise.all([
          api.get("/leaderboard/weekly"),
          api.get("/leaderboard/global"),
        ]);
        setWeeklyData(weekly);
        setGlobalData(global);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentData = tab === "weekly" ? weeklyData : globalData;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  const getWeeklyRangeString = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (date: Date) => {
      const day = date.getDate();
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    };
    return `${formatDate(monday)} to ${formatDate(sunday)}`;
  };

  const weeklyDateString = getWeeklyRangeString();

  return (
    <div className="min-h-screen bg-[#0B0F12] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl text-white mb-2">Leaderboard</h1>
            <p className="text-sm md:text-base text-[#9ca3af]">Compete with peers and track your progress</p>
          </div>
          {tab === "weekly" && (
            <div className="bg-[#131820] border border-[#a855f7]/30 px-4 py-2 rounded-xl text-xs md:text-sm text-[#9ca3af] font-medium self-start md:self-auto">
              Sprint Week: <span className="text-[#a855f7] font-semibold">{weeklyDateString}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
          <button onClick={() => setTab("weekly")} className={`flex-1 py-4 px-6 rounded-xl transition-all ${tab === "weekly" ? "bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white shadow-lg shadow-[#a855f7]/25" : "bg-[#131820] border border-white/[0.08] text-[#9ca3af] hover:border-[#a855f7]/30"}`}>
            <div className="flex items-center justify-center gap-3">
              <TrendingUp className="w-5 h-5" />
              <div className="text-left">
                <div className="flex items-center gap-2"><span>Weekly Sprint</span>{tab === "weekly" && <Clock className="w-4 h-4" />}</div>
                {tab === "weekly" && <p className="text-xs opacity-80">Resets Sunday at 11:59 PM</p>}
              </div>
            </div>
          </button>
          <button onClick={() => setTab("global")} className={`flex-1 py-4 px-6 rounded-xl transition-all ${tab === "global" ? "bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-white shadow-lg shadow-[#10b981]/25" : "bg-[#131820] border border-white/[0.08] text-[#9ca3af] hover:border-[#10b981]/30"}`}>
            <div className="flex items-center justify-center gap-3">
              <Trophy className="w-5 h-5" />
              <div className="text-left"><span>Global Lifetime</span>{tab === "global" && <p className="text-xs opacity-80">All-time rankings</p>}</div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
            {currentData.slice(0, 3).map((entry, index) => {
              const colors = [
                { bg: "from-[#f59e0b] to-[#ea580c]", border: "#f59e0b", icon: Crown },
                { bg: "from-[#94a3b8] to-[#64748b]", border: "#94a3b8", icon: Medal },
                { bg: "from-[#cd7f32] to-[#a0522d]", border: "#cd7f32", icon: Award },
              ];
              const color = colors[index];
              const Icon = color.icon;

              return (
                <div key={entry.rank} className={`bg-gradient-to-br ${color.bg} rounded-2xl p-4 md:p-6 text-white ${index === 1 ? "md:order-1" : index === 0 ? "md:order-2" : "md:order-3"} ${index === 0 ? "md:scale-105" : "mt-0 md:mt-8"}`}>
                  <div className="flex flex-col items-center text-center">
                    <Icon className="w-8 h-8 mb-3" />
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center text-2xl mb-3">{entry.avatar}</div>
                    <h3 className="mb-1">{entry.name}</h3>
                    <p className="text-sm opacity-80 mb-3">Level {entry.level}</p>
                    <div className="text-3xl mb-1">{entry.points}</div>
                    <p className="text-xs opacity-80">{tab === "weekly" ? `+${entry.weeklyGain || 0} this week` : "Total Points"}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rest of Leaderboard */}
          <div className="bg-[#131820] border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left text-sm text-[#9ca3af] p-4 w-20">Rank</th>
                    <th className="text-left text-sm text-[#9ca3af] p-4">Student</th>
                    <th className="text-left text-sm text-[#9ca3af] p-4">Level</th>
                    <th className="text-left text-sm text-[#9ca3af] p-4">Points</th>
                    {tab === "weekly" && <th className="text-left text-sm text-[#9ca3af] p-4">Weekly Gain</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((entry) => (
                    <tr key={entry.rank} className="border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="w-10 h-10 rounded-lg bg-[#1e2533] flex items-center justify-center text-[#9ca3af] text-sm">{entry.rank}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center text-sm text-white">{entry.avatar}</div>
                          <p className="text-white">{entry.name}</p>
                        </div>
                      </td>
                      <td className="p-4"><span className="text-[#9ca3af]">Level {entry.level}</span></td>
                      <td className="p-4"><span className="text-white">{entry.points}</span></td>
                      {tab === "weekly" && (
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-[#10b981]"><TrendingUp className="w-4 h-4" /><span>+{entry.weeklyGain || 0}</span></div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {tab === "weekly" && (
          <div className="mt-6 bg-gradient-to-r from-[#a855f7]/10 to-[#ec4899]/10 border border-[#a855f7]/30 rounded-xl p-4">
            <div className="flex items-center justify-center gap-3 text-center">
              <Clock className="w-5 h-5 text-[#a855f7]" />
              <div>
                <p className="text-white">Weekly leaderboard resets on <span className="text-[#a855f7]">Sunday at 11:59 PM</span></p>
                <p className="text-sm text-[#9ca3af]">Earn more points before the reset to climb the ranks!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
