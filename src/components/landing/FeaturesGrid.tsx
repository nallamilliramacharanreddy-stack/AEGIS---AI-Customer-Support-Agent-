"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Layers,
  Sparkles,
  Smile,
  Mic,
  BookOpen,
  Image,
  Cpu,
  UserCheck,
  Zap
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { GradientBadge } from "../ui/GradientBadge";

const FEATURES = [
  {
    icon: Bot,
    title: "AI Chatbot",
    description: "Multi-turn ML intent detection and knowledge retrieval using TF-IDF and scikit-learn models.",
    glow: "indigo" as const,
    badge: "01 — CHATBOT"
  },
  {
    icon: Layers,
    title: "Ticket Classification",
    description: "Automatic classification across Payment, Technical, Account, and Delivery with priority prediction.",
    glow: "cyan" as const,
    badge: "02 — CLASSIFIER"
  },
  {
    icon: Sparkles,
    title: "AI Auto Replies",
    description: "Ranked candidate auto-replies generated via TF-IDF + Cosine Similarity matching.",
    glow: "purple" as const,
    badge: "03 — AUTO-REPLY"
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Vector similarity search with article retrieval, bookmarks, and real-time indexing.",
    glow: "indigo" as const,
    badge: "04 — KNOWLEDGE"
  },
  {
    icon: Smile,
    title: "Sentiment Analysis",
    description: "Real-time customer emotion classification (Positive, Neutral, Negative) with ML confidence bounds.",
    glow: "emerald" as const,
    badge: "05 — SENTIMENT"
  },
  {
    icon: Mic,
    title: "Voice Support",
    description: "Speech-to-text transcription feeding directly into the scikit-learn NLP ML pipeline.",
    glow: "amber" as const,
    badge: "06 — VOICE"
  },
  {
    icon: Image,
    title: "Multimodal Issue Detection",
    description: "Upload error screenshots for OCR text extraction and ML issue category detection.",
    glow: "cyan" as const,
    badge: "07 — MULTIMODAL"
  },
  {
    icon: Cpu,
    title: "AI Root Cause Analysis",
    description: "ML classifier predicting root cause, confidence score, and recommended resolution steps.",
    glow: "purple" as const,
    badge: "08 — ROOT CAUSE"
  },
  {
    icon: UserCheck,
    title: "Personalized AI Support",
    description: "ML Cosine Similarity retrieving relevant previous interactions belonging to authenticated customers.",
    glow: "indigo" as const,
    badge: "09 — PERSONALIZED"
  },
  {
    icon: Zap,
    title: "Autonomous Resolution",
    description: "Predicts support actions (Refund, Cancel, Escalate) with automatic human review on low confidence.",
    glow: "emerald" as const,
    badge: "10 — RESOLUTION"
  }
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <GradientBadge variant="cyan" icon={<Zap className="w-3.5 h-3.5" />}>
            Machine Learning Engine
          </GradientBadge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Engineered for <span className="text-gradient-primary">Zero-Touch Support</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
            Ten synchronized machine learning modules working together to automate resolution and delight your customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <GlassCard glowColor={feat.glow} className="h-full flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-glow-indigo group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-white/80 text-purple-700 border border-purple-100 shadow-2xs">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-purple-700 transition-colors">
                      {feat.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {feat.description}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
