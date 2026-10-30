"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Bell, Sparkles, Command, ShieldAlert, Cpu, User, LogOut, Edit3 } from "lucide-react";
import { GradientBadge } from "../ui/GradientBadge";
import { NotificationsDrawer } from "./NotificationsDrawer";
import { useUser } from "@/context/UserContext";
import { GoogleTranslate } from "@/components/common/GoogleTranslate";

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  title = "Customer Operations & AI Intelligence",
  subtitle = "Real-time Machine Learning Ticket Automation Hub"
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { profile, openEditModal, logout } = useUser();

  return (
    <>
      <header className="sticky top-4 z-20 mb-6 flex items-center justify-between gap-4 rounded-3xl bg-white/70 backdrop-blur-2xl border border-indigo-100/80 p-4 px-6 shadow-glass">
        {/* Left Titles */}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">{title}</h1>
            <GradientBadge variant="indigo" icon={<Cpu className="w-3 h-3" />}>
              99.4% Accuracy
            </GradientBadge>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
        </div>

        {/* Right Search & Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <input
              type="text"
              placeholder="Semantic search tickets, KB, models..."
              value=""
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 lg:w-80 pl-10 pr-10 py-2 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-800 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-100/80 text-[10px] font-bold text-indigo-600">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </div>

          {/* Quick AI Trigger */}
          <button className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-teal-500/10 border border-indigo-200/60 text-indigo-700 text-xs font-semibold hover:scale-105 transition-all">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            AI Auto Dispatch
          </button>

          {/* Notification Icon */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2.5 rounded-2xl bg-white border border-indigo-100 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500" />
          </button>

          {/* Website Translation (Google Translate) */}
          <GoogleTranslate variant="navbar" />

          {/* User Profile Quick Action & Edit Button */}
          <button
            onClick={openEditModal}
            className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-2xl bg-white/90 border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 transition-all shadow-xs group"
            title="Click to edit profile"
          >
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-7 h-7 rounded-xl object-cover ring-1 ring-indigo-400/40 group-hover:ring-indigo-600 transition-all"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white bg-emerald-500" />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                {profile.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-none">
                Edit Profile
              </span>
            </div>
          </button>
        </div>
      </header>

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
};
