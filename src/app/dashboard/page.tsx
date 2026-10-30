"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  TrendingUp,
  Clock,
  Smile,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  Upload,
  Cpu,
  Layers,
  UserCheck,
  RefreshCw,
  ArrowRight,
  User,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBadge } from "@/components/ui/GradientBadge";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useUser } from "@/context/UserContext";
import {
  analyzeRootCause,
  predictAutonomousResolution,
  getCustomerHistory,
  analyzeMultimodalImage,
  getAnalytics,
  RootCauseResponse,
  ResolutionResponse,
  CustomerHistoryResponse,
  MultimodalAnalysisResponse,
  AnalyticsMetrics
} from "@/lib/api";

export default function DashboardOverview() {
  const { profile, openEditModal } = useUser();

  // Live Analytics Metrics
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    total_conversations: 1482,
    ai_resolved_volume: 1392,
    escalated_volume: 42,
    ai_resolution_rate: 93.9,
    avg_response_time_ms: 12,
    customer_satisfaction: 4.95,
    open_tickets: 4,
    closed_tickets: 1,
    top_intents: [
      { intent: "ORDER_STATUS", count: 542 },
      { intent: "PAYMENT_PROBLEM", count: 312 },
      { intent: "ORDER_CANCEL", count: 184 },
      { intent: "TECHNICAL_SUPPORT", count: 142 }
    ],
    category_distribution: [
      { name: "Technical", value: 42, color: "#6366F1" },
      { name: "Billing", value: 24, color: "#06B6D4" },
      { name: "Order / Delivery", value: 20, color: "#10B981" },
      { name: "Account Access", value: 10, color: "#8B5CF6" },
      { name: "Feature Request", value: 4, color: "#F97316" },
    ]
  });

  const loadAnalytics = async () => {
    try {
      const data = await getAnalytics();
      setMetrics(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Feature 7 State: Multimodal Issue Detection
  const [multimodalFile, setMultimodalFile] = useState<File | null>(null);
  const [multimodalResult, setMultimodalResult] = useState<MultimodalAnalysisResponse | null>(null);
  const [multimodalLoading, setMultimodalLoading] = useState(false);

  // Feature 8 State: Root Cause Analysis
  const [rcQuery, setRcQuery] = useState("Money was deducted from my account but my order was not created.");
  const [rcResult, setRcResult] = useState<RootCauseResponse | null>(null);
  const [rcLoading, setRcLoading] = useState(false);

  // Feature 9 State: Personalized Support
  const [histQuery, setHistQuery] = useState("I am facing the same payment checkout issue again.");
  const [histResult, setHistResult] = useState<CustomerHistoryResponse | null>(null);
  const [histLoading, setHistLoading] = useState(false);

  // Feature 10 State: Autonomous Resolution
  const [resQuery, setResQuery] = useState("Please cancel my order #9912 immediately.");
  const [resResult, setResResult] = useState<ResolutionResponse | null>(null);
  const [resLoading, setResLoading] = useState(false);

  const handleMultimodalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMultimodalFile(file);
    setMultimodalLoading(true);
    try {
      const res = await analyzeMultimodalImage(file);
      setMultimodalResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setMultimodalLoading(false);
    }
  };

  const handleRootCause = async () => {
    setRcLoading(true);
    try {
      const res = await analyzeRootCause(rcQuery);
      setRcResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setRcLoading(false);
    }
  };

  const handlePersonalizedHistory = async () => {
    setHistLoading(true);
    try {
      const res = await getCustomerHistory(histQuery, "CUST-104");
      setHistResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setHistLoading(false);
    }
  };

  const handleAutonomousResolution = async () => {
    setResLoading(true);
    try {
      const res = await predictAutonomousResolution(resQuery);
      setResResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setResLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Navbar
        title="Operations Control Hub"
        subtitle="scikit-learn Machine Learning Operations & Resolution Pipeline"
      />

      {/* Synchronized Profile Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/20">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-400 shadow-md"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold flex items-center gap-2 flex-wrap">
              <span>Welcome back, {profile.name}</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-semibold">
                {profile.role}
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              {profile.department} • Status: <span className="text-emerald-400 font-semibold">{profile.status}</span>
            </p>
          </div>
        </div>

        <button
          onClick={openEditModal}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5 self-start sm:self-auto hover:scale-105 active:scale-95 shadow-sm"
          title="Click to edit account name across entire website"
        >
          <User className="w-3.5 h-3.5 text-indigo-300" /> Edit Account
        </button>
      </div>

      {/* Top 4 Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard glowColor="indigo" className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today&apos;s Open Volume</span>
            <div className="p-2 rounded-xl bg-indigo-100/80 text-indigo-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.total_conversations.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {metrics.ai_resolved_volume.toLocaleString()} auto-classified &amp; resolved
          </p>
        </GlassCard>

        <GlassCard glowColor="cyan" className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">ML Intent Accuracy</span>
            <div className="p-2 rounded-xl bg-cyan-100/80 text-cyan-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gradient-primary tracking-tight">99.4%</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +0.6%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">scikit-learn LogisticRegression + TF-IDF</p>
        </GlassCard>

        <GlassCard glowColor="emerald" className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Resolution Latency</span>
            <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.avg_response_time_ms} ms
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              Instant
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Sub-15ms ML Vector Match</p>
        </GlassCard>

        <GlassCard glowColor="purple" className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer CSAT</span>
            <div className="p-2 rounded-xl bg-purple-100/80 text-purple-600">
              <Smile className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.customer_satisfaction.toFixed(2)} / 5.0
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> 98% Satisfied
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Verified Customer Feedback</p>
        </GlassCard>
      </div>

      {/* CORE ML FEATURES 7, 8, 9, 10 INTERACTIVE TEST SUITE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* FEATURE 7: Multimodal Issue Detection */}
        <GlassCard glowColor="indigo" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">Feature 07 — Multimodal Issue Detection</h3>
            </div>
            <GradientBadge variant="indigo" size="sm">OCR + ML Image Classifier</GradientBadge>
          </div>

          <div className="space-y-3 text-xs">
            <label className="block text-slate-600 font-medium">Upload Screenshot or Error Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleMultimodalUpload}
              className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />

            {multimodalLoading && <div className="text-indigo-600 font-semibold animate-pulse">Running OCR &amp; Image Feature Classifier...</div>}

            {multimodalResult && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1.5 font-sans">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Category: {multimodalResult.issue_category}</span>
                  <span className="text-indigo-600">{multimodalResult.confidence}% Confidence</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong>Extracted OCR:</strong> &ldquo;{multimodalResult.extracted_ocr_text}&rdquo;
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold">
                  Action: {multimodalResult.recommended_action}
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* FEATURE 8: AI Root Cause Analysis */}
        <GlassCard glowColor="cyan" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-600" />
              <h3 className="font-bold text-slate-800 text-sm">Feature 08 — AI Root Cause Analysis</h3>
            </div>
            <GradientBadge variant="cyan" size="sm">ML Classifier</GradientBadge>
          </div>

          <div className="space-y-3 text-xs">
            <input
              type="text"
              value={rcQuery}
              onChange={(e) => setRcQuery(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-indigo-100 text-slate-800 font-medium focus:outline-none"
            />
            <AnimatedButton onClick={handleRootCause} variant="primary" size="sm" disabled={rcLoading}>
              {rcLoading ? "Predicting..." : "Predict Root Cause"}
            </AnimatedButton>

            {rcResult && (
              <div className="p-3.5 rounded-2xl bg-cyan-50/60 border border-cyan-100 space-y-1.5">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Root Cause: {rcResult.root_cause}</span>
                  <span className="text-cyan-700">{rcResult.confidence}% Confidence</span>
                </div>
                <div className="text-[11px] text-slate-700">
                  <strong>Resolution:</strong> {rcResult.resolution}
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* FEATURE 9: Personalized AI Support */}
        <GlassCard glowColor="purple" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-800 text-sm">Feature 09 — Personalized AI Support</h3>
            </div>
            <GradientBadge variant="purple" size="sm">ML History Similarity</GradientBadge>
          </div>

          <div className="space-y-3 text-xs">
            <input
              type="text"
              value={histQuery}
              onChange={(e) => setHistQuery(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-indigo-100 text-slate-800 font-medium focus:outline-none"
            />
            <AnimatedButton onClick={handlePersonalizedHistory} variant="secondary" size="sm" disabled={histLoading}>
              {histLoading ? "Searching Customer History..." : "Find Relevant Customer History"}
            </AnimatedButton>

            {histResult && histResult.relevant_case && (
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
                <div className="font-bold text-purple-900">
                  Matched Customer Ticket #{histResult.relevant_case.ticket_id} ({histResult.similarity_score}% Similarity)
                </div>
                <p className="text-[11px] text-slate-600">
                  <strong>Previous Query:</strong> &ldquo;{histResult.relevant_case.query}&rdquo;
                </p>
                <p className="text-[11px] text-slate-700">
                  <strong>Previous Resolution:</strong> {histResult.relevant_case.resolution}
                </p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* FEATURE 10: Autonomous Resolution */}
        <GlassCard glowColor="emerald" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-sm">Feature 10 — Autonomous Resolution</h3>
            </div>
            <GradientBadge variant="emerald" size="sm">ML Action Classifier</GradientBadge>
          </div>

          <div className="space-y-3 text-xs">
            <input
              type="text"
              value={resQuery}
              onChange={(e) => setResQuery(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-indigo-100 text-slate-800 font-medium focus:outline-none"
            />
            <AnimatedButton onClick={handleAutonomousResolution} variant="gradient" size="sm" disabled={resLoading}>
              {resLoading ? "Classifying Action..." : "Predict Support Action"}
            </AnimatedButton>

            {resResult && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                <div className="flex justify-between font-bold text-emerald-900">
                  <span>Action: {resResult.predicted_action}</span>
                  <span>{resResult.confidence}% Confidence</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Status: <strong>{resResult.status}</strong> {resResult.escalated ? "(Escalated to Human Agent)" : "(Auto Executed)"}
                </div>
              </div>
            )}
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
