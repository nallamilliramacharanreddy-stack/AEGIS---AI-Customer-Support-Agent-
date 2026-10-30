"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Palette } from "lucide-react";

export type BackgroundTheme = "luminous-mesh" | "deep-ai" | "aurora-flow";

export const DashboardBackground: React.FC = () => {
  const [theme, setTheme] = useState<BackgroundTheme>("luminous-mesh");
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* Dynamic Background Image Layer */}
      <AnimatePresence mode="wait">
        {theme === "luminous-mesh" && (
          <motion.div
            key="luminous-mesh"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/dashboard-luminous-mesh.jpg')",
            }}
          />
        )}

        {theme === "deep-ai" && (
          <motion.div
            key="deep-ai"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/dashboard-deep-ai.jpg')",
            }}
          />
        )}

        {theme === "aurora-flow" && (
          <motion.div
            key="aurora-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/dashboard-bg.jpg')",
            }}
          />
        )}
      </AnimatePresence>

      {/* Atmospheric Soft Light Overlay (Lavender / Cyan / Indigo Tint) */}
      <div
        className="absolute inset-0 w-full h-full mix-blend-overlay opacity-30 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.2) 45%, rgba(168, 85, 247, 0.25) 100%)",
        }}
      />

      {/* Subtle Digital Grid Matrix Overlay for AI/ML Infrastructure feel */}
      <div
        className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(79, 70, 229, 0.8) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Floating Animated Ambient Glow Orbs */}
      <motion.div
        animate={{
          x: [0, 35, 0],
          y: [0, -25, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-24 right-10 w-[550px] h-[550px] bg-gradient-to-br from-indigo-400/25 via-cyan-400/20 to-transparent rounded-full blur-3xl pointer-events-none"
      />

      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-10 left-60 w-[600px] h-[600px] bg-gradient-to-tr from-purple-400/20 via-indigo-300/15 to-transparent rounded-full blur-3xl pointer-events-none"
      />

      {/* Floating Theme Quick Selector on Bottom Right (Interactive) */}
      <div className="pointer-events-auto absolute bottom-4 right-4 z-40">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="p-2.5 rounded-2xl bg-white/80 hover:bg-white backdrop-blur-xl border border-indigo-200/80 shadow-glass text-slate-600 hover:text-indigo-600 transition-all hover:scale-105 flex items-center gap-2 text-xs font-semibold"
            title="Change Background Ambience"
          >
            <Palette className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Ambience</span>
          </button>

          {showPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-12 right-0 w-52 p-3 rounded-2xl bg-white/95 backdrop-blur-2xl border border-indigo-100 shadow-2xl space-y-2 z-50"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                Background Style
              </div>
              <button
                type="button"
                onClick={() => {
                  setTheme("luminous-mesh");
                  setShowPicker(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  theme === "luminous-mesh"
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>Luminous Mesh</span>
                {theme === "luminous-mesh" && (
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme("deep-ai");
                  setShowPicker(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  theme === "deep-ai"
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>Deep Neural Glow</span>
                {theme === "deep-ai" && (
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme("aurora-flow");
                  setShowPicker(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  theme === "aurora-flow"
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>Enterprise Horizon</span>
                {theme === "aurora-flow" && (
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                )}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
