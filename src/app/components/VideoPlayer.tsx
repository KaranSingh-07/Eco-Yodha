import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Play, Pause, Volume2, VolumeX, Maximize, ArrowLeft, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../services/api";
import { VideoMetadata } from "../../services/video";

export function VideoPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Custom video player states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  const token = sessionStorage.getItem('token');
  const videoSrc = `${BASE_URL}/videos/${id}?token=${token}`;

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        // We can search the list of videos to get this video's metadata
        const list: VideoMetadata[] = await api.get('/videos');
        const found = list.find((v) => v._id === id);
        if (found) {
          setVideo(found);
        } else {
          setError("Video lecture not found");
        }
      } catch (err: any) {
        console.error("Failed to load video metadata:", err);
        setError("Failed to load video metadata");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVideoDetails();
  }, [id]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => {
        console.error("Playback failed:", err);
        toast.error("Playback failed. Try again.");
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const vol = parseFloat(e.target.value);
    videoRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-[#0B0F12] flex flex-col items-center justify-center p-4 text-white">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Lecture</h2>
        <p className="text-[#9ca3af] mb-6">{error || "Could not find video details."}</p>
        <button
          onClick={() => navigate("/app/videos")}
          className="flex items-center gap-2 bg-[#1e2533] border border-white/[0.08] hover:border-white/20 px-5 py-2.5 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F12] p-4 md:p-6 lg:p-8 text-white">
      <div className="max-w-5xl mx-auto">
        
        {/* Back navigation header */}
        <button
          onClick={() => navigate("/app/videos")}
          className="flex items-center gap-2 text-[#9ca3af] hover:text-white mb-6 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Video Library
        </button>

        {/* Video Player Container */}
        <div className="bg-[#131820] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl mb-8">
          
          {/* Main Video Wrapper */}
          <div className="relative aspect-video bg-black flex items-center justify-center group/player">
            <video
              ref={videoRef}
              src={videoSrc}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
              playsInline
            />

            {/* Play/Pause center overlay (shows briefly or when paused) */}
            {!isPlaying && (
              <div 
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all scale-100 active:scale-95 shadow-lg">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>
            )}

            {/* Custom Control Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/player:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-col gap-3">
              
              {/* Progress Slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#9ca3af] min-w-[35px]">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#10b981] hover:h-1.5 transition-all"
                />
                <span className="text-xs text-[#9ca3af] min-w-[35px]">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  
                  {/* Play / Pause Toggle */}
                  <button
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 md:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Fullscreen Toggle */}
                  <button
                    onClick={toggleFullscreen}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Video Info Section */}
        <div className="bg-[#131820] border border-white/[0.08] rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="px-3 py-1 bg-[#10b981]/10 text-[#10b981] rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Lecture Session
            </span>
            <span className="text-xs text-[#6b7280]">
              Uploaded {new Date(video.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold mb-4">{video.title}</h1>
          
          <div className="h-px bg-white/[0.05] my-4" />

          <h3 className="text-sm font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">
            About This Lecture
          </h3>
          <p className="text-[#9ca3af] leading-relaxed text-sm md:text-base whitespace-pre-line">
            {video.description || "No description provided for this video lecture."}
          </p>
        </div>

      </div>
    </div>
  );
}
