"use client";

import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck, ArrowRight, User } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { GoogleTranslate } from "@/components/common/GoogleTranslate";

export const LandingNavbar: React.FC = () => {
  const { profile, openEditModal } = useUser();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/60 border-b border-indigo-100/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-glow-indigo group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold text-slate-950 tracking-tight flex items-center gap-1.5">
              <span>Aegis AI</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">7.0</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium -mt-0.5 hidden sm:block">Enterprise Support Intelligence</div>
          </div>
        </Link>

        {/* Center Quick Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-700">
          <Link href="#features" className="hover:text-indigo-600 transition-colors">
            Features
          </Link>
          <Link href="#workflow" className="hover:text-indigo-600 transition-colors">
            Architecture
          </Link>
          <Link href="#faq" className="hover:text-indigo-600 transition-colors">
            FAQ
          </Link>
          <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
        </nav>

        {/* Right Actions: Google Translate + Account Profile Badge */}
        <div className="flex items-center gap-3">
          {/* Google Translate Selector */}
          <GoogleTranslate variant="navbar" />

          {/* Synchronized Account Profile Button */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 hover:bg-white border border-indigo-100 hover:border-indigo-300 shadow-xs transition-all text-xs font-bold text-slate-800 group"
            title={`Logged in as ${profile.name}`}
          >
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-6 h-6 rounded-lg object-cover ring-1 ring-indigo-400 group-hover:ring-indigo-600 transition-all"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
            </div>
            <span className="hidden sm:inline truncate max-w-[120px]">{profile.name}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>
    </header>
  );
};

