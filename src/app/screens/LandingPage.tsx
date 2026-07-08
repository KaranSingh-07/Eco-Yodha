import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Leaf, Sparkles, Users, GraduationCap, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

type UserRole = "student" | "teacher";

export function LandingPage() {
  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [school, setSchool] = useState("");
  const [classroomCode, setClassroomCode] = useState("");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "teacher") {
        navigate("/app/teacher", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const data: any = {
          name,
          email,
          password,
          role,
        };
        if (role === "student") {
          if (!classroomCode) {
            toast.error("Classroom code is required for students");
            setLoading(false);
            return;
          }
          data.school = school;
          data.classroomCode = classroomCode;
        } else {
          if (!grade || !section) {
            toast.error("Grade and Division (Section) are required for teachers");
            setLoading(false);
            return;
          }
          data.institutionName = institutionName;
          data.grade = grade;
          data.section = section;
        }
        const res = await register(data);
        if (res && res.requiresVerification) {
          toast.success(res.message || "You will be able to sign in once the teacher verifies you");
          setIsSignUp(false); // Switch to sign in tab
          setName("");
          setSchool("");
          setClassroomCode("");
          setLoading(false);
          return;
        }
        toast.success("Account created successfully!");
      } else {
        await login(email, password);
        toast.success("Welcome back!");
      }

      if (role === "teacher") {
        navigate("/app/teacher");
      } else {
        navigate("/app");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F12] dark flex flex-col lg:flex-row">
      {/* Left Side - Hero */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 md:px-12 md:py-10 lg:px-16 lg:py-12">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-[#10b981]/25">
              <Leaf className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl text-white">Eco-Yodha</h1>
              <p className="text-sm md:text-lg text-[#6b7280]">Prakriti</p>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl text-white mb-4 md:mb-6 leading-tight">
            Transform Into An
            <br />
            <span className="bg-gradient-to-r from-[#10b981] via-[#06b6d4] to-[#a855f7] bg-clip-text text-transparent">
              Environmental Champion
            </span>
          </h2>

          <p className="text-sm md:text-base lg:text-lg text-[#9ca3af] mb-6 md:mb-8 leading-relaxed">
            Join the gamified environmental education revolution. Learn through
            interactive quests, earn eco-points, and compete with peers while
            making a real impact on our planet.
          </p>

          <div className="relative hidden md:block">
            <div className="w-full h-48 md:h-56 lg:h-64 rounded-2xl bg-gradient-to-br from-[#131820] to-[#1e2533] border border-white/[0.08] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 via-transparent to-[#06b6d4]/10" />
              <div className="relative z-10 text-center">
                <Sparkles className="w-16 h-16 text-[#10b981] mx-auto mb-4" />
                <p className="text-[#9ca3af]">Your Digital Companion Avatar</p>
                <p className="text-sm text-[#6b7280]">Evolves as you progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 md:px-12 md:py-10 lg:px-16 lg:py-12 bg-[#131820] border-t lg:border-t-0 lg:border-l border-white/[0.08]">
        <div className="w-full max-w-md">
          <h2 className="text-2xl md:text-3xl text-white mb-6 md:mb-8">
            {isSignUp ? "Create Account" : "Get Started"}
          </h2>

          {/* Role Selector */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setRole("student")}
              className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                role === "student"
                  ? "bg-[#10b981]/10 border-[#10b981] text-[#10b981]"
                  : "border-white/[0.08] text-[#9ca3af] hover:border-white/[0.15]"
              }`}
            >
              <Users className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Student</span>
            </button>
            <button
              onClick={() => setRole("teacher")}
              className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                role === "teacher"
                  ? "bg-[#a855f7]/10 border-[#a855f7] text-[#a855f7]"
                  : "border-white/[0.08] text-[#9ca3af] hover:border-white/[0.15]"
              }`}
            >
              <GraduationCap className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Teacher/Institution</span>
            </button>
          </div>

          {/* Forms */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full bg-[#1e2533] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">
                {role === "teacher" ? "Institution Email" : "Email Address"}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === "student" ? "student@school.edu" : "teacher@institution.edu"
                }
                required
                className="w-full bg-[#1e2533] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
              />
            </div>

            {isSignUp && role === "teacher" && (
              <>
                <div>
                  <label className="block text-sm text-[#9ca3af] mb-2">Institution Name</label>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="School/College Name"
                    required
                    className="w-full bg-[#1e2533] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#a855f7]/50"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-[#9ca3af] mb-2">Classroom (Grade)</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      required
                      className="w-full bg-[#1e2533] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#a855f7]/50"
                    >
                      <option value="">Select Grade</option>
                      {["5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"].map((g) => (
                        <option key={g} value={g}>{g} Grade</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-[#9ca3af] mb-2">Division (Section)</label>
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      required
                      className="w-full bg-[#1e2533] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#a855f7]/50"
                    >
                      <option value="">Select Section</option>
                      {["A", "B", "C", "D", "E"].map((s) => (
                        <option key={s} value={s}>Section {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {isSignUp && role === "student" && (
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">School Name</label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Green Valley High School"
                  required
                  className="w-full bg-[#1e2533] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-[#1e2533] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
              />
            </div>

            {isSignUp && role === "student" && (
              <div>
                <label className="block text-sm text-[#9ca3af] mb-2">
                  Classroom Code
                </label>
                <input
                  type="text"
                  value={classroomCode}
                  onChange={(e) => setClassroomCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  className="w-full bg-[#1e2533] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-[#6b7280] text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                />
                <p className="text-xs text-[#6b7280] mt-2">
                  Entering a code places you in your teacher's verification queue.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${
                role === "student"
                  ? "bg-gradient-to-r from-[#10b981] to-[#06b6d4] hover:shadow-[#10b981]/25"
                  : "bg-gradient-to-r from-[#a855f7] to-[#ec4899] hover:shadow-[#a855f7]/25"
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading
                ? "Please wait..."
                : isSignUp
                ? "Create Account"
                : role === "student"
                ? "Start Learning"
                : "Access Portal"}
            </button>

            <p className="text-center text-sm text-[#6b7280]">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#10b981] hover:underline"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
