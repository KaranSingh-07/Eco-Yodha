import { Link, useLocation } from "react-router";
import { Home, Map, Trophy, Target, GraduationCap, Leaf, Menu, X, LogOut, Video } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { path: "/app", icon: Home, label: "Dashboard" },
  { path: "/app/learning-map", icon: Map, label: "Learning Map" },
  { path: "/app/tasks", icon: Target, label: "Quests" },
  { path: "/app/leaderboard", icon: Trophy, label: "Leaderboard" },
  { path: "/app/videos", icon: Video, label: "Video Library" },
  { path: "/app/teacher", icon: GraduationCap, label: "Teacher Portal" },
  { path: "/app/teacher/quests", icon: Target, label: "Quests Grading" },
];

export function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (user?.role === "teacher") {
      return (
        item.path === "/app/teacher" ||
        item.path === "/app/videos" ||
        item.path === "/app/teacher/quests" ||
        item.path === "/app/leaderboard"
      );
    }
    return item.path !== "/app/teacher" && item.path !== "/app/teacher/quests";
  });

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0B0F12] border-b border-white/[0.08] flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#06b6d4] flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg text-white">Eco-Yodha</h1>
            <p className="text-xs text-[#6b7280]">Prakriti</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg bg-[#131820] flex items-center justify-center text-white hover:bg-[#1e2533] transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#0B0F12] border-r border-white/[0.08] flex flex-col z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Desktop Logo */}
        <div className="hidden lg:flex p-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#06b6d4] flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl text-white">Eco-Yodha</h1>
              <p className="text-xs text-[#6b7280]">Prakriti</p>
            </div>
          </div>
        </div>

        {/* Mobile top padding */}
        <div className="lg:hidden h-16" />

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#10b981]/10 text-[#10b981]"
                    : "text-[#9ca3af] hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/[0.08]">
          <div className="bg-[#131820] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#10b981] to-[#06b6d4] flex items-center justify-center text-white text-sm">
                  {user?.avatar || "U"}
                </div>
                {user?.role === "student" && user?.level && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-gradient-to-br from-[#a855f7] to-[#ec4899] border-2 border-[#0B0F12] flex items-center justify-center text-[10px] text-white">
                    {user.level}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{user?.name || "Guest"}</p>
                <p className="text-xs text-[#6b7280]">{user?.institutionName || user?.school || user?.role || "Student"}</p>
              </div>
            </div>
            {user?.role === "student" && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#6b7280]">Level Progress</span>
                  <span className="text-[#10b981]">{user?.xp ? Math.min(100, (user.xp % 100)) : 0}%</span>
                </div>
                <div className="h-2 bg-[#1e2533] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-full transition-all"
                    style={{ width: `${user?.xp ? Math.min(100, (user.xp % 100)) : 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-[#6b7280]">Total Points</span>
                  <span className="text-xs text-white">{user?.xp || 0}</span>
                </div>
              </div>
            )}
            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="w-full mt-3 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
