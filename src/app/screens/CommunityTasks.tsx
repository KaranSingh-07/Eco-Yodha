import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Target, Upload, Star, Lock, CheckCircle2, Clock, Award, Loader2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { api } from "../../services/api";

interface Task {
  _id: string;
  title: string;
  region: string;
  description: string;
  status: "active" | "locked" | "completed";
  points: number;
  doublePoints: boolean;
  deadline?: string;
  isOverdue?: boolean;
  badges: Array<{ name: string; rarity: string }>;
}

interface Submission {
  _id: string;
  quest: string;
  status: "pending" | "approved" | "rejected";
  remark: "On Time" | "Late Submission";
  awardedPoints: number;
}

interface Badge {
  _id: string;
  name: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earned?: boolean;
}

const rarityColors: Record<string, { bg: string; border: string; glow: string }> = {
  common: { bg: "from-[#6b7280] to-[#4b5563]", border: "#6b7280", glow: "#6b7280" },
  rare: { bg: "from-[#06b6d4] to-[#0891b2]", border: "#06b6d4", glow: "#06b6d4" },
  epic: { bg: "from-[#a855f7] to-[#9333ea]", border: "#a855f7", glow: "#a855f7" },
  legendary: { bg: "from-[#f59e0b] to-[#ea580c]", border: "#f59e0b", glow: "#f59e0b" },
};

