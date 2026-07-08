import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Play, Pause, Volume2, Maximize, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../services/api";

interface SubtopicData {
  _id: string;
  title: string;
  description: string;
  type: string;
  videoUrl?: string;
  module: string;
}

export function VideoLecture() {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const [subtopic, setSubtopic] = useState<SubtopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completing, setCompleting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchSubtopic = async () => {
      try {
        const data = await api.get(`/modules/subtopics/${nodeId}`);
        setSubtopic(data);
      } catch (err) {
        console.error("Failed to fetch subtopic:", err);
        toast.error("Failed to load video lecture");
      } finally {
        setLoading(false);
      }
    };
    if (nodeId) fetchSubtopic();
  }, [nodeId]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(currentProgress || 0);
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await api.put(`/modules/subtopics/${nodeId}/complete`);
      toast.success("Topic completed!");
      
      // Navigate back to the subtopic map to proceed
      if (subtopic?.module) {
        navigate(`/app/module/${subtopic.module}`);
      } else {
        navigate("/app/learning-map");
      }
    } catch (err) {
      console.error("Failed to complete topic:", err);
      toast.error("Failed to mark as complete");
    } finally {
      setCompleting(false);
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
    <div className="min-h-screen bg-[#0B0F12] p-8">
      <div className="max-w-5xl mx-auto">
        <Link to={`/app/module/${subtopic?.module}`} className="inline-flex items-center text-[#9ca3af] hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Subtopics
        </Link>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl text-white">{subtopic?.title || "Video Lecture"}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
            <div className="bg-[#131820] border border-white/[0.08] rounded-2xl overflow-hidden">
              {subtopic?.videoUrl ? (
                <video
                  ref={videoRef}
                  onTimeUpdate={handleTimeUpdate}
                  src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/videos/${subtopic.videoUrl}?token=${sessionStorage.getItem('token')}`}
                  controls
                  className="w-full aspect-video object-contain bg-black"
                />
              ) : (
                <>
                  <div className="relative aspect-video bg-gradient-to-br from-[#1e2533] to-[#131820] flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#06b6d4]/10 via-transparent to-[#10b981]/10" />
                    <button onClick={() => setIsPlaying(!isPlaying)} className="relative z-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
                      {isPlaying ? <Pause className="w-10 h-10 text-white" /> : <Play className="w-10 h-10 text-white ml-1" />}
                    </button>
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <p className="text-sm text-white">Video Lecture</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-[#131820] border border-white/[0.08] rounded-2xl p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-white mb-3">About This Topic</h2>
                  <p className="text-[#9ca3af] mb-4">{subtopic?.description || "Learn about environmental concepts."}</p>
                </div>
                <button 
                  onClick={handleComplete}
                  disabled={completing}
                  className="px-6 py-3 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  {completing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Complete Topic & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
