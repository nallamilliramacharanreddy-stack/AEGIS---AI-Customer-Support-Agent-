"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "rounded-2xl skeleton-shimmer bg-indigo-100/50 border border-indigo-50/50 min-h-[20px]",
        className
      )}
    />
  );
};
