import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { AIChatbot } from "./AIChatbot";
import { useState } from "react";

export function AppLayout() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0B0F12] dark">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        <Outlet />
      </main>
      <AIChatbot isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </div>
  );
}
