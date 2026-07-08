import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Lock, CheckCircle2, BookOpen, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { api } from "../../services/api";

interface ModuleNode {
  _id: string;
  title: string;
  status: "locked" | "active" | "completed";
  position: number;
  category: "soil" | "water" | "carbon" | "other";
}

export function LearningMap() {
  const [modules, setModules] = useState<ModuleNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await api.get("/modules");
        setModules(data);
      } catch (err) {
        console.error("Failed to fetch modules:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F12] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl text-white mb-2">Learning Path</h1>
          <p className="text-[#9ca3af]">Progress through environmental chapters at your own pace</p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[#1e2533] -translate-x-1/2" />
          <motion.div 
            className="absolute left-1/2 top-0 w-1 bg-gradient-to-b from-[#10b981] to-[#06b6d4] -translate-x-1/2"
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(0, (modules.filter(m => m.status === 'completed').length / modules.length) * 100)}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          <div className="space-y-8 relative z-10">
            {modules.map((node, index) => (
              <ModuleNodeCard key={node._id} node={node} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryConfig(category: string) {
  switch (category) {
    case 'soil': return { label: '🌱 Soil Module', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    case 'water': return { label: '💧 Water Module', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    case 'carbon': return { label: '☁️ Carbon Module', color: 'text-gray-400', bg: 'bg-gray-400/10' };
    default: return { label: '🌟 Miscellaneous', color: 'text-purple-500', bg: 'bg-purple-500/10' };
  }
}

function ModuleNodeCard({ node, index }: { node: ModuleNode; index: number }) {
  const isLeft = index % 2 === 0;

  const color = "#10b981";
  const bgColor = "from-[#10b981] to-[#059669]";
  const catConfig = getCategoryConfig(node.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-center ${isLeft ? "justify-start" : "justify-end"}`}
    >
      <div className={`w-[45%] ${isLeft ? "pr-12" : "pl-12"}`}>
        {node.status === "locked" ? (
          <div className="bg-[#131820] border border-white/[0.08] rounded-xl p-6 opacity-50 relative overflow-hidden">
            <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded-md bg-[#1e2533] text-[#6b7280]">
              {catConfig.label.split(' ')[0]} Locked
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1e2533] flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-[#6b7280]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white mb-1">{node.title}</h3>
                <p className="text-sm text-[#6b7280]">Complete previous chapters to unlock</p>
              </div>
            </div>
          </div>
        ) : node.status === "active" ? (
          <Link to={`/app/module/${node._id}`}>
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 20px ${color}40`,
                  `0 0 40px ${color}60`,
                  `0 0 20px ${color}40`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative bg-[#131820] border-2 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer overflow-hidden"
              style={{ borderColor: color }}
            >
              <div className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-md ${catConfig.bg} ${catConfig.color}`}>
                {catConfig.label}
              </div>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bgColor} flex items-center justify-center flex-shrink-0 shadow-lg mt-2`} style={{ boxShadow: `0 4px 20px ${color}40` }}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white">{node.title}</h3>
                    <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                  </div>
                  <p className="text-sm text-[#9ca3af]">Enter Chapter</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ) : (
          <Link to={`/app/module/${node._id}`}>
            <div className="bg-[#131820] border border-[#10b981]/30 rounded-xl p-6 hover:border-[#10b981]/60 transition-colors cursor-pointer relative overflow-hidden">
              <div className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-md ${catConfig.bg} ${catConfig.color} opacity-70`}>
                {catConfig.label}
              </div>
              <div className="flex items-start gap-4 mt-2">
                <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white mb-1">{node.title}</h3>
                  <p className="text-sm text-[#10b981]">Completed - Review</p>
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 z-10">
        <div className={`w-6 h-6 rounded-full border-4 border-[#0B0F12] ${node.status === "completed" ? "bg-[#10b981]" : node.status === "active" ? `bg-gradient-to-br ${bgColor}` : "bg-[#1e2533]"}`} />
      </div>
    </motion.div>
  );
}
