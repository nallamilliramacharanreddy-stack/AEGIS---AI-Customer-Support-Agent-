"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Cpu, FileText, Sparkles, Play, Pause } from "lucide-react";
import { GradientBadge } from "../ui/GradientBadge";

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Raw Ticket Ingestion",
    detail: "Customer submits query via API, Email, Live Chat, or Voice transcription.",
    icon: FileText,
    sample: "“I was double-charged on invoice #891A and need an immediate refund.”"
  },
  {
    step: "02",
    title: "ML Intent & Emotion Analysis",
    detail: "TF-IDF + LogisticRegression algorithms process text semantics, sentiment (-0.82), and urgency (P2 High).",
    icon: Cpu,
    sample: "Category: Billing • Sentiment: Frustrated • Confidence: 96.4%"
  },
  {
    step: "03",
    title: "AI Response Generation",
    detail: "Synthesizes 3 candidate replies with verified KB citations and pro-rata credit calculation.",
    icon: Sparkles,
    sample: "Candidate #1 (Professional - 98% Match): Invoice #891A duplicate credit initiated."
  },
  {
    step: "04",
    title: "Instant Resolution & Dispatch",
    detail: "Dispatches refund checklist, updates CRM record, and executes automated resolution.",
    icon: CheckCircle2,
    sample: "Status: Resolved • Execution Time: 11ms • CSAT: 5.0"
  }
];

export const WorkflowAnimation: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % WORKFLOW_STEPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <section className="py-20 bg-gradient-to-b from-transparent via-indigo-50/30 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <GradientBadge variant="purple" icon={<Sparkles className="w-3.5 h-3.5" />}>
            Live Interactive Pipeline
          </GradientBadge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            How Aegis Resolves Tickets in <span className="text-gradient-accent">Milliseconds</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
            Watch the live automated pipeline sequence transform raw inquiries into high-accuracy resolutions.
          </p>
        </div>

        {/* Step Selector Pills with Animated Progress Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {WORKFLOW_STEPS.map((s, index) => {
            const Icon = s.icon;
            const isCurrent = activeStep === index;
            return (
              <motion.button
                key={s.step}
                onClick={() => {
                  setActiveStep(index);
                  setIsAutoPlaying(false);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`p-5 rounded-2xl text-left transition-all duration-300 border relative overflow-hidden ${
                  isCurrent
                    ? "bg-white border-purple-300 shadow-xl"
                    : "bg-white/60 border-indigo-100 hover:bg-white/90"
                }`}
              >
                {/* Top Animated Progress Bar */}
                {isCurrent && isAutoPlaying && (
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3.5, ease: "linear" }}
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-purple-600 to-pink-500"
                  />
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                    isCurrent ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    Phase {s.step}
                  </span>
                  <Icon className={`w-5 h-5 ${isCurrent ? "text-purple-600 animate-pulse" : "text-slate-400"}`} />
                </div>
                <div className="font-bold text-sm text-slate-800 mb-1">{s.title}</div>
                <p className="text-xs text-slate-500 line-clamp-2">{s.detail}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Active Stage Detail Showcase Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100 shadow-2xl relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2">
                  <GradientBadge variant="indigo">
                    Active Execution Inspector
                  </GradientBadge>
                  <span className="text-xs font-mono text-slate-400">Step {WORKFLOW_STEPS[activeStep].step} / 04</span>
                  
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="ml-auto p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-purple-700 text-xs font-medium flex items-center gap-1"
                  >
                    {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isAutoPlaying ? "Pause Auto Play" : "Play Pipeline"}
                  </button>
                </div>

                <h3 className="text-2xl font-extrabold text-slate-800">
                  {WORKFLOW_STEPS[activeStep].title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {WORKFLOW_STEPS[activeStep].detail}
                </p>
              </div>

              {/* Simulated Data Snippet */}
              <div className="w-full md:w-96 p-5 rounded-2xl bg-slate-950 text-indigo-100 font-mono text-xs shadow-2xl border border-purple-900/60 relative">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] text-pink-400">
                  <span>// ML TELEMETRY PAYLOAD</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> 200 OK
                  </span>
                </div>
                <div className="pt-3 font-mono leading-relaxed text-indigo-200">
                  {WORKFLOW_STEPS[activeStep].sample}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};
