"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { GradientBadge } from "../ui/GradientBadge";

const FAQS = [
  {
    q: "How does Aegis achieve 99.4% intent classification accuracy?",
    a: "Aegis utilizes a scikit-learn Machine Learning architecture combining TF-IDF vector embeddings with LogisticRegression and LinearSVC classification with confidence bounds. Low-confidence queries are seamlessly routed to human agent workflows with pre-populated AI reply candidates."
  },
  {
    q: "What are the 10 core Machine Learning features included in Aegis?",
    a: "Aegis includes 10 ML-powered features: AI Chatbot, Ticket Classification, AI Auto Replies, Knowledge Base Vector Search, Sentiment Analysis, Voice Support, Multimodal Issue Detection, AI Root Cause Analysis, Personalized AI Support, and Autonomous Resolution."
  },
  {
    q: "Are generative AI or external LLM APIs (OpenAI / Gemini) used?",
    a: "No! Aegis operates 100% on local trained Machine Learning models (scikit-learn, TF-IDF, Cosine Similarity, Logistic Regression, LinearSVC) served via a high-performance Python FastAPI backend, ensuring zero data leakage and strict ML predictions."
  },
  {
    q: "How does the Voice Support and Multimodal processing operate?",
    a: "Voice Support transcribes incoming audio speech directly into the NLP ML pipeline. Multimodal Issue Detection extracts text via OCR from uploaded error screenshots and classifies issue categories automatically."
  }
];

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <GradientBadge variant="emerald" icon={<HelpCircle className="w-3.5 h-3.5" />}>
            Frequently Asked Questions
          </GradientBadge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Know
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-indigo-100 bg-white/80 backdrop-blur-xl shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-800 text-base sm:text-lg hover:text-indigo-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-indigo-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-600" : ""}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-indigo-50 pt-4 font-normal"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
