import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { Lock, CheckCircle2, Play, FileQuestion, Target, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { api } from "../../services/api";

interface SubtopicNode {
  _id: string;
  title: string;
  type: "video" | "mini-quiz" | "mega-quiz";
  status: "locked" | "active" | "completed";
  position: number;
}

export function SubtopicMap() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [subtopics, setSubtopics] = useState<SubtopicNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleTitle, setModuleTitle] = useState("");
  const [linkedQuest, setLinkedQuest] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modRes, subRes, questRes] = await Promise.all([
          api.get(`/modules/${moduleId}`),
          api.get(`/modules/${moduleId}/subtopics`),
          api.get(`/quests`)
        ]);
        setModuleTitle(modRes.title);
        setSubtopics(subRes);
        
        const q = questRes.find((q: any) => q.module === moduleId);
        if (q) setLinkedQuest(q);
      } catch (err) {
        console.error("Failed to fetch subtopics:", err);
      } finally {
        setLoading(false);
      }
    };
    if (moduleId) fetchData();
  }, [moduleId]);

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
        <Link to="/app/learning-map" className="inline-flex items-center text-[#9ca3af] hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Chapters
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl text-white mb-2">{moduleTitle || "Chapter Subtopics"}</h1>
          <p className="text-[#9ca3af]">Complete topics and quizzes to unlock the next chapter</p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[#1e2533] -translate-x-1/2" />
          <motion.div 
            className="absolute left-1/2 top-0 w-1 bg-gradient-to-b from-[#10b981] to-[#06b6d4] -translate-x-1/2"
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(0, (subtopics.filter(s => s.status === 'completed').length / (subtopics.length || 1)) * 100)}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          <div className="space-y-8 relative z-10">
            {subtopics.map((node, index) => (
              <SubtopicNodeCard key={node._id} node={node} index={index} />
            ))}
            
            {linkedQuest && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: subtopics.length * 0.1 }}
                className={`flex items-center ${subtopics.length % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div className={`w-[45%] ${subtopics.length % 2 === 0 ? "pr-12" : "pl-12"}`}>
                  {linkedQuest.status === "locked" ? (
                    <div className="bg-[#131820] border border-white/[0.08] rounded-xl p-6 opacity-50">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#1e2533] flex items-center justify-center flex-shrink-0">
                          <Lock className="w-6 h-6 text-[#6b7280]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white mb-1">Community Task: {linkedQuest.title}</h3>
                          <p className="text-sm text-[#6b7280]">Complete previous steps to unlock</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link to="/app/tasks">
                      <motion.div
                        animate={{ boxShadow: [`0 0 20px #a855f740`, `0 0 40px #a855f760`, `0 0 20px #a855f740`] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="relative bg-[#131820] border-2 border-[#a855f7] rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white">Community Task: {linkedQuest.title}</h3>
                              <div className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
                            </div>
                            <p className="text-sm text-[#9ca3af]">Ready to start</p>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  )}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                  <div className={`w-6 h-6 rounded-full border-4 border-[#0B0F12] ${linkedQuest.status === "locked" ? "bg-[#1e2533]" : "bg-gradient-to-br from-[#a855f7] to-[#ec4899]"}`} />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubtopicNodeCard({ node, index }: { node: SubtopicNode; index: number }) {
  const isLeft = index % 2 === 0;

  const icons: Record<string, any> = {
    video: Play,
    "mini-quiz": FileQuestion,
    "mega-quiz": Target,
  };
  const Icon = icons[node.type] || Play;

  const colors: Record<string, string> = {
    video: "#10b981",
    "mini-quiz": "#06b6d4",
    "mega-quiz": "#a855f7",
  };

  const bgColors: Record<string, string> = {
    video: "from-[#10b981] to-[#059669]",
    "mini-quiz": "from-[#06b6d4] to-[#0891b2]",
    "mega-quiz": "from-[#a855f7] to-[#9333ea]",
  };

  const color = colors[node.type] || "#10b981";
  const bgColor = bgColors[node.type] || "from-[#10b981] to-[#059669]";

  const routePath = node.type === "video" ? `/app/lecture/${node._id}` : `/app/quiz/${node._id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-center ${isLeft ? "justify-start" : "justify-end"}`}
    >
      <div className={`w-[45%] ${isLeft ? "pr-12" : "pl-12"}`}>
        {node.status === "locked" ? (
          <div className="bg-[#131820] border border-white/[0.08] rounded-xl p-6 opacity-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1e2533] flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-[#6b7280]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white mb-1">{node.title}</h3>
                <p className="text-sm text-[#6b7280]">Complete previous steps</p>
              </div>
            </div>
          </div>
        ) : node.status === "active" ? (
          <Link to={routePath}>
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 20px ${color}40`,
                  `0 0 40px ${color}60`,
                  `0 0 20px ${color}40`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative bg-[#131820] border-2 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer"
              style={{ borderColor: color }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bgColor} flex items-center justify-center flex-shrink-0 shadow-lg`} style={{ boxShadow: `0 4px 20px ${color}40` }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white">{node.title}</h3>
                    <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                  </div>
                  <p className="text-sm text-[#9ca3af]">Ready to start</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ) : (
          <Link to={routePath}>
            <div className="bg-[#131820] border border-[#10b981]/30 rounded-xl p-6 hover:border-[#10b981]/60 transition-colors cursor-pointer relative overflow-hidden">
              <div className="flex items-start gap-4">
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
