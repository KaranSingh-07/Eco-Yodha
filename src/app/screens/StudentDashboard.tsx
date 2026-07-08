import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Droplet, Leaf, Wind, School, BookOpen, Target, Award, Calendar, Mail, Loader2, GraduationCap } from "lucide-react";
import { TrendChart } from "../components/TrendChart";
import { api } from "../../services/api";

interface DashboardData {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    level: number;
    xp: number;
    school?: string;
    grade?: string;
    section?: string;
    currentStreak: number;
    classroomCode?: string;
    classApproved?: boolean;
    teacherName?: string;
    classroomName?: string;
  };
  progress: {
    completedModules: number;
    totalModules: number;
    carbonScore: number;
    waterScore: number;
    soilScore: number;
    questScore: number;
    otherScore: number;
    totalEcoPoints: number;
    weeklyPoints: number;
    streak: number;
  };
}

interface TrendData {
  carbonData: Array<{ day: string; carbonScore: number }>;
  waterData: Array<{ day: string; waterScore: number }>;
  soilData: Array<{ day: string; soilScore: number }>;
}

export function StudentDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashData, trendData] = await Promise.all([
          api.get("/progress/dashboard"),
          api.get("/progress/trends"),
        ]);
        setDashboard(dashData);
        setTrends(trendData);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  const user = dashboard?.user;
  const progress = dashboard?.progress;
  const carbonScore = progress?.carbonScore || 0;
  const waterScore = progress?.waterScore || 0;
  const soilScore = progress?.soilScore || 0;
  const questScore = progress?.questScore || 0;
  const totalEcoPoints = progress?.totalEcoPoints || 0;
  const getLevelInfo = (xp: number) => {
    if (xp <= 60) return { level: 1, min: 0, max: 60, title: "Eco Seed", image: "🌱" };
    if (xp <= 150) return { level: 2, min: 61, max: 150, title: "Eco Sprout", image: "🌿" };
    if (xp <= 280) return { level: 3, min: 151, max: 280, title: "Eco Sapling", image: "🌳" };
    if (xp <= 500) return { level: 4, min: 281, max: 500, title: "Eco Tree", image: "🌍" };
    return { level: 5, min: 501, max: 1000, title: "Eco Guardian", image: "🌟" };
  };

  const levelInfo = getLevelInfo(totalEcoPoints);
  const level = levelInfo.level;
  const levelProgress = Math.min(100, Math.round(((totalEcoPoints - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100));
  const xpRemaining = Math.max(0, levelInfo.max - totalEcoPoints);

  const carbonData = trends?.carbonData || [
    { day: "Mon", carbonScore: 10 }, { day: "Tue", carbonScore: 15 },
    { day: "Wed", carbonScore: 20 }, { day: "Thu", carbonScore: 25 },
    { day: "Fri", carbonScore: 30 }, { day: "Sat", carbonScore: 35 },
    { day: "Sun", carbonScore: 40 },
  ];
  const waterData = trends?.waterData || [
    { day: "Mon", waterScore: 8 }, { day: "Tue", waterScore: 12 },
    { day: "Wed", waterScore: 16 }, { day: "Thu", waterScore: 20 },
    { day: "Fri", waterScore: 24 }, { day: "Sat", waterScore: 28 },
    { day: "Sun", waterScore: 32 },
  ];
  const soilData = trends?.soilData || [
    { day: "Mon", soilScore: 5 }, { day: "Tue", soilScore: 10 },
    { day: "Wed", soilScore: 15 }, { day: "Thu", soilScore: 20 },
    { day: "Fri", soilScore: 22 }, { day: "Sat", soilScore: 25 },
    { day: "Sun", soilScore: 30 },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F12] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Pending Verification Banner */}
        {!user?.classApproved && (
          <div className="mb-6 bg-yellow-500/15 border border-yellow-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-yellow-500 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Verification Pending:</span>
              <span>Your registration with classroom code <span className="font-mono bg-[#1e2533] px-2 py-0.5 rounded text-white">{user?.classroomCode}</span> is waiting for teacher approval.</span>
            </div>
            <span className="text-xs opacity-75">You will get full access once approved.</span>
          </div>
        )}

        {/* Profile Header */}
        <div className="mb-6 lg:mb-8 bg-gradient-to-br from-[#131820] to-[#1e2533] border border-white/[0.08] rounded-2xl p-4 md:p-6">
          <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-0 lg:justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#06b6d4] flex items-center justify-center text-white text-2xl md:text-3xl shadow-lg shadow-[#10b981]/25">
                  {user?.avatar || "U"}
                </div>
                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-[#a855f7] to-[#ec4899] border-2 md:border-4 border-[#0B0F12] flex items-center justify-center text-white text-xs md:text-sm">
                  {level}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl lg:text-3xl text-white mb-2 truncate">{user?.name || "Student"}</h1>
                <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-[#9ca3af]">
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-[#10b981]" />
                    <span>{user?.school || "Eco-Yodha"}</span>
                  </div>
                  {user?.classApproved ? (
                    <>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#06b6d4]" />
                        <span>Class: {user.classroomName || user.grade}</span>
                      </div>
                      {user.teacherName && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-[#a855f7]" />
                          <span>Teacher: {user.teacherName}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-500/80">
                      <GraduationCap className="w-4 h-4 text-yellow-500" />
                      <span>Pending Verification (Code: {user?.classroomCode})</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#a855f7]" />
                    <span>{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3 w-full lg:w-auto">
              <div className="bg-[#1e2533] rounded-xl p-3 md:p-4 text-center flex-1 lg:min-w-[100px]">
                <div className="flex items-center justify-center gap-1 md:gap-2 mb-1">
                  <Target className="w-3 h-3 md:w-4 md:h-4 text-[#10b981]" />
                  <span className="text-xl md:text-2xl text-white">{progress?.streak || 0}</span>
                </div>
                <p className="text-[10px] md:text-xs text-[#9ca3af]">Day Streak</p>
              </div>
              <div className="bg-[#1e2533] rounded-xl p-3 md:p-4 text-center flex-1 lg:min-w-[100px]">
                <div className="flex items-center justify-center gap-1 md:gap-2 mb-1">
                  <Award className="w-3 h-3 md:w-4 md:h-4 text-[#f59e0b]" />
                  <span className="text-xl md:text-2xl text-white">{progress?.completedModules || 0}</span>
                </div>
                <p className="text-[10px] md:text-xs text-[#9ca3af]">Modules Done</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 lg:mb-8">
          {/* Modules Completed */}
          <div className="bg-[#131820] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#10b981]" />
              </div>
              <div>
                <h3 className="text-white">Modules Completed</h3>
                <p className="text-sm text-[#9ca3af]">Learning Progress</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl text-white mb-1">
                  {progress?.completedModules || 0}/{progress?.totalModules || 7}
                </p>
                <p className="text-sm text-[#10b981]">
                  {Math.round(((progress?.completedModules || 0) / (progress?.totalModules || 7)) * 100)}% Complete
                </p>
              </div>
              <div className="h-16 w-16">
                <div className="relative w-full h-full">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#1e2533" strokeWidth="6" fill="none" />
                    <circle
                      cx="32" cy="32" r="28" stroke="#10b981" strokeWidth="6" fill="none"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - (progress?.completedModules || 0) / (progress?.totalModules || 7))}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
                    {Math.round(((progress?.completedModules || 0) / (progress?.totalModules || 7)) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Eco Points */}
          <div className="bg-[#131820] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#a855f7]" />
              </div>
              <div>
                <h3 className="text-white">Total Eco-Points</h3>
                <p className="text-sm text-[#9ca3af]">Lifetime Score</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl text-white mb-1">{totalEcoPoints}</p>
                <p className="text-sm text-[#a855f7]">+{progress?.weeklyPoints || 0} this week</p>
              </div>
              <div className="text-right">
                <div className="bg-gradient-to-br from-[#10b981] to-[#06b6d4] rounded-xl p-3">
                  <p className="text-white text-lg">{level}</p>
                  <p className="text-xs text-white/80">Level</p>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-[#131820] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-[#f59e0b]" />
              </div>
              <div>
                <h3 className="text-white">Current Level</h3>
                <p className="text-sm text-[#9ca3af]">Eco Warrior Level {level}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9ca3af]">Progress to Level {level + 1}</span>
                <span className="text-[#10b981]">{levelProgress}%</span>
              </div>
              <div className="h-3 bg-[#1e2533] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
              </div>
              <p className="text-xs text-[#6b7280]">{xpRemaining} XP until next level</p>
            </div>
          </div>
        </div>

        {/* Main Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Hero Card - Avatar Evolution */}
          <div className="lg:col-span-1 lg:row-span-2 bg-gradient-to-br from-[#131820] to-[#1e2533] border border-white/[0.08] rounded-2xl p-4 md:p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 via-transparent to-[#06b6d4]/10" />
            <div className="relative z-10">
              <h2 className="text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#10b981]" />
                Companion Avatar
              </h2>
              <div className="mb-6">
                <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-[#10b981]/20 to-[#06b6d4]/20 border border-[#10b981]/30 flex items-center justify-center mb-4 text-7xl">
                  {levelInfo.image}
                </div>
                <div className="text-center">
                  <h3 className="text-2xl text-white mb-1">
                    {levelInfo.title}
                  </h3>
                  <p className="text-sm text-[#9ca3af]">Stage {levelInfo.level} Evolution</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#9ca3af]">Level {level}</span>
                  <span className="text-sm text-[#10b981]">{levelProgress}%</span>
                </div>
                <div className="h-3 bg-[#1e2533] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
                </div>
                <p className="text-xs text-[#6b7280] text-center">{xpRemaining} XP until next evolution</p>
              </div>
            </div>
          </div>

          {/* Core Equation Widget */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#131820] to-[#1e2533] border border-white/[0.08] rounded-2xl p-4 md:p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 via-transparent to-[#06b6d4]/5" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                  <h2 className="text-lg md:text-xl lg:text-2xl text-white mb-2 flex items-center gap-2 md:gap-3">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-[#10b981]" />
                    Lifetime Eco-Points
                  </h2>
                  <p className="text-xs md:text-sm text-[#9ca3af]">Your environmental impact score breakdown</p>
                </div>
                <div className="bg-gradient-to-br from-[#10b981] to-[#06b6d4] rounded-2xl p-4 md:p-6 shadow-lg shadow-[#10b981]/25 w-full md:min-w-[180px]">
                  <p className="text-xs md:text-sm text-white/80 mb-1">Total Eco-Points</p>
                  <p className="text-4xl md:text-5xl text-white">{totalEcoPoints}</p>
                  <div className="mt-2 flex items-center gap-2 text-white/80">
                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs">+{progress?.weeklyPoints || 0} this week</span>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-[#1e2533] rounded-xl p-5 border-2 border-[#10b981]/30 hover:border-[#10b981]/60 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
                      <Wind className="w-6 h-6 text-[#10b981]" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl text-[#10b981] mb-1">{carbonScore}</p>
                      <p className="text-xs text-[#9ca3af]">Points</p>
                    </div>
                  </div>
                  <h3 className="text-white mb-1">Carbon Score</h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#9ca3af]">Contribution</span>
                    <span className="text-[#10b981]">{totalEcoPoints > 0 ? Math.round((carbonScore / totalEcoPoints) * 100) : 0}%</span>
                  </div>
                </div>

                <div className="bg-[#1e2533] rounded-xl p-5 border-2 border-[#06b6d4]/30 hover:border-[#06b6d4]/60 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center">
                      <Droplet className="w-6 h-6 text-[#06b6d4]" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl text-[#06b6d4] mb-1">{waterScore}</p>
                      <p className="text-xs text-[#9ca3af]">Points</p>
                    </div>
                  </div>
                  <h3 className="text-white mb-1">Water Score</h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#9ca3af]">Contribution</span>
                    <span className="text-[#06b6d4]">{totalEcoPoints > 0 ? Math.round((waterScore / totalEcoPoints) * 100) : 0}%</span>
                  </div>
                </div>

                <div className="bg-[#1e2533] rounded-xl p-5 border-2 border-[#e07856]/30 hover:border-[#e07856]/60 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#e07856]/10 flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-[#e07856]" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl text-[#e07856] mb-1">{soilScore}</p>
                      <p className="text-xs text-[#9ca3af]">Points</p>
                    </div>
                  </div>
                  <h3 className="text-white mb-1">Soil Score</h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#9ca3af]">Contribution</span>
                    <span className="text-[#e07856]">{totalEcoPoints > 0 ? Math.round((soilScore / totalEcoPoints) * 100) : 0}%</span>
                  </div>
                </div>

                <div className="bg-[#1e2533] rounded-xl p-5 border-2 border-[#a855f7]/30 hover:border-[#a855f7]/60 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-[#a855f7]" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl text-[#a855f7] mb-1">{questScore}</p>
                      <p className="text-xs text-[#9ca3af]">Points</p>
                    </div>
                  </div>
                  <h3 className="text-white mb-1">Quests Score</h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#9ca3af]">Contribution</span>
                    <span className="text-[#a855f7]">{totalEcoPoints > 0 ? Math.round((questScore / totalEcoPoints) * 100) : 0}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/[0.08]">
                <div className="flex flex-wrap items-center justify-center gap-3 text-[#9ca3af] text-sm md:text-base">
                  <span className="text-[#10b981] font-semibold">{carbonScore} Carbon</span>
                  <span>+</span>
                  <span className="text-[#06b6d4] font-semibold">{waterScore} Water</span>
                  <span>+</span>
                  <span className="text-[#e07856] font-semibold">{soilScore} Soil</span>
                  <span>+</span>
                  <span className="text-[#a855f7] font-semibold">{questScore} Community Tasks</span>
                  <span>+</span>
                  <span className="text-purple-400 font-semibold">{progress?.otherScore || 0} Other</span>
                  <span>=</span>
                  <span className="text-white text-lg font-bold">{totalEcoPoints} Total Eco-Points</span>
                </div>
              </div>
            </div>
          </div>

          <TrendChart data={carbonData} dataKey="carbonScore" title="Carbon Score Trend" color="#10b981" chartId="carbon-trend-chart" />
          <TrendChart data={waterData} dataKey="waterScore" title="Water Score Trend" color="#06b6d4" chartId="water-trend-chart" />
          <TrendChart data={soilData} dataKey="soilScore" title="Soil Score Trend" color="#e07856" chartId="soil-trend-chart" />
        </div>
      </div>
    </div>
  );
}
