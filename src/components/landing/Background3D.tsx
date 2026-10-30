"use client";

import React from "react";
import { motion } from "framer-motion";

interface Background3DProps {
  mode?: "canvas" | "showcase";
}

export const Background3D: React.FC<Background3DProps> = ({ mode = "canvas" }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 w-full h-full">
      {/* Photorealistic Dreamy Pastel Sunset Cloud Image Background */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-90 transition-all duration-700"
        style={{
          backgroundImage: `url('/images/cloud-bg.png')`
        }}
      />

      {/* Atmospheric Soft Light Overlay (Lavender / Sunset Tint) */}
      <div 
        className="absolute inset-0 w-full h-full mix-blend-soft-light"
        style={{
          background: `linear-gradient(135deg, rgba(254,226,226,0.3) 0%, rgba(237,233,254,0.4) 30%, rgba(219,234,254,0.3) 65%, rgba(245,208,254,0.35) 100%)`
        }}
      />

      {/* Light Gradient Ray Overlay */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-amber-100/30 via-transparent to-purple-900/10 pointer-events-none" />

      {/* Subtle Animated Cloud Drift Overlay */}
      <motion.div
        animate={{
          x: [0, 20, 0],
          y: [0, -10, 0],
          scale: [1, 1.02, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 right-0 w-[800px] h-[500px] bg-gradient-to-tl from-purple-300/30 via-pink-200/20 to-transparent rounded-[50%] blur-3xl"
      />
    </div>
  );
};