export function CommunityTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questData, allBadges, earnedBadges, subData] = await Promise.all([
          api.get("/quests"),
          api.get("/badges"),
          api.get("/badges/my"),
          api.get("/quests/my")
        ]);
        
        const subMap: Record<string, Submission> = {};
        subData.forEach((s: any) => {
          subMap[s.quest._id || s.quest] = s;
        });

        // Map earned status to badges
        const earnedIds = new Set(earnedBadges.map((eb: any) => eb._id || eb.badge?._id || eb));
        const mappedBadges = allBadges.map((badge: any) => ({
          ...badge,
          earned: earnedIds.has(badge._id)
        }));

        // If submitted, mark quest as completed locally for UI
        const mappedQuests = questData.map((q: Task) => {
          if (subMap[q._id]) {
            return { ...q, status: "completed" };
          }
          return q;
        });

        setTasks(mappedQuests);
        setBadges(mappedBadges);
        setSubmissions(subMap);
        const firstUnlocked = mappedQuests.find((q: Task) => q.status !== "locked");
        if (firstUnlocked) {
          setSelectedTask(firstUnlocked);
        } else if (mappedQuests.length > 0) {
          setSelectedTask(mappedQuests[0]);
        }
      } catch (err) {
        console.error("Failed to fetch quests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    let hasError = false;

    files.forEach(file => {
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 15MB limit`);
        hasError = true;
      } else {
        validFiles.push(file);
      }
    });

    if (!hasError && validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleSubmitQuest = async () => {
    if (!selectedTask || uploadedFiles.length === 0) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      uploadedFiles.forEach((file) => formData.append("files", file));

      const res = await fetch(`http://localhost:5001/api/quests/${selectedTask._id}/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      toast.success(`"${selectedTask.title}" submitted successfully for verification!`);
      
      setSubmissions(prev => ({ ...prev, [selectedTask._id]: data }));
      setTasks(prev => prev.map(t => t._id === selectedTask._id ? { ...t, status: "completed" } : t));
      setUploadedFiles([]);
    } catch (err) {
      toast.error("Failed to submit quest");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  const selectedSub = selectedTask ? submissions[selectedTask._id] : null;
  const earnedBadgesCount = badges.filter(b => b.earned).length;

  const getBadgeTier = (count: number) => {
    if (count >= 12) return { label: "Earth Guardian (Tier 3)", color: "bg-gradient-to-r from-[#f59e0b] to-[#ea580c] text-white border-none shadow-lg shadow-[#ea580c]/25" };
    if (count >= 5) return { label: "Green Warrior (Tier 2)", color: "bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white border-none shadow-lg shadow-[#a855f7]/25" };
    if (count >= 1) return { label: "Eco Ranger (Tier 1)", color: "bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-white border-none shadow-lg shadow-[#10b981]/25" };
    return { label: "Scout Initiate (Tier 0)", color: "bg-[#1e2533] border-white/[0.08] text-[#6b7280]" };
  };

  const badgeTier = getBadgeTier(earnedBadgesCount);

  return (
    <div className="min-h-screen bg-[#0B0F12] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl text-white mb-2">Community Quests</h1>
          <p className="text-sm md:text-base text-[#9ca3af]">Take on region-specific environmental challenges</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left - Task List */}
          <div className="lg:col-span-1 space-y-3 md:space-y-4">
            {tasks.map((task) => (
              <button
                key={task._id}
                onClick={() => task.status !== "locked" && setSelectedTask(task)}
                disabled={task.status === "locked"}
                className={`w-full text-left transition-all ${selectedTask?._id === task._id ? "scale-[1.02]" : ""} ${task.status === "locked" ? "cursor-not-allowed" : ""}`}
              >
                <div className={`bg-[#131820] border-2 rounded-2xl p-4 ${
                  task.status === "locked" ? "border-white/[0.08] opacity-50"
                  : task.status === "completed" ? "border-[#10b981]/30 bg-[#10b981]/5"
                  : task.isOverdue ? "border-red-500/30 bg-red-500/5"
                  : selectedTask?._id === task._id ? "border-[#a855f7]"
                  : "border-[#a855f7]/30 hover:border-[#a855f7]/50 bg-[#a855f7]/5"
                }`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      task.status === "completed" ? "bg-[#10b981]/10 text-[#10b981]"
                      : task.status === "locked" ? "bg-[#1e2533] text-[#6b7280]"
                      : task.isOverdue ? "bg-red-500/10 text-red-500"
                      : "bg-[#a855f7]/10 text-[#a855f7]"
                    }`}>
                      {task.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : task.status === "locked" ? <Lock className="w-5 h-5" /> : task.isOverdue ? <AlertCircle className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm line-clamp-2">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#6b7280]">{task.region}</span>
                        {task.isOverdue && task.status !== 'completed' && <span className="text-[10px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">Overdue</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.doublePoints && (
                      <span className="px-2 py-1 bg-[#a855f7]/10 text-[#a855f7] text-xs rounded-lg flex items-center gap-1">
                        <Star className="w-3 h-3" /> 2X Points
                      </span>
                    )}
                    <span className="text-xs text-[#9ca3af]">{task.points} pts</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Center - Task Details */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {selectedTask && (
              <>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`bg-gradient-to-br from-[#131820] to-[#1e2533] border-2 rounded-2xl p-8 relative overflow-hidden ${
                  selectedTask.status === 'completed' ? 'border-[#10b981]' 
                  : selectedTask.isOverdue ? 'border-red-500' 
                  : 'border-[#a855f7]'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.02]" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                             selectedTask.status === 'completed' ? 'bg-gradient-to-br from-[#10b981] to-[#059669]'
                             : selectedTask.isOverdue ? 'bg-gradient-to-br from-red-500 to-red-600'
                             : 'bg-gradient-to-br from-[#a855f7] to-[#ec4899]'
                          }`}>
                            <Target className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl text-white mb-1">{selectedTask.title}</h2>
                            <p className="text-sm text-[#9ca3af]">Region-Centric Task: {selectedTask.region}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-white mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-[#a855f7]" /> Quest Details</h3>
                      <p className="text-[#9ca3af] leading-relaxed">{selectedTask.description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-[#1e2533] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1"><Award className="w-4 h-4 text-[#a855f7]" /><span className="text-xs text-[#9ca3af]">Reward</span></div>
                        <p className="text-xl text-white">{selectedTask.points * (selectedTask.doublePoints ? 2 : 1)} pts</p>
                      </div>
                      <div className="bg-[#1e2533] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-[#06b6d4]" /><span className="text-xs text-[#9ca3af]">Deadline</span></div>
                        <p className={`text-sm ${selectedTask.isOverdue && selectedTask.status !== 'completed' ? 'text-red-400' : 'text-white'}`}>
                          {selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleDateString() : "No deadline"}
                        </p>
                      </div>
                      <div className="bg-[#1e2533] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1"><Star className="w-4 h-4 text-[#f59e0b]" /><span className="text-xs text-[#9ca3af]">Badges</span></div>
                        <p className="text-sm text-white">{selectedTask.badges?.length || 0}</p>
                      </div>
                    </div>

                    {selectedTask.status === "locked" ? (
                      <div className="border-2 border-dashed border-white/[0.08] rounded-xl p-8 text-center bg-[#131820]/50">
                        <Lock className="w-10 h-10 text-[#6b7280] mx-auto mb-3" />
                        <h4 className="text-lg text-white mb-1">Quest Locked</h4>
                        <p className="text-sm text-[#9ca3af]">
                          Complete the associated learning module to unlock this community challenge.
                        </p>
                      </div>
                    ) : selectedSub ? (
                      <div className={`border-2 rounded-xl p-6 text-center ${
                        selectedSub.status === 'approved' ? 'bg-[#10b981]/10 border-[#10b981]/30'
                        : selectedSub.status === 'rejected' ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                      }`}>
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <CheckCircle2 className={`w-8 h-8 ${
                            selectedSub.status === 'approved' ? 'text-[#10b981]' : selectedSub.status === 'rejected' ? 'text-red-500' : 'text-blue-500'
                          }`} />
                          <h4 className="text-xl text-white">Status: <span className="capitalize">{selectedSub.status}</span></h4>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-3">
                          <span className={`text-xs px-2 py-1 rounded ${selectedSub.remark === 'Late Submission' ? 'bg-orange-500/20 text-orange-400' : 'bg-[#10b981]/20 text-[#10b981]'}`}>{selectedSub.remark}</span>
                          {selectedSub.status === 'approved' && (
                            <span className="text-xs px-2 py-1 rounded bg-[#a855f7]/20 text-[#a855f7]">Earned: {selectedSub.awardedPoints} pts</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={`bg-[#1e2533] border-2 border-dashed rounded-xl p-6 ${selectedTask.isOverdue ? 'border-red-500/30' : 'border-[#a855f7]/30'}`}>
                        <div className="text-center mb-4">
                          <Upload className={`w-8 h-8 mx-auto mb-2 ${selectedTask.isOverdue ? 'text-red-500' : 'text-[#a855f7]'}`} />
                          <h4 className="text-white mb-1">Upload Proof of Completion</h4>
                          <p className="text-sm text-[#9ca3af]">Photos, PDF, Presentation, or Videos (Max 15MB)</p>
                        </div>
                        <input type="file" id="file-upload" multiple onChange={handleFileUpload} className="hidden" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,video/*" />
                        <label htmlFor="file-upload" className={`block w-full py-3 px-4 hover:bg-white/5 border rounded-xl text-center cursor-pointer transition-all ${
                          selectedTask.isOverdue ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#a855f7]/10 border-[#a855f7]/30 text-[#a855f7]'
                        }`}>
                          Choose Files
                        </label>
                        {uploadedFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center gap-2 bg-[#131820] rounded-lg p-2">
                                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                                <span className="text-sm text-white flex-1">{file.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {uploadedFiles.length > 0 && (
                          <button onClick={handleSubmitQuest} disabled={submitting} className={`w-full mt-4 py-3 hover:shadow-lg rounded-xl text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                            selectedTask.isOverdue ? 'bg-red-500 hover:shadow-red-500/25' : 'bg-gradient-to-r from-[#10b981] to-[#06b6d4] hover:shadow-[#10b981]/25'
                          }`}>
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {submitting ? "Submitting..." : (selectedTask.isOverdue ? "Submit Late Quest" : "Submit Quest for Verification")}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Badges Collection */}
                <div className="bg-[#131820] border border-white/[0.08] rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-xl text-white flex items-center gap-2">
                      <Award className="w-6 h-6 text-[#f59e0b]" />
                      Eco-Badges Collection
                    </h3>
                    <div className={`px-4 py-1.5 text-xs font-semibold rounded-full border flex items-center gap-2 ${badgeTier.color}`}>
                      <span>{badgeTier.label}</span>
                      <span className="opacity-80">|</span>
                      <span>{earnedBadgesCount} / {badges.length} Badges</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {badges.map((badge) => {
                      const colors = rarityColors[badge.rarity] || rarityColors.common;
                      return (
                        <div key={badge._id} className={`rounded-xl p-4 text-center transition-all ${badge.earned ? "bg-gradient-to-br border-2 hover:scale-105" : "bg-[#1e2533] border border-white/[0.08] opacity-50"}`} style={badge.earned ? { backgroundImage: `linear-gradient(to bottom right, ${colors.border}20, ${colors.border}10)`, borderColor: `${colors.border}40` } : {}}>
                          <div className="relative mb-3">
                            {badge.earned ? (
                              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center mx-auto shadow-lg relative`} style={{ boxShadow: `0 8px 24px ${colors.glow}40` }}>
                                <Star className="w-8 h-8 text-white" />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-[#1e2533] border-2 border-dashed border-white/[0.08] flex items-center justify-center mx-auto">
                                <Lock className="w-6 h-6 text-[#6b7280]" />
                              </div>
                            )}
                          </div>
                          <p className={`text-xs font-medium mb-1 ${badge.earned ? "text-white" : "text-[#6b7280]"}`}>{badge.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
