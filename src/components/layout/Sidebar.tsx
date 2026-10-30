"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bot,
  Layers,
  Sparkles,
  Smile,
  Mic,
  Zap,
  ArrowRight,
  LogOut,
  Edit3,
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

const NAV_ITEMS = [
  { name: "ML Chatbot", href: "/dashboard/chatbot", icon: Bot, badge: "Feature 01" },
  { name: "Ticket Classification", href: "/dashboard/ticket-classification", icon: Layers, badge: "Feature 02" },
  { name: "AI Auto Replies", href: "/dashboard/auto-replies", icon: Sparkles, badge: "Feature 03" },
  { name: "Sentiment Analysis", href: "/dashboard/sentiment-analysis", icon: Smile, badge: "Feature 05" },
  { name: "Voice Support", href: "/dashboard/voice-support", icon: Mic, badge: "Feature 06" },
  { name: "Agent Profile", href: "/dashboard/profile", icon: UserCircle, badge: "Account" },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { profile, openEditModal, logout } = useUser();

  return (
    <aside className="fixed top-4 left-4 bottom-4 w-72 z-30 hidden lg:flex flex-col rounded-3xl bg-white/70 backdrop-blur-2xl border border-indigo-100/80 shadow-glass overflow-hidden">
      {/* Brand Header */}
      <div className="p-6 pb-4 border-b border-indigo-100/60 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-glow-indigo text-white font-black text-xl group-hover:scale-105 transition-transform duration-300">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight text-gradient-primary">Aegis AI</div>
            <div className="text-[10px] font-semibold tracking-wider text-indigo-500 uppercase">Enterprise Support</div>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "relative flex items-center justify-between px-3.5 py-3 rounded-2xl font-medium text-sm transition-all duration-200 group",
                  isActive
                    ? "text-indigo-900 font-semibold"
                    : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarPill"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-100/90 via-blue-50/80 to-cyan-50/90 border border-indigo-200/80 shadow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-xl transition-colors duration-200",
                      isActive
                        ? "bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-sm"
                        : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "relative z-10 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs",
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-400"
                        : "bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-100"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Floating Card Promotion */}
      <div className="p-4">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 p-4 text-white shadow-glow-indigo relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="text-xs font-semibold text-cyan-200 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ML Model Status
          </div>
          <div className="font-bold text-sm mb-2">scikit-learn ML Engine</div>
          <div className="text-[11px] text-indigo-100/90 mb-3">99.4% Intent Accuracy • 12ms Response</div>
          <Link href="/dashboard/chatbot">
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-white/30">
              Launch ML Chatbot <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>

      {/* Footer Profile Mini Bar */}
      <div className="p-3 mx-3 mb-3 rounded-2xl bg-gradient-to-r from-slate-50/90 to-indigo-50/50 border border-indigo-100/80 flex items-center justify-between gap-2 shadow-2xs group/profile">
        {/* Interactive Profile Area */}
        <button
          type="button"
          onClick={openEditModal}
          className="flex items-center gap-2.5 text-left flex-1 min-w-0 p-1 -m-1 rounded-xl hover:bg-white/90 transition-all cursor-pointer group"
          title="Click to edit profile"
        >
          <div className="relative shrink-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-9 h-9 rounded-full ring-2 ring-indigo-400/50 object-cover group-hover:ring-indigo-600 transition-all"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
              {profile.name}
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate">
              {profile.role}
            </div>
          </div>
        </button>

        {/* Action Buttons: Edit Profile and Log Out */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={openEditModal}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            title="Edit Profile"
            aria-label="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Log out and go to Home page"
            aria-label="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
