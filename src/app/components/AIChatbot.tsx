import { useState } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../../services/api";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const quickActions = [
  "What is carbon footprint?",
  "Explain water conservation",
  "Tips for reducing waste",
  "How to earn more points?",
];

export function AIChatbot({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI Eco-Companion. I'm trained to help you with environmental queries. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || sending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const context = `User is currently on page: ${window.location.pathname}`;
      const data = await api.post("/chatbot", { message: messageText, context });
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || "I couldn't process that request. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please make sure the backend is running and try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-[#131820] border-l border-white/[0.08] flex flex-col z-50"
          >
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#a855f7] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white">AI Eco-Companion</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <span className="text-xs text-[#6b7280]">Powered by Gemini</span>
                  </div>
                </div>
              </div>
              <button onClick={onToggle} className="w-8 h-8 rounded-lg hover:bg-white/[0.05] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl p-3 ${message.sender === "user" ? "bg-[#10b981] text-white" : "bg-[#1e2533] text-white"}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-[#1e2533] rounded-xl p-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#10b981]" />
                    <span className="text-sm text-[#9ca3af]">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/[0.08] space-y-3">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button key={action} onClick={() => handleSend(action)} className="px-3 py-1.5 bg-[#1e2533] hover:bg-[#10b981]/10 text-xs text-[#9ca3af] hover:text-[#10b981] rounded-lg transition-colors">
                    {action}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask me anything..."
                  disabled={sending}
                  className="flex-1 bg-[#1e2533] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 disabled:opacity-50"
                />
                <button onClick={() => handleSend()} disabled={sending || !input.trim()} className="w-10 h-10 rounded-xl bg-[#10b981] hover:bg-[#059669] flex items-center justify-center text-white transition-colors disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button onClick={onToggle} className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#10b981] to-[#06b6d4] flex items-center justify-center text-white shadow-lg shadow-[#10b981]/25 hover:shadow-xl hover:shadow-[#10b981]/40 transition-all z-40">
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}
    </>
  );
}
