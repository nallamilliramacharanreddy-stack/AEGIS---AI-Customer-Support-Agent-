"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  className,
  loading = false,
  ...props
}) => {
  const variantStyles = {
    primary:
      "bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white shadow-glow-indigo hover:shadow-indigo-500/40 border-transparent",
    secondary:
      "bg-white/80 backdrop-blur-md text-slate-800 border-indigo-100 shadow-glass hover:bg-white hover:border-indigo-200",
    outline:
      "bg-transparent text-indigo-600 border-indigo-200 hover:bg-indigo-50/60 hover:border-indigo-300",
    ghost:
      "bg-transparent text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-600 border-transparent",
    gradient:
      "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-glow-purple hover:shadow-cyan-500/40 border-transparent",
  };

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs font-semibold rounded-xl gap-1.5",
    md: "px-5 py-2.5 text-sm font-semibold rounded-2xl gap-2",
    lg: "px-7 py-3.5 text-base font-bold rounded-2xl gap-2.5",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "inline-flex items-center justify-center border font-sans transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
      {loading ? (
        <span className="inline-block animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      ) : icon ? (
        <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">{icon}</span>
      ) : null}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};
