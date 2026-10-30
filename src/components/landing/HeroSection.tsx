"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ChevronDown,
  Send,
  RefreshCw,
  GitBranch,
  History
} from "lucide-react";
import { Background3D } from "./Background3D";

export const HeroSection: React.FC = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "bot"; text: string }>>([
    {
      role: "bot",
      text: "👋 Welcome to ServeBot AI 7.0! Type a message or click a prompt to test instant AI responses."
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState("7.0");
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);

  const samplePrompts = [
    "Create auto-reply template",
    "Analyze CSAT trends",
    "Zero-latency dispatch"
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isGenerating) return;

    setChatHistory((prev) => [...prev, { role: "user", text: query }]);
    setInputMessage("");
    setIsGenerating(true);

    setTimeout(() => {
      let botResponse = "ServeBot AI is parsing your intent...";
      if (query.toLowerCase().includes("refund") || query.toLowerCase().includes("reply")) {
        botResponse = "✅ Auto-reply workflow generated: Configured sub-15ms trigger for verified order IDs with 99.4% intent match.";
      } else if (query.toLowerCase().includes("csat") || query.toLowerCase().includes("trends")) {
        botResponse = "📊 Sentiment Analysis: CSAT score rose to 4.95/5.0 with 84% automated resolution across technical support queues.";
      } else {
        botResponse = `✨ ServeBot AI ${selectedVersion}: "Crafted optimal solution for '${query}'. Ready for dispatch to knowledge base."`;
      }

      setChatHistory((prev) => [...prev, { role: "bot", text: botResponse }]);
      setIsGenerating(false);
    }, 850);
  };

  return (
    <section className="relative z-0 w-full min-h-screen px-4 sm:px-8 lg:px-14 py-12 flex flex-col justify-center overflow-hidden">
      {/* Photorealistic Dreamy Cloud Sky Background */}
      <Background3D />

      {/* MAIN HERO SECTION (2-Column Grid: Left Copy & Buttons | Right Interactive Chat Widget) */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-6">
        
        {/* HERO LEFT COLUMN */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
            Smart AI Customer<br />
            Support System
          </h1>

          {/* Subtitle Paragraph */}
          <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-xl">
            Our platform uses advanced AI to automate customer queries, deliver instant responses, and reduce support workload. It ensures faster resolutions.
          </p>

          {/* Action Buttons: Get Started (Dark Pill) & Learn More (Glass Pill) */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/dashboard">
              <button className="px-8 py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-[0.98] transition-all">
                Get Started
              </button>
            </Link>

            <Link href="/dashboard/auto-replies">
              <button className="px-8 py-3.5 rounded-full bg-white/50 hover:bg-white/80 border border-white/90 text-slate-900 font-bold text-sm shadow-sm backdrop-blur-md hover:scale-[1.03] transition-all">
                Learn More
              </button>
            </Link>
          </div>

        </div>

        {/* HERO RIGHT COLUMN: INTERACTIVE GLASS WIDGET */}
        <div className="lg:col-span-6 relative">
          
          <div className="w-full max-w-xl mx-auto servebot-glass-panel rounded-[32px] p-6 sm:p-8 space-y-6 relative overflow-hidden">
            
            {/* Widget Top Header Bar */}
            <div className="flex items-center justify-between border-b border-white/60 pb-4">
              
              {/* Left: Branch/Git Icon + Version Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white border border-white/80 text-xs font-bold text-slate-800 shadow-xs transition-all"
                >
                  <div className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs">
                    <GitBranch className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-900">ServeBot AI</span>
                  <span className="text-slate-700 font-bold text-xs">
                    {selectedVersion}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Version Selector Dropdown */}
                {showVersionDropdown && (
                  <div className="absolute top-10 left-0 z-30 w-48 rounded-2xl bg-white/95 backdrop-blur-xl border border-white p-2 shadow-2xl space-y-1">
                    {["7.0 (Latest)", "6.5 Enterprise", "5.0 Turbo"].map((v) => (
                      <button
                        key={v}
                        onClick={() => {
                          setSelectedVersion(v.split(" ")[0]);
                          setShowVersionDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: History Settings Button */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/60 hover:bg-white/90 text-xs font-semibold text-slate-700 border border-white/70 transition-all shadow-2xs">
                  <History className="w-3.5 h-3.5 text-slate-600" />
                  <span>History ⚙</span>
                </button>
              </div>

            </div>

            {/* Sparkle Header Title & Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
                <Sparkles className="w-5 h-5 text-slate-800" />
                <h2>Ask SmartSupport AI to create with you!</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                AI will craft the perfect output in seconds. For quicker results, you can also choose from ready-made prompts.
              </p>
            </div>

            {/* Sample Prompts */}
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="px-3 py-1 rounded-full bg-white/80 hover:bg-white border border-white/90 text-[11px] font-semibold text-slate-700 hover:text-pink-600 transition-all shadow-2xs"
                >
                  ⚡ {p}
                </button>
              ))}
            </div>

            {/* Chat Messages Log Area */}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 pt-1 scrollbar-thin">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-slate-950 text-white ml-auto max-w-[85%] font-medium shadow-md"
                      : "bg-white/90 border border-white text-slate-800 shadow-xs font-sans"
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {isGenerating && (
                <div className="p-3 rounded-2xl bg-white/80 text-purple-700 text-xs font-semibold flex items-center gap-2 shadow-xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>ServeBot AI is crafting your output...</span>
                </div>
              )}
            </div>

            {/* Main Input Box Container */}
            <div className="servebot-glass-input rounded-2xl p-4 space-y-3 shadow-sm border border-white/90">
              
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Message AI support agent..."
                rows={2}
                className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-500 font-medium focus:outline-none resize-none"
              />

              {/* Action Toolbar */}
              <div className="flex items-center justify-end pt-1 border-t border-slate-200/50">
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isGenerating}
                  className="w-8 h-8 rounded-full bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
