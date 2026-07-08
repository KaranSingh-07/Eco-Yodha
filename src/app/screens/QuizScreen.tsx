import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { CheckCircle2, XCircle, Sparkles, Loader2, Target, ArrowLeft, Clock, History, Play, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../services/api";
import confetti from "canvas-confetti";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface SubtopicData {
  _id: string;
  title: string;
  type: string;
  module: string;
  quizRef?: {
    questions: Question[];
  };
}

interface Attempt {
  _id: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  createdAt: string;
  isFirstAttempt: boolean;
}

type QuizState = "loading" | "intro" | "history" | "playing" | "finished";

export function QuizScreen() {
  const { subtopicId } = useParams<{ subtopicId: string }>();
  const navigate = useNavigate();
  
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [subtopic, setSubtopic] = useState<SubtopicData | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  
  // Quiz Playing State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  
  // Timer State
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  
  const [submitting, setSubmitting] = useState(false);

  // Restore or Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, attemptsRes] = await Promise.all([
          api.get(`/modules/subtopics/${subtopicId}`),
          api.get(`/modules/subtopics/${subtopicId}/attempts`)
        ]);
        setSubtopic(quizRes);
        setAttempts(attemptsRes);
        
        // Check for saved session
        const savedSession = sessionStorage.getItem(`quiz_${subtopicId}`);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          setCurrentQuestion(parsed.currentQuestion);
          setAnswers(parsed.answers);
          setAnsweredQuestions(new Set(parsed.answeredQuestions));
          setScore(parsed.score);
          setStartTime(parsed.startTime);
          setQuizState("playing");
          toast.info("Restored your quiz progress!");
        } else {
          setQuizState("intro");
        }
      } catch (err) {
        console.error("Failed to fetch quiz data:", err);
        toast.error("Failed to load quiz");
      }
    };
    if (subtopicId) fetchData();
  }, [subtopicId]);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (quizState === "playing" && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizState, startTime]);

  // Leave Warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (quizState === "playing") {
        e.preventDefault();
        e.returnValue = "Are you sure you want to leave? Your progress will be reset.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [quizState]);

  const saveProgress = (newState: any) => {
    sessionStorage.setItem(`quiz_${subtopicId}`, JSON.stringify({
      ...newState,
      answeredQuestions: Array.from(newState.answeredQuestions || answeredQuestions)
    }));
  };

  const handleStart = () => {
    setQuizState("playing");
    setStartTime(Date.now());
    setElapsed(0);
    setCurrentQuestion(0);
    setAnswers([]);
    setAnsweredQuestions(new Set());
    setScore(0);
    saveProgress({ currentQuestion: 0, answers: [], answeredQuestions: new Set(), score: 0, startTime: Date.now() });
  };

  const handleLeave = () => {
    if (quizState === "playing") {
      const confirm = window.confirm("Are you sure you want to leave? Your progress will be reset.");
      if (!confirm) return;
    }
    sessionStorage.removeItem(`quiz_${subtopicId}`);
    if (subtopic?.module) navigate(`/app/module/${subtopic.module}`);
    else navigate("/app/learning-map");
  };

  const questions = subtopic?.quizRef?.questions || [];
  const currentQ = questions[currentQuestion];

  const handleAnswerSelect = (index: number) => {
    if (answeredQuestions.has(currentQuestion)) return;
    setSelectedAnswer(index);

    setTimeout(() => {
      const isCorrect = index === currentQ.correctAnswer;
      const newScore = score + (isCorrect ? 1 : 0);
      const newAnswers = [...answers, index];
      const newAnsweredSet = new Set(answeredQuestions).add(currentQuestion);
      
      if (isCorrect) toast.success("Correct! Great job.");
      else toast.error("Incorrect. Better luck next time!");

      setScore(newScore);
      setAnswers(newAnswers);
      setAnsweredQuestions(newAnsweredSet);
      saveProgress({ currentQuestion, answers: newAnswers, answeredQuestions: newAnsweredSet, score: newScore, startTime });

      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          const nextQ = currentQuestion + 1;
          setCurrentQuestion(nextQ);
          setSelectedAnswer(null);
          saveProgress({ currentQuestion: nextQ, answers: newAnswers, answeredQuestions: newAnsweredSet, score: newScore, startTime });
        } else {
          setQuizState("finished");
        }
      }, 1500);
    }, 500);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.put(`/modules/subtopics/${subtopicId}/complete`, {
        answers,
        timeTaken: elapsed
      });
      
      if (res.passed) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#06b6d4'] });
        toast.success("Quiz passed! " + (res.isModuleComplete ? "Module Completed!" : ""));
      } else {
        toast.error("Quiz failed. You didn't score enough to pass.");
      }
      
      sessionStorage.removeItem(`quiz_${subtopicId}`);
      setTimeout(() => handleLeave(), 3000);
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (quizState === "loading") {
    return (
      <div className="min-h-screen bg-[#0B0F12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F12] p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={handleLeave} className="inline-flex items-center text-[#9ca3af] hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Map
        </button>
        
        {quizState === "playing" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl text-white">{subtopic?.title || "Quiz"}</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-medium">{formatTime(elapsed)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#9ca3af]">Progress</span>
                  <span className="text-sm text-[#10b981]">{answeredQuestions.size}/{questions.length}</span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-[#1e2533] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-full transition-all" style={{ width: `${(answeredQuestions.size / (questions.length || 1)) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="bg-[#131820] border border-white/[0.08] rounded-2xl p-8">
          
          {/* INTRO STATE */}
          {quizState === "intro" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-2xl bg-[#1e2533] flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-[#10b981]" />
              </div>
              <h2 className="text-3xl text-white mb-3">{subtopic?.title}</h2>
              <p className="text-[#9ca3af] mb-8 max-w-md mx-auto">
                Are you ready to test your knowledge? This quiz contains {questions.length} questions.
              </p>
              
              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <button onClick={handleStart} className="w-full py-4 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 fill-current" />
                  {attempts.length > 0 ? "Re-attempt Quiz" : "Start Quiz"}
                </button>
                {attempts.length > 0 && (
                  <button onClick={() => setQuizState("history")} className="w-full py-4 bg-[#1e2533] hover:bg-[#374151] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <History className="w-5 h-5" />
                    View Previous Attempts
                  </button>
                )}
                <button onClick={handleLeave} className="w-full py-4 border border-white/10 hover:bg-white/5 text-white rounded-xl font-medium transition-colors">
                  Go Back
                </button>
              </div>
            </div>
          )}

          {/* HISTORY STATE */}
          {quizState === "history" && (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-6">
                <History className="w-6 h-6 text-[#06b6d4]" />
                <h2 className="text-2xl text-white">Previous Attempts</h2>
              </div>
              <div className="space-y-4 mb-8 max-h-[60vh] overflow-y-auto pr-2">
                {attempts.map((attempt, idx) => (
                  <div key={attempt._id} className="bg-[#1e2533] p-4 rounded-xl border border-white/[0.05] flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">Attempt #{attempts.length - idx}</span>
                        {attempt.isFirstAttempt && <span className="text-xs bg-[#10b981]/20 text-[#10b981] px-2 py-0.5 rounded-full">First Attempt (Scored)</span>}
                      </div>
                      <span className="text-sm text-[#9ca3af]">{new Date(attempt.createdAt).toLocaleDateString()} at {new Date(attempt.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl text-white font-bold">{attempt.score}/{attempt.totalQuestions}</div>
                      <div className="text-sm text-[#9ca3af] flex items-center gap-1 justify-end"><Clock className="w-3 h-3"/> {formatTime(attempt.timeTaken || 0)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setQuizState("intro")} className="flex-1 py-3 bg-[#1e2533] hover:bg-[#374151] text-white rounded-xl font-medium transition-colors">
                  Back to Menu
                </button>
              </div>
            </div>
          )}

          {/* PLAYING STATE */}
          {quizState === "playing" && currentQ && (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981] font-bold text-lg">
                    {currentQuestion + 1}
                  </div>
                  <span className="text-[#9ca3af]">Question {currentQuestion + 1} of {questions.length}</span>
                </div>
                <p className="text-xl text-white leading-relaxed font-medium">{currentQ.question}</p>
              </div>

              <div className="space-y-4">
                {currentQ.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQ.correctAnswer;
                  const isAnswered = answeredQuestions.has(currentQuestion);
                  const showResult = isAnswered && isSelected;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={isAnswered}
                      className={`w-full p-5 rounded-xl border-2 text-left transition-all text-lg ${
                        showResult && isCorrect ? "bg-[#10b981]/10 border-[#10b981] text-[#10b981]"
                        : showResult && !isCorrect ? "bg-red-500/10 border-red-500 text-red-500"
                        : isSelected ? "bg-[#10b981]/5 border-[#10b981]/50 text-white"
                        : "bg-[#1e2533] border-white/[0.08] hover:border-[#10b981]/30 text-white hover:bg-[#1e2533]/80"
                      } ${isAnswered ? "cursor-not-allowed opacity-80" : "hover:scale-[1.01]"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          showResult && isCorrect ? "border-[#10b981] bg-[#10b981]"
                          : showResult && !isCorrect ? "border-red-500 bg-red-500"
                          : "border-current"
                        }`}>
                          {showResult && (isCorrect ? <CheckCircle2 className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />)}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* FINISHED STATE */}
          {quizState === "finished" && (
            <div className="text-center py-12">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#10b981] to-[#06b6d4] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#10b981]/20">
                <Target className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Quiz Completed!</h3>
              <p className="text-lg text-[#9ca3af] mb-4">You scored <span className="text-[#10b981] font-bold">{score}</span> out of {questions.length}</p>
              
              <div className="inline-flex items-center gap-2 bg-[#1e2533] px-4 py-2 rounded-lg mb-8 text-[#9ca3af]">
                <Clock className="w-4 h-4" /> Time Taken: {formatTime(elapsed)}
              </div>
              
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-4 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white rounded-xl font-medium text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 mx-auto shadow-lg shadow-[#10b981]/20 w-full max-w-sm"
              >
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                Submit Results
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
