"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GradientBadgeProps {
  children: React.ReactNode;
  variant?: 'indigo' | 'cyan' | 'emerald' | 'purple' | 'amber' | 'rose';
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GradientBadge: React.FC<GradientBadgeProps> = ({
  children,
  variant = 'indigo',
  icon,
  className,
  size = 'md'
}) => {
  const variantStyles = {
    indigo: 'bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-indigo-600/10 text-indigo-700 border-indigo-200/80',
    cyan: 'bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-blue-500/10 text-cyan-700 border-cyan-200/80',
    emerald: 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-600/10 text-emerald-700 border-emerald-200/80',
    purple: 'bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-600/10 text-purple-700 border-purple-200/80',
    amber: 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 text-amber-700 border-amber-200/80',
    rose: 'bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-red-500/10 text-rose-700 border-rose-200/80',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-semibold gap-1',
    md: 'px-3 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-4 py-1.5 text-sm font-bold gap-2',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border backdrop-blur-md transition-transform duration-200 hover:scale-105 shadow-sm",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
