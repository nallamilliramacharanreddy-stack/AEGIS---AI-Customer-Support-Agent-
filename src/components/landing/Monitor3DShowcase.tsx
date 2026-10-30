"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Maximize2, Sparkles, Eye } from "lucide-react";
import { Background3D } from "./Background3D";

interface Monitor3DShowcaseProps {
  children: React.ReactNode;
}

export const Monitor3DShowcase: React.FC<Monitor3DShowcaseProps> = ({ children }) => {
  const [viewMode, setViewMode] = useState<"showcase" | "full">("showcase");

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-slate-100 flex flex-col justify-between">
      {/* Top View Mode Control Floating Bar */}
      <div className="fixed top-5 right-6 z-50 flex items-center gap-2 p-1.5 rounded-full bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-2xl">
        <button
          onClick={() => setViewMode("showcase")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            viewMode === "showcase"
              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30"
              : "text-slate-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          3D Studio Showcase View
        </button>

        <button
          onClick={() => setViewMode("full")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            viewMode === "full"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30"
              : "text-slate-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          Full Interactive Canvas View
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "showcase" ? (
          <motion.div
            key="showcase-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-12 overflow-hidden"
          >
            {/* Dark Studio Background with Neon Pink Laser Light Beams */}
            <Background3D mode="showcase" />

            {/* Giant Background 3D Outline Typography matching reference image */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
              <span className="text-[12vw] font-extrabold tracking-tighter text-stroke-3d opacity-25 whitespace-nowrap transform -rotate-3">
                Experience AI
              </span>
            </div>

            {/* 3D Tilted Studio Desktop Monitor Scene */}
            <div className="relative w-full max-w-6xl perspective-3d-stage my-auto py-8">
              
              {/* Tilted Desktop Monitor Frame */}
              <motion.div
                initial={{ rotateX: 18, rotateY: -22, rotateZ: 4, scale: 0.88 }}
                animate={{ rotateX: 10, rotateY: -15, rotateZ: 2, scale: 0.94 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="monitor-3d-tilted relative mx-auto rounded-[32px] bg-slate-900 border-[10px] border-slate-900 shadow-[0_40px_100px_rgba(0,0,0,0.85)] overflow-hidden cursor-pointer group"
              >
                {/* Screen Inner Bezel Shadow & Glossy Reflection */}
                <div className="absolute inset-0 rounded-[22px] border border-white/20 z-30 pointer-events-none shadow-inner" />
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-white/25 z-30 pointer-events-none" />

                {/* Embedded Landing Page Content inside Monitor Screen */}
                <div className="relative w-full h-[720px] overflow-y-auto overflow-x-hidden rounded-[20px] cloud-sky-bg text-slate-900 selection:bg-purple-500 selection:text-white">
                  {children}
                </div>
              </motion.div>

              {/* 3D Metallic Monitor Stand & Base matching the screenshot */}
              <div className="relative mx-auto -mt-10 flex flex-col items-center pointer-events-none z-10">
                {/* Vertical Metallic Neck Stand */}
                <div className="w-28 h-44 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-600 rounded-b-xl shadow-2xl transform -rotate-3 border-x border-slate-200/40" />

                {/* Angular Base Foot */}
                <div className="w-80 h-16 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] transform -rotate-2 border-t border-slate-300/60" />
              </div>

            </div>

            {/* Bottom Floating Hint Badge */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-xs text-slate-300 shadow-xl">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              Click elements inside the monitor to interact directly or switch to Full Canvas View
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="full-mode"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="relative min-h-screen w-full cloud-sky-bg text-slate-900"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
