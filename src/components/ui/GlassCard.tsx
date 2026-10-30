"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  glowColor?: "indigo" | "cyan" | "emerald" | "purple" | "amber";
  hoverScale?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glowColor = "indigo",
  hoverScale = true,
  ...props
}) => {
  const glowMap = {
    indigo: "hover:border-indigo-400/40 hover:shadow-glow-indigo",
    cyan: "hover:border-cyan-400/40 hover:shadow-glow-cyan",
    emerald: "hover:border-emerald-400/40 hover:shadow-glow-emerald",
    purple: "hover:border-purple-400/40 hover:shadow-glow-purple",
    amber: "hover:border-amber-400/40 hover:shadow-floating",
  };

  return (
    <motion.div
      whileHover={hoverScale ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "relative rounded-2xl border border-indigo-100/60 bg-white/75 backdrop-blur-xl p-6 shadow-glass transition-all duration-300",
        glowMap[glowColor],
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-indigo-50/20 pointer-events-none" />
      {children}
    </motion.div>
  );
};
