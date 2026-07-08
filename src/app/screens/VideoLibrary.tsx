import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Play, Trash2, Upload, Plus, FileVideo, Sparkles, Clock, User, Loader2, X, CheckCircle, XCircle, Award } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { getVideos, deleteVideo, uploadVideo, VideoMetadata } from "../../services/video";
import { api } from "../../services/api";

const getThematicThumbnail = (title: string, videoId: string) => {
  const t = title.toLowerCase();
  const token = sessionStorage.getItem('token');
  const videoSrc = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/videos/${videoId}?token=${token}#t=0.5`;

  if (t.includes('greenhouse') || t.includes('green house')) {
    return {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
    };
  }
  if (t.includes('climate') || t.includes('global warming')) {
    return {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80'
    };
  }
  if (t.includes('carbon') || t.includes('footprint') || t.includes('emission') || t.includes('co2')) {
    return {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'
    };
  }
  if (t.includes('forest') || t.includes('deforestation') || t.includes('tree')) {
    return {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80'
    };
  }
  if (t.includes('water') || t.includes('ocean') || t.includes('pollution')) {
    return {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    };
  }

  return {
    type: 'video',
    url: videoSrc
  };
};

export function VideoLibrary() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload modal & form state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const isTeacher = user?.role === "teacher";

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await getVideos();
      setVideos(data);
    } catch (err) {
      console.error("Failed to load videos:", err);
      toast.error("Failed to load video library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Please enter a title");
    if (!file) return toast.error("Please select a video file");

    try {
      setUploading(true);
      toast.loading("Uploading video to secure storage...", { id: "upload" });
      await uploadVideo(title, description, file);
      toast.success("Video uploaded successfully!", { id: "upload" });
      
      // Reset form
      setTitle("");
      setDescription("");
      setFile(null);
      setIsUploadOpen(false);
      
      // Refresh list
      fetchVideos();
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast.error(err.message || "Failed to upload video", { id: "upload" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to play screen
    if (!confirm("Are you sure you want to delete this video? This cannot be undone.")) return;

    try {
      toast.loading("Deleting video...", { id: "delete" });
      await deleteVideo(id);
      toast.success("Video deleted successfully", { id: "delete" });
      fetchVideos();
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error(err.message || "Failed to delete video", { id: "delete" });
    }
  };

  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  // AI Quiz Interactive Modal state
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<any[] | null>(null);
  const [activeQuizTitle, setActiveQuizTitle] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleGenerateQuiz = async (video: VideoMetadata, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setGeneratingFor(video._id);
      toast.loading("AI is analyzing the video topic and generating a quiz...", { id: `gen-${video._id}` });
      
      const res = await api.post('/quiz/generate', {
        title: video.title,
        description: video.description
      });
      
      const { questions } = res;
      if (questions && questions.length > 0) {
        toast.success("AI Quiz ready! Let's start.", { id: `gen-${video._id}` });
        setActiveQuizQuestions(questions);
        setActiveQuizTitle(video.title);
        setCurrentQuestionIndex(0);
        setSelectedOptionIndex(null);
        setShowExplanation(false);
        setQuizScore(0);
        setQuizFinished(false);
      } else {
        toast.error("Failed to generate questions. Please try again.", { id: `gen-${video._id}` });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate quiz", { id: `gen-${video._id}` });
    } finally {
      setGeneratingFor(null);
    }
  };

  if (loading && videos.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0F12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F12] p-4 md:p-6 lg:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <FileVideo className="text-[#10b981] w-8 h-8" />
              Video Library
            </h1>
            <p className="text-[#9ca3af] mt-1 text-sm md:text-base">
              Learn environmental science through engaging visual lectures
            </p>
          </div>
          {isTeacher && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#10b981] to-[#06b6d4] hover:opacity-90 text-white font-medium py-3 px-5 rounded-xl transition-all shadow-lg shadow-[#10b981]/20 hover:scale-[1.02]"
            >
              <Plus className="w-5 h-5" />
              Upload Lecture
            </button>
          )}
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="bg-[#131820] border border-white/[0.08] rounded-2xl p-12 text-center max-w-lg mx-auto mt-12">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
              <FileVideo className="w-8 h-8 text-[#10b981]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Lectures Available</h3>
            <p className="text-[#9ca3af] mb-6">
              {isTeacher
                ? "Get started by uploading the first video lecture for your class!"
                : "Check back later! Your teacher hasn't uploaded any video lectures yet."}
            </p>
            {isTeacher && (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="bg-[#1e2533] border border-white/[0.08] hover:border-[#10b981]/30 hover:bg-[#10b981]/10 text-[#10b981] px-5 py-2.5 rounded-xl transition-all"
              >
                Upload Now
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                onClick={() => navigate(`/app/videos/${video._id}`)}
                className="group bg-[#131820] border border-white/[0.08] hover:border-[#10b981]/30 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] flex flex-col h-full shadow-lg"
              >
                {/* Thumbnail card with gradient & play icon on hover */}
                <div className="relative aspect-video bg-gradient-to-br from-[#1e2533] to-[#0d1218] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity z-10" />
                  
                  {/* Thematic Thumbnail Image or Video */}
                  {(() => {
                    const thumb = getThematicThumbnail(video.title, video._id);
                    if (thumb.type === 'image') {
                      return (
                        <img 
                          src={thumb.url} 
                          alt={video.title} 
                          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-all duration-300 transform group-hover:scale-105"
                        />
                      );
                    } else {
                      return (
                        <video 
                          src={thumb.url} 
                          preload="metadata" 
                          muted 
                          playsInline 
                          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-all duration-300 transform group-hover:scale-105"
                        />
                      );
                    }
                  })()}

                  {/* Subtle decorative mesh */}
                  <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 z-10" />

                  {/* Play Button Overlay */}
                  <div className="relative z-10 w-14 h-14 rounded-full bg-[#10b981] flex items-center justify-center text-white scale-90 group-hover:scale-100 opacity-80 group-hover:opacity-100 transition-all shadow-lg shadow-[#10b981]/35">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>

                  {/* Top Bar for Actions (Visible to everyone) */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                    <button
                      onClick={(e) => handleGenerateQuiz(video, e)}
                      disabled={generatingFor === video._id}
                      className="h-8 px-3 rounded-lg bg-black/60 hover:bg-[#a855f7]/80 backdrop-blur-sm flex items-center gap-1.5 text-white hover:text-white transition-all border border-[#a855f7]/30"
                      title="Take AI generated quiz for this lecture"
                    >
                      {generatingFor === video._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
                      )}
                      <span className="text-xs font-medium">AI Quiz</span>
                    </button>

                    {isTeacher && (
                      <button
                        onClick={(e) => handleDelete(video._id, e)}
                        className="w-8 h-8 rounded-lg bg-black/60 hover:bg-red-500/80 backdrop-blur-sm flex items-center justify-center text-white hover:text-white transition-all border border-white/10"
                        title="Delete Lecture"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Content type label */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] text-[#10b981] font-medium border border-[#10b981]/25 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    Lecture
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg leading-snug group-hover:text-[#10b981] transition-colors line-clamp-1 mb-2">
                      {video.title}
                    </h3>
                    <p className="text-[#9ca3af] text-sm line-clamp-2 leading-relaxed mb-4">
                      {video.description || "No description provided for this video lecture."}
                    </p>
                  </div>

                  {/* Metadata footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.05] text-xs text-[#6b7280]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{isTeacher ? "You" : "Teacher"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !uploading && setIsUploadOpen(false)} />
            
            <div className="relative w-full max-w-lg bg-[#131820] border border-white/[0.08] rounded-2xl p-6 md:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
              <button
                disabled={uploading}
                onClick={() => setIsUploadOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#1e2533] hover:bg-[#2e3748] flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Upload className="text-[#10b981] w-5 h-5" />
                Upload Video Lecture
              </h2>
              <p className="text-[#9ca3af] text-xs mb-6">
                Add a new video lesson to the grid for students to watch. Recommended format: MP4.
              </p>

              <form onSubmit={handleUploadSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">
                    Lecture Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Introduction to Renewable Energy Sources"
                    className="w-full bg-[#1e2533] border border-white/[0.08] focus:border-[#10b981]/50 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a brief summary of topics covered in this video..."
                    rows={3}
                    className="w-full bg-[#1e2533] border border-white/[0.08] focus:border-[#10b981]/50 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">
                    Video File
                  </label>
                  <div className="relative border-2 border-dashed border-white/[0.08] hover:border-[#10b981]/30 rounded-xl p-6 text-center cursor-pointer transition-colors hover:bg-white/[0.01]">
                    <input
                      type="file"
                      required
                      accept="video/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center">
                      <FileVideo className="w-10 h-10 text-[#9ca3af] mb-2 group-hover:text-white transition-colors" />
                      {file ? (
                        <div className="text-sm font-medium text-[#10b981] truncate max-w-xs">
                          {file.name} ({Math.round(file.size / (1024 * 1024))} MB)
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-semibold">Click to select video</p>
                          <p className="text-xs text-[#6b7280] mt-1">MP4, WebM, or MKV up to 500MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => setIsUploadOpen(false)}
                    className="flex-1 bg-[#1e2533] hover:bg-[#2a3447] text-white font-medium py-3 rounded-xl transition-all border border-white/[0.08]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-[#10b981] to-[#06b6d4] hover:opacity-90 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Publish
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Interactive AI Quiz Modal */}
        {activeQuizQuestions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => {
                if (window.confirm("Are you sure you want to exit the quiz? Your progress will be lost.")) {
                  setActiveQuizQuestions(null);
                }
              }} 
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-xl bg-[#131820] border-2 border-[#a855f7]/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-[#a855f7]/10 z-10 animate-in fade-in zoom-in-95 duration-200 text-white">
              {/* Close Button */}
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to exit the quiz? Your progress will be lost.")) {
                    setActiveQuizQuestions(null);
                  }
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#1e2533] hover:bg-[#2e3748] flex items-center justify-center text-white/70 hover:text-white transition-colors animate-pulse"
              >
                <X className="w-5 h-5" />
              </button>

              {!quizFinished ? (
                <>
                  {/* Quiz Progress header */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-[#a855f7]/20 text-[#c084fc] px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Generated Quiz
                    </span>
                    <span className="text-xs text-[#6b7280]">
                      Question {currentQuestionIndex + 1} of {activeQuizQuestions.length}
                    </span>
                  </div>

                  <h2 className="text-lg md:text-xl font-bold mb-2 text-white">
                    {activeQuizTitle}
                  </h2>
                  <p className="text-xs text-[#9ca3af] mb-6 border-b border-white/[0.08] pb-4">
                    Test your understanding of the lecture topic. Select the correct answer below.
                  </p>

                  {/* Question */}
                  <div className="mb-6">
                    <h3 className="text-base md:text-lg font-medium mb-4 text-[#e5e7eb]">
                      {activeQuizQuestions[currentQuestionIndex].question}
                    </h3>

                    {/* Options list */}
                    <div className="space-y-3">
                      {activeQuizQuestions[currentQuestionIndex].options.map((option: string, idx: number) => {
                        const isSelected = selectedOptionIndex === idx;
                        const isCorrect = activeQuizQuestions[currentQuestionIndex].correctAnswer === idx;
                        const showCorrectStyle = showExplanation && isCorrect;
                        const showIncorrectStyle = showExplanation && isSelected && !isCorrect;

                        let btnStyle = "border-white/[0.08] bg-[#1e2533] hover:bg-[#242d3c] hover:border-white/20";
                        let checkIcon = null;

                        if (showCorrectStyle) {
                          btnStyle = "border-[#10b981] bg-[#10b981]/15 text-[#10b981]";
                          checkIcon = <CheckCircle className="w-5 h-5 text-[#10b981] shrink-0" />;
                        } else if (showIncorrectStyle) {
                          btnStyle = "border-red-500 bg-red-500/15 text-red-400";
                          checkIcon = <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
                        } else if (isSelected && !showExplanation) {
                          btnStyle = "border-[#a855f7] bg-[#a855f7]/15 text-white";
                        }

                        return (
                          <button
                            key={idx}
                            disabled={showExplanation}
                            onClick={() => {
                              setSelectedOptionIndex(idx);
                              setShowExplanation(true);
                              if (idx === activeQuizQuestions[currentQuestionIndex].correctAnswer) {
                                setQuizScore(prev => prev + 1);
                              }
                            }}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border text-left font-medium transition-all ${btnStyle} group`}
                          >
                            <span className="text-sm md:text-base">{option}</span>
                            {checkIcon}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation panel */}
                  {showExplanation && (
                    <div className="bg-[#1e2533]/80 border border-white/[0.05] rounded-xl p-4 mb-6 text-sm animate-in fade-in slide-in-from-top-4 duration-200">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-semibold text-xs text-[#a855f7] uppercase tracking-wider">
                          Explanation:
                        </span>
                      </div>
                      <p className="text-[#d1d5db]">
                        {activeQuizQuestions[currentQuestionIndex].explanation || "No explanation provided."}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex justify-end pt-2">
                    {showExplanation && (
                      <button
                        onClick={() => {
                          if (currentQuestionIndex < activeQuizQuestions.length - 1) {
                            setCurrentQuestionIndex(prev => prev + 1);
                            setSelectedOptionIndex(null);
                            setShowExplanation(false);
                          } else {
                            setQuizFinished(true);
                          }
                        }}
                        className="bg-gradient-to-r from-[#a855f7] to-[#ec4899] hover:opacity-90 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#a855f7]/20 flex items-center gap-2"
                      >
                        {currentQuestionIndex < activeQuizQuestions.length - 1 ? "Next Question" : "See Results"}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* Completion screen */
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#a855f7]/30">
                    <Award className="w-10 h-10 text-white animate-bounce" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
                  <p className="text-[#9ca3af] mb-6">
                    You've finished the AI-generated quiz for <br/><strong>{activeQuizTitle}</strong>
                  </p>
                  
                  {/* Score display */}
                  <div className="inline-block bg-[#1e2533] border border-white/[0.08] rounded-2xl px-8 py-4 mb-8">
                    <span className="block text-xs uppercase tracking-wider text-[#6b7280] font-semibold mb-1">
                      Your Score
                    </span>
                    <span className="text-4xl font-extrabold text-[#10b981]">
                      {quizScore} <span className="text-2xl text-white/40">/ {activeQuizQuestions.length}</span>
                    </span>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setActiveQuizQuestions(null)}
                    className="w-full bg-[#1e2533] hover:bg-[#2a3447] text-white font-medium py-3 rounded-xl transition-all border border-white/[0.08]"
                  >
                    Back to Library
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
