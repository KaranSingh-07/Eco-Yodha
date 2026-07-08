import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, CheckCircle2, XCircle, TrendingUp, Award, Calendar, School, BookOpen, Mail, Phone, MapPin, GraduationCap, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

interface PendingStudent {
  _id: string;
  name: string;
  email: string;
  quest: { title: string };
  files: Array<{ url: string; filename: string }>;
  createdAt: string;
}

interface StudentPerformance {
  _id: string;
  name: string;
  level: number;
  ecoPoints: number;
  grade: string;
  carbonScore: number;
  waterScore: number;
  soilScore: number;
  avatar: string;
}

interface TeacherStats {
  totalStudents: number;
  pendingApprovals: number;
  avgLevel: number;
  avgPoints: number;
  activeClasses: number;
  classroomNames: string[];
}

const gradeColors: Record<string, { bg: string; text: string }> = {
  A: { bg: "bg-[#10b981]/10", text: "text-[#10b981]" },
  "A-": { bg: "bg-[#10b981]/10", text: "text-[#10b981]" },
  "B+": { bg: "bg-[#06b6d4]/10", text: "text-[#06b6d4]" },
  B: { bg: "bg-[#06b6d4]/10", text: "text-[#06b6d4]" },
  C: { bg: "bg-[#f59e0b]/10", text: "text-[#f59e0b]" },
};

