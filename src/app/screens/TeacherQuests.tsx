import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { Search, CheckCircle2, Clock, XCircle, ChevronRight, FileText, UploadCloud, Target, Loader2, Award } from "lucide-react";

interface Submission {
  _id: string;
  status: "pending" | "approved" | "rejected";
  files: Array<{ url: string; filename: string }>;
  remark: "On Time" | "Late Submission";
  awardedPoints: number;
  submittedAt: string;
}

interface StudentStatus {
  student: {
    _id: string;
    name: string;
    avatar: string;
  };
  hasSubmitted: boolean;
  submission: Submission | null;
}

interface QuestWithStudents {
  _id: string;
  title: string;
  region: string;
  points: number;
  doublePoints: boolean;
  studentStatuses: StudentStatus[];
}

export function TeacherQuests() {
  const [quests, setQuests] = useState<QuestWithStudents[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuest, setSelectedQuest] = useState<QuestWithStudents | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null);
  const [pointsInput, setPointsInput] = useState<string>("");

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      const res = await api.get("/quests/teacher/all");
      setQuests(res);
      if (res.length > 0 && !selectedQuest) {
        setSelectedQuest(res[0]);
      }
    } catch (err) {
      toast.error("Failed to load quests");
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId: string, maxPoints: number) => {
    const points = parseInt(pointsInput);
    if (isNaN(points) || points < 0 || points > maxPoints) {
      toast.error(`Please enter valid points between 0 and ${maxPoints}`);
      return;
    }
    
    setGradingSubmission(submissionId);
    try {
      await api.post(`/quests/teacher/grade/${submissionId}`, { pointsAwarded: points });
      toast.success("Submission graded successfully!");
      fetchQuests(); // Re-fetch to update state
    } catch (err) {
      toast.error("Failed to grade submission");
    } finally {
      setGradingSubmission(null);
      setPointsInput("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  const filteredStudents = selectedQuest?.studentStatuses.filter((s) =>
    s.student.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Community Quests</h1>
          <p className="text-[#9ca3af]">Review and grade student task submissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Quests List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#131820] border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/[0.08] bg-[#1e2533]">
              <h2 className="font-medium text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#a855f7]" /> Active Quests
              </h2>
            </div>
            <div className="divide-y divide-white/[0.08] max-h-[600px] overflow-y-auto">
              {quests.map((quest) => (
                <button
                  key={quest._id}
                  onClick={() => { setSelectedQuest(quest); setSearchQuery(""); }}
                  className={`w-full text-left p-4 hover:bg-white/[0.02] transition-colors ${
                    selectedQuest?._id === quest._id ? "bg-white/[0.05]" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white text-sm line-clamp-2">{quest.title}</h3>
                    <ChevronRight className={`w-4 h-4 ${selectedQuest?._id === quest._id ? "text-[#a855f7]" : "text-[#6b7280]"}`} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
                    <span className="bg-[#1e2533] px-2 py-1 rounded">{quest.region}</span>
                    <span className="flex items-center gap-1 text-[#f59e0b]"><Award className="w-3 h-3" /> {quest.points * (quest.doublePoints ? 2 : 1)} Max Pts</span>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="text-[#10b981]">{quest.studentStatuses.filter(s => s.hasSubmitted).length} Submitted</span>
                    <span className="text-[#6b7280]">•</span>
                    <span className="text-[#9ca3af]">{quest.studentStatuses.length} Total</span>
                  </div>
                </button>
              ))}
              {quests.length === 0 && (
                <div className="p-6 text-center text-[#9ca3af]">No active quests found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Student List for Selected Quest */}
        <div className="lg:col-span-2">
          {selectedQuest ? (
            <div className="bg-[#131820] border border-white/[0.08] rounded-xl overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-white/[0.08] bg-[#1e2533]">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{selectedQuest.title}</h2>
                    <p className="text-sm text-[#9ca3af]">Max Points: {selectedQuest.points * (selectedQuest.doublePoints ? 2 : 1)}</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#131820] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#a855f7] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-sm text-[#9ca3af]">
                      <th className="p-4 font-medium">Student</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Files</th>
                      <th className="p-4 font-medium text-right">Action / Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08]">
                    {filteredStudents.map((status) => {
                      const maxPts = selectedQuest.points * (selectedQuest.doublePoints ? 2 : 1);
                      return (
                      <tr key={status.student._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#06b6d4] flex items-center justify-center text-white text-sm">
                              {status.student.avatar || "U"}
                            </div>
                            <span className="text-white font-medium">{status.student.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {!status.hasSubmitted ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1e2533] text-[#6b7280] text-xs">
                              <Clock className="w-3.5 h-3.5" /> Not Submitted
                            </span>
                          ) : status.submission?.status === "approved" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#10b981]/10 text-[#10b981] text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Graded ({status.submission.awardedPoints} pts)
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-500 text-xs w-max">
                                <UploadCloud className="w-3.5 h-3.5" /> Pending Review
                              </span>
                              {status.submission?.remark === "Late Submission" && (
                                <span className="text-[10px] text-orange-400">Late Submission</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {status.submission?.files?.map((file, idx) => (
                            <a
                              key={idx}
                              href={`http://localhost:5001${file.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#a855f7] hover:text-[#c084fc] text-xs transition-colors mb-1 mr-2"
                            >
                              <FileText className="w-3.5 h-3.5" /> {file.filename}
                            </a>
                          ))}
                        </td>
                        <td className="p-4 text-right">
                          {status.hasSubmitted && status.submission?.status === "pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <input
                                type="number"
                                placeholder={`Max: ${maxPts}`}
                                min="0"
                                max={maxPts}
                                value={pointsInput}
                                onChange={(e) => setPointsInput(e.target.value)}
                                className="w-20 bg-[#1e2533] border border-white/[0.08] rounded px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-[#a855f7]"
                              />
                              <button
                                onClick={() => handleGrade(status.submission!._id, maxPts)}
                                disabled={gradingSubmission === status.submission!._id}
                                className="px-3 py-1.5 bg-[#10b981] hover:bg-[#059669] text-white text-xs rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                              >
                                {gradingSubmission === status.submission!._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                Grade
                              </button>
                            </div>
                          ) : status.hasSubmitted && status.submission?.status === "approved" ? (
                            <span className="text-xs text-[#9ca3af]">Completed</span>
                          ) : (
                            <span className="text-xs text-[#6b7280]">-</span>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-full bg-[#131820] border border-white/[0.08] rounded-xl flex flex-col items-center justify-center p-8 text-center text-[#9ca3af]">
              <Target className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a quest from the list to view student submissions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
