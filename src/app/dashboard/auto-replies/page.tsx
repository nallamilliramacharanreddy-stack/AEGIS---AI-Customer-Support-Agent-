"use client";

import React, { useState } from "react";
import { Sparkles, Send, Edit3, CheckCircle2, BookOpen, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBadge } from "@/components/ui/GradientBadge";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { generateAutoRepliesAsync, generateAutoRepliesSync, CandidateReply } from "@/lib/ml-engine/autoReplyGenerator";
import { sendChatMessage } from "@/lib/api";

const DEMO_TICKET = "Our payment deducted from credit card but order #9912 was not confirmed at checkout.";

export default function AutoRepliesPage() {
  const [ticketInput, setTicketInput] = useState(DEMO_TICKET);
  const [candidates, setCandidates] = useState<CandidateReply[]>(generateAutoRepliesSync(DEMO_TICKET));
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateReply>(candidates[0]);
  const [editedText, setEditedText] = useState(candidates[0].replyText);
  const [dispatched, setDispatched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const fresh = await generateAutoRepliesAsync(ticketInput);
      setCandidates(fresh);
      setSelectedCandidate(fresh[0]);
      setEditedText(fresh[0].replyText);
      setDispatched(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = (c: CandidateReply) => {
    setSelectedCandidate(c);
    setEditedText(c.replyText);
    setDispatched(false);
  };

  const handleDispatch = async () => {
    setDispatched(true);
    try {
      // Record dispatched auto-reply in customer message log
      await sendChatMessage(editedText, {
        conversationId: "CONV-AUTO-DISPATCH",
        customerId: "CUST-104"
      });
    } catch (e) {
      console.warn("Dispatched auto-reply logged locally:", e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Navbar
        title="AI Auto Replies & Candidate Generator"
        subtitle="scikit-learn TF-IDF Cosine Similarity Auto-Response Selection Engine"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Candidate Selector */}
        <GlassCard glowColor="purple" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-800 text-sm">ML Candidate Options</h3>
            </div>
            <GradientBadge variant="purple" size="sm">
              TF-IDF Index
            </GradientBadge>
          </div>

          <div className="space-y-3">
            {candidates.map((c) => {
              const isSelected = selectedCandidate.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectCandidate(c)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all space-y-2 ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-50 via-indigo-50 to-cyan-50 border-purple-300 shadow-sm"
                      : "bg-white/60 border-indigo-100 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-purple-600" : "bg-slate-300"}`} />
                      {c.tone} Tone
                    </span>
                    <span className="text-[11px] font-mono font-bold text-purple-700">
                      {c.matchConfidence}% Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{c.replyText}</p>
                </button>
              );
            })}
          </div>

          {/* Historical Similarity Match Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2 text-xs">
            <div className="font-bold text-slate-700 flex items-center justify-between">
              <span>Cosine Similarity Match</span>
              <span className="text-indigo-600 font-mono">{selectedCandidate.matchConfidence}%</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Matched against trained support response dataset in Python FastAPI backend memory.
            </p>
          </div>
        </GlassCard>

        {/* Right 2 Cols: Active Editor & Dispatch Preview */}
        <GlassCard glowColor="indigo" className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-base">One-Click Dispatch Editor</h3>
              </div>
              <GradientBadge variant="indigo" icon={<Clock className="w-3 h-3" />}>
                Est. Time: {selectedCandidate.estimatedResolutionTime}
              </GradientBadge>
            </div>

            {/* Inbound Context Box */}
            <div className="p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Inbound Query</span>
              <textarea
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                rows={2}
                className="w-full bg-transparent text-xs text-slate-700 font-mono leading-relaxed focus:outline-none"
              />
            </div>

            {/* Response Textarea Editor */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span>Response Body</span>
                <button
                  onClick={() => setEditedText(selectedCandidate.replyText)}
                  className="text-indigo-600 hover:underline text-[11px]"
                >
                  Reset to ML Draft
                </button>
              </div>
              <textarea
                rows={6}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full p-4 rounded-2xl bg-white border border-indigo-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all shadow-inner leading-relaxed"
              />
            </div>

            {/* Verified Citations */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-indigo-500" /> Knowledge Base Citations:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.sourceArticles.map((art) => (
                  <span key={art} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                    {art}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            {dispatched ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 w-full sm:w-auto">
                <CheckCircle2 className="w-4 h-4" /> Response Dispatched & Marked Resolved!
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-medium">
                Clicking dispatch sends response to customer inbox.
              </div>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <AnimatedButton
                onClick={handleGenerate}
                variant="secondary"
                size="md"
                disabled={loading}
              >
                {loading ? "Matching ML..." : "Run ML Auto Reply"}
              </AnimatedButton>

              <AnimatedButton
                onClick={handleDispatch}
                variant="primary"
                size="md"
                disabled={dispatched}
                icon={<Send className="w-4 h-4" />}
              >
                Dispatch AI Response
              </AnimatedButton>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