export function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [pending, setPending] = useState<PendingStudent[]>([]);
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [roster, setRoster] = useState<StudentPerformance[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, rosterData, analyticsData, pendingStudentsData] = await Promise.all([
          api.get("/teacher/stats"),
          api.get("/teacher/roster"),
          api.get("/teacher/analytics"),
          api.get("/teacher/pending-students"),
        ]);
        setStats(statsData);
        setRoster(rosterData);
        setAnalytics(analyticsData);
        setPendingStudents(pendingStudentsData);
      } catch (err) {
        console.error("Failed to fetch teacher data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/quests/submissions/${id}/verify`, { status: "approved", teacherComment: "Approved" });
      setPending((prev) => prev.filter((s) => s._id !== id));
      toast.success("Submission approved!");
    } catch (err) {
      toast.error("Failed to approve");
    }
  };

  const handleDeny = async (id: string) => {
    try {
      await api.put(`/quests/submissions/${id}/verify`, { status: "rejected", teacherComment: "Denied" });
      setPending((prev) => prev.filter((s) => s._id !== id));
      toast.info("Submission denied");
    } catch (err) {
      toast.error("Failed to deny");
    }
  };

  const handleApproveStudent = async (id: string) => {
    try {
      await api.put(`/teacher/verify/${id}`, { action: "approve" });
      setPendingStudents((prev) => prev.filter((s) => s._id !== id));
      const [statsData, rosterData] = await Promise.all([
        api.get("/teacher/stats"),
        api.get("/teacher/roster"),
      ]);
      setStats(statsData);
      setRoster(rosterData);
      toast.success("Student approved into classroom!");
    } catch (err) {
      toast.error("Failed to approve student");
    }
  };

  const handleDenyStudent = async (id: string) => {
    try {
      await api.put(`/teacher/verify/${id}`, { action: "deny" });
      setPendingStudents((prev) => prev.filter((s) => s._id !== id));
      const statsData = await api.get("/teacher/stats");
      setStats(statsData);
      toast.info("Student verification denied");
    } catch (err) {
      toast.error("Failed to deny student");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F12] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Teacher Profile Header */}
        <div className="mb-6 lg:mb-8 bg-gradient-to-br from-[#131820] to-[#1e2533] border border-white/[0.08] rounded-2xl p-4 md:p-6">
          <div className="flex flex-col lg:flex-row items-start gap-4 lg:justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center text-white text-2xl md:text-3xl shadow-lg shadow-[#a855f7]/25">
                  {user?.avatar || "T"}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#06b6d4] border-4 border-[#0B0F12] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-xl md:text-2xl lg:text-3xl text-white truncate">{user?.name || "Teacher"}</h1>
                  <span className="px-2 md:px-3 py-1 bg-[#a855f7]/10 text-[#a855f7] text-xs md:text-sm rounded-lg border border-[#a855f7]/30 w-fit">Teacher</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-2 text-xs md:text-sm text-[#9ca3af]">
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#a855f7]" /><span>{user?.email}</span></div>
                  {user?.institutionName && (
                    <div className="flex items-center gap-2"><School className="w-4 h-4 text-[#10b981]" /><span>{user.institutionName}</span></div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="bg-[#1e2533] rounded-xl p-3 md:p-4 flex-1 lg:min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-[#10b981]" />
                  <span className="text-xs text-[#9ca3af]">Your Classrooms & Codes</span>
                </div>
                <div className="flex flex-col gap-2">
                  {user?.classrooms && user.classrooms.length > 0 ? (
                    user.classrooms.map((c: any) => (
                      <div key={c._id || c.code} className="flex items-center justify-between gap-3 bg-[#131820] px-3 py-1.5 rounded-lg border border-white/[0.05]">
                        <span className="text-xs text-white font-medium">{c.name}</span>
                        <span 
                          onClick={() => {
                            navigator.clipboard.writeText(c.code);
                            toast.success("Code copied to clipboard!");
                          }}
                          className="px-2 py-0.5 bg-[#a855f7]/10 text-[#a855f7] font-mono text-xs rounded border border-[#a855f7]/30 cursor-pointer hover:bg-[#a855f7]/20 transition-all"
                          title="Click to copy code"
                        >
                          {c.code}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-[#6b7280]">No classrooms yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-gradient-to-br from-[#131820] to-[#1e2533] border border-white/[0.08] rounded-2xl p-6 hover:border-[#10b981]/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center"><Users className="w-6 h-6 text-[#10b981]" /></div>
              <div className="flex-1"><p className="text-sm text-[#9ca3af]">Total Students</p><p className="text-2xl text-white">{stats?.totalStudents || 0}</p></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#131820] to-[#1e2533] border border-white/[0.08] rounded-2xl p-6 hover:border-[#a855f7]/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 flex items-center justify-center"><Calendar className="w-6 h-6 text-[#a855f7]" /></div>
              <div className="flex-1"><p className="text-sm text-[#9ca3af]">Pending Approvals</p><p className="text-2xl text-white">{stats?.pendingApprovals || 0}</p></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#131820] to-[#1e2533] border border-white/[0.08] rounded-2xl p-6 hover:border-[#06b6d4]/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-[#06b6d4]" /></div>
              <div className="flex-1"><p className="text-sm text-[#9ca3af]">Avg. Level</p><p className="text-2xl text-white">{stats?.avgLevel || "0.0"}</p></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#131820] to-[#1e2533] border border-white/[0.08] rounded-2xl p-6 hover:border-[#f59e0b]/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center"><Award className="w-6 h-6 text-[#f59e0b]" /></div>
              <div className="flex-1"><p className="text-sm text-[#9ca3af]">Avg. Points</p><p className="text-2xl text-white">{stats?.avgPoints || 0}</p></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#131820] to-[#1e2533] border border-white/[0.08] rounded-2xl p-6 hover:border-[#10b981]/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center"><BookOpen className="w-6 h-6 text-[#10b981]" /></div>
              <div className="flex-1"><p className="text-sm text-[#9ca3af]">Active Classes</p><p className="text-2xl text-white">{stats?.activeClasses || 0}</p></div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 lg:mb-8">
            <div className="bg-[#131820] border border-white/[0.08] rounded-2xl p-6">
              <h2 className="text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#06b6d4]" /> Eco-Points Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.distribution}>
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: '#1e2533'}} contentStyle={{backgroundColor: '#0B0F12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff'}} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {analytics.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#10b981', '#06b6d4', '#a855f7'][index % 3]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#131820] border border-white/[0.08] rounded-2xl p-6">
              <h2 className="text-white mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-[#a855f7]" /> Average Scores by Category</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.avgScores} layout="vertical">
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} width={120} />
                    <Tooltip cursor={{fill: '#1e2533'}} contentStyle={{backgroundColor: '#0B0F12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff'}} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {analytics.avgScores.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#f59e0b', '#3b82f6', '#ec4899'][index % 3]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Pending Student Verification Requests */}
        {pendingStudents && pendingStudents.length > 0 && (
          <div className="mb-6 lg:mb-8 bg-[#131820] border border-yellow-500/20 rounded-2xl p-6">
            <h2 className="text-white mb-4 flex items-center gap-2 text-yellow-500">
              <Users className="w-5 h-5" /> Pending Student Verification Requests
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left text-sm text-[#9ca3af] p-3">Student Name</th>
                    <th className="text-left text-sm text-[#9ca3af] p-3">Email</th>
                    <th className="text-left text-sm text-[#9ca3af] p-3">School</th>
                    <th className="text-left text-sm text-[#9ca3af] p-3">Grade/Section</th>
                    <th className="text-right text-sm text-[#9ca3af] p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingStudents.map((student) => (
                    <tr key={student._id} className="border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors">
                      <td className="p-3">
                        <span className="text-white font-medium">{student.name}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-[#9ca3af]">{student.email}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-[#9ca3af]">{student.school}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-[#9ca3af]">Grade {student.grade} {student.section && `- Section ${student.section}`}</span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApproveStudent(student._id)}
                            className="px-3 py-1 bg-[#10b981]/15 text-[#10b981] hover:bg-[#10b981]/30 transition-all rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleDenyStudent(student._id)}
                            className="px-3 py-1 bg-[#ef4444]/15 text-[#ef4444] hover:bg-[#ef4444]/30 transition-all rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Deny
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Student Performance Roster */}
        <div className="bg-[#131820] border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-[#10b981]" /> Student Performance Roster</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left text-sm text-[#9ca3af] p-3">Student</th>
                  <th className="text-left text-sm text-[#9ca3af] p-3">Level</th>
                  <th className="text-left text-sm text-[#9ca3af] p-3">Total Points</th>
                  <th className="text-left text-sm text-[#9ca3af] p-3"><div className="flex items-center gap-2">Carbon<div className="w-3 h-3 rounded-full bg-[#10b981]" /></div></th>
                  <th className="text-left text-sm text-[#9ca3af] p-3"><div className="flex items-center gap-2">Water<div className="w-3 h-3 rounded-full bg-[#06b6d4]" /></div></th>
                  <th className="text-left text-sm text-[#9ca3af] p-3"><div className="flex items-center gap-2">Soil<div className="w-3 h-3 rounded-full bg-[#e07856]" /></div></th>
                  <th className="text-left text-sm text-[#9ca3af] p-3">Grade</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((student) => {
                  const gradeStyle = gradeColors[student.grade] || gradeColors.B;
                  return (
                    <tr key={student._id} className="border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center text-white text-sm">{student.avatar}</div>
                          <span className="text-white">{student.name}</span>
                        </div>
                      </td>
                      <td className="p-3"><div className="w-8 h-8 rounded-lg bg-[#1e2533] flex items-center justify-center text-[#9ca3af] text-sm">{student.level}</div></td>
                      <td className="p-3"><span className="text-white">{student.ecoPoints}</span></td>
                      <td className="p-3"><span className="text-[#10b981]">{student.carbonScore}</span></td>
                      <td className="p-3"><span className="text-[#06b6d4]">{student.waterScore}</span></td>
                      <td className="p-3"><span className="text-[#e07856]">{student.soilScore}</span></td>
                      <td className="p-3"><div className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg ${gradeStyle.bg} ${gradeStyle.text}`}>{student.grade}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
