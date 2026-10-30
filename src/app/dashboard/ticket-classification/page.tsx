"use client";

import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  CheckCircle2,
  Cpu,
  PlusCircle,
  ArrowRight
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBadge } from "@/components/ui/GradientBadge";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { classifyTicket, createTicket, TicketClassifyResponse } from "@/lib/api";
import { useUser } from "@/context/UserContext";

const SAMPLE_TEXTS = [
  "Payment failed on checkout page. Money deducted from credit card but transaction error 500 occurred.",
  "Where is order #9912? Tracking shows in transit for 4 days with no update.",
  "I would like to request a full refund for my defective product.",
  "API 500 Internal Server error on webhook header verification.",
  "Unable to sign in to my account, password reset link is expired."
];

export default function TicketClassificationPage() {
  const { profile } = useUser();
  const [inputText, setInputText] = useState(SAMPLE_TEXTS[0]);
  const [result, setResult] = useState<TicketClassifyResponse>({
    category: "Payment",
    priority: "High",
    confidence: 94.5,
    duplicate_probability: 12.0,
    suggested_action: "Route to Payment resolution queue with High priority assignment."
  });
  const [loading, setLoading] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [ticketCreating, setTicketCreating] = useState(false);

  const handleClassify = async (text?: string) => {
    const target = text || inputText;
    setLoading(true);
    setCreatedTicketId(null);
    try {
      const res = await classifyTicket(target);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    setTicketCreating(true);
    try {
      const priorityMap: Record<string, string> = {
        Critical: "P1 - Critical",
        High: "P2 - High",
        Medium: "P3 - Medium",
        Low: "P4 - Low"
      };
      const formattedPriority = priorityMap[result.priority] || "P3 - Medium";

      const res = await createTicket({
        subject: inputText.slice(0, 60),
        description: inputText,
        category: result.category,
        priority: formattedPriority,
        customer_id: "CUST-104",
        customer_name: profile.name,
        assigned_agent: `${result.category} Engineering Team`
      });
      if (res.success && res.ticket) {
        setCreatedTicketId(res.ticket.ticket_id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTicketCreating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Navbar
        title="Automated Ticket Classification Engine"
        subtitle="scikit-learn LinearSVC Category & Priority Prediction Engine"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Classification Playground */}
        <GlassCard glowColor="indigo" className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-base">ML Ticket Inspector</h3>
            </div>
            <GradientBadge variant="cyan" icon={<Cpu className="w-3 h-3" />}>
              scikit-learn ML Model
            </GradientBadge>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Try Sample Inbound Tickets:</label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_TEXTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(sample);
                    handleClassify(sample);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs font-medium text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 transition-all text-left line-clamp-1 max-w-xs"
                >
                  Sample #{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Input Text Area */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Inbound Support Ticket Message</label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste customer support ticket message..."
              className="w-full p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all shadow-inner leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <AnimatedButton
              onClick={() => handleClassify()}
              variant="primary"
              size="md"
              icon={<Sparkles className="w-4 h-4" />}
              disabled={loading}
            >
              {loading ? "Running ML Pipeline..." : "Run ML Classification"}
            </AnimatedButton>

            <AnimatedButton
              onClick={handleCreateTicket}
              variant="secondary"
              size="md"
              icon={<PlusCircle className="w-4 h-4" />}
              disabled={ticketCreating}
            >
              {ticketCreating ? "Dispatching..." : "Dispatch to Tickets Database"}
            </AnimatedButton>
          </div>

          {createdTicketId && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Ticket #{createdTicketId} successfully created in SQLite central database and assigned to {result.category} queue!
              </span>
            </div>
          )}
        </GlassCard>

        {/* Right Col: Machine Learning Telemetry Matrix */}
        <GlassCard glowColor="cyan" className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
              <h3 className="font-bold text-slate-800 text-base">Prediction Metrics</h3>
              <span className="text-xs font-mono font-bold text-emerald-600">Sub-15ms Latency</span>
            </div>

            {/* Predicted Category */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-100 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Predicted Category</span>
              <div className="text-xl font-extrabold text-indigo-900 flex items-center justify-between">
                <span>{result.category}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-600 text-white font-mono">
                  {result.confidence}%
                </span>
              </div>
            </div>

            {/* Priority */}
            <div className="p-4 rounded-2xl bg-white border border-indigo-100 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Priority Level</span>
              <div className="flex items-center justify-between">
                <span className={`font-extrabold text-sm ${
                  result.priority === 'Critical' || result.priority === 'High' ? 'text-rose-600' : 'text-slate-800'
                }`}>
                  {result.priority}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  result.priority === 'Critical' || result.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  ML Classified
                </span>
              </div>
            </div>

            {/* Duplicate Prob */}
            <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Duplicate Probability</span>
                {result.duplicate_matched_ticket && (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
                    Matches #{result.duplicate_matched_ticket}
                  </span>
                )}
              </div>
              <div className="font-extrabold text-sm text-slate-800">{result.duplicate_probability}%</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${result.duplicate_probability}%` }} />
              </div>
            </div>
          </div>

          {/* Action Recommendation */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs space-y-1">
            <span className="font-bold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Action Directive:
            </span>
            <p className="text-emerald-900 font-medium">{result.suggested_action}</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
