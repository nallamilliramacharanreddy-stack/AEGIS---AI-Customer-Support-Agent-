"use client";

import React, { useState } from "react";
import { Smile, Sparkles, Activity, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBadge } from "@/components/ui/GradientBadge";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { analyzeSentimentAsync, analyzeSentimentSync, SentimentResult } from "@/lib/ml-engine/sentimentAnalyzer";
import { MOCK_SENTIMENT_TIMELINE } from "@/lib/mockData";

const INITIAL_TEXT = "I am terribly frustrated with this unexpected payment failure! Money was deducted from my account but no confirmation was sent.";

export default function SentimentAnalysisPage() {
  const [inputText, setInputText] = useState(INITIAL_TEXT);
  const [result, setResult] = useState<SentimentResult>(analyzeSentimentSync(INITIAL_TEXT));
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await analyzeSentimentAsync(inputText);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'Positive': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Neutral': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Frustrated': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Angry': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Navbar
        title="Real-Time Sentiment & Emotion Analyzer"
        subtitle="scikit-learn LogisticRegression Sentiment Classification Engine"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Sentiment Tester */}
        <GlassCard glowColor="emerald" className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-base">Real-Time Emotion Inspection</h3>
            </div>
            <GradientBadge variant="emerald" icon={<Activity className="w-3 h-3" />}>
              scikit-learn ML Model
            </GradientBadge>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Enter Customer Feedback or Message</label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white border border-indigo-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 shadow-inner leading-relaxed"
            />
          </div>

          <AnimatedButton
            onClick={handleAnalyze}
            variant="gradient"
            size="md"
            icon={<Sparkles className="w-4 h-4" />}
            disabled={loading}
          >
            {loading ? "Running ML Model..." : "Analyze Customer Emotion"}
          </AnimatedButton>

          {/* Results Output Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-indigo-100">
            <div className={`p-4 rounded-2xl border ${getEmotionColor(result.primaryEmotion)} space-y-1`}>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Primary Emotion</span>
              <div className="text-xl font-extrabold">{result.primaryEmotion}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-indigo-100 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Sentiment Score</span>
              <div className="text-xl font-extrabold text-slate-800">
                {result.sentimentScore > 0 ? `+${result.sentimentScore}` : result.sentimentScore}
              </div>
              <div className="text-[10px] text-slate-400">-1.0 (Negative) to +1.0 (Positive)</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-indigo-100 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Predicted CSAT</span>
              <div className="text-xl font-extrabold text-amber-500">{result.csatPrediction} / 5.0 ⭐</div>
              <div className="text-[10px] text-slate-400">ML Predicted Score</div>
            </div>
          </div>
        </GlassCard>

        {/* Right Col: Emotion Percentage Breakdown */}
        <GlassCard glowColor="purple" className="space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Emotion Breakdown</h3>
            <p className="text-xs text-slate-500">Live ML probability scores</p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Positive Sentiment</span>
                <span className="text-emerald-600">{result.emotionBreakdown.positive}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${result.emotionBreakdown.positive}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Neutral Sentiment</span>
                <span className="text-blue-600">{result.emotionBreakdown.neutral}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${result.emotionBreakdown.neutral}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Negative / Frustrated</span>
                <span className="text-rose-600">{result.emotionBreakdown.negative}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${result.emotionBreakdown.negative}%` }} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-indigo-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Classification Features:</span>
            <div className="flex flex-wrap gap-1.5">
              {result.triggedPhrases.map((phrase) => (
                <span key={phrase} className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-semibold font-mono">
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Sentiment Trend Timeline Chart */}
      <GlassCard glowColor="indigo" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Weekly Sentiment Trend Distribution</h3>
            <p className="text-xs text-slate-500">Aggregate customer emotion metrics across 7 days</p>
          </div>
          <GradientBadge variant="indigo" icon={<TrendingUp className="w-3 h-3" />}>
            96% Positive Benchmark
          </GradientBadge>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_SENTIMENT_TIMELINE}>
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="positive" fill="#10B981" radius={[6, 6, 0, 0]} name="Positive %" />
              <Bar dataKey="neutral" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Neutral %" />
              <Bar dataKey="negative" fill="#F43F5E" radius={[6, 6, 0, 0]} name="Negative %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
