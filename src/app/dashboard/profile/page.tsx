"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Briefcase,
  Building,
  Phone,
  Globe,
  Shield,
  Key,
  CheckCircle2,
  Edit3,
  LogOut,
  Sparkles,
  Award,
  Clock,
  ThumbsUp,
  Cpu
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBadge } from "@/components/ui/GradientBadge";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useUser } from "@/context/UserContext";

export default function ProfilePage() {
  const { profile, updateProfile, openEditModal, logout } = useUser();
  const [activeTab, setActiveTab] = useState<"general" | "security" | "preferences">("general");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local state for direct form editing
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [department, setDepartment] = useState(profile.department);
  const [bio, setBio] = useState(profile.bio);

  // Synchronize form state whenever profile updates
  useEffect(() => {
    setName(profile.name);
    setRole(profile.role);
    setEmail(profile.email);
    setPhone(profile.phone);
    setDepartment(profile.department);
    setBio(profile.bio);
  }, [profile]);

  const handleSaveDirect = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      role,
      email,
      phone,
      department,
      bio,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <Navbar
        title="Agent Profile & Settings"
        subtitle="Manage your Aegis identity, permissions, and security parameters"
      />

      {/* Main Profile Header Card */}
      <GlassCard glowColor="indigo" hoverScale={false} className="p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-200/30 via-cyan-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-indigo-500/30 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-emerald-500 shadow-xs" />
              <button
                type="button"
                onClick={openEditModal}
                className="absolute inset-0 bg-slate-900/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold"
              >
                Change
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                  {profile.name}
                </h1>
                <GradientBadge variant="indigo" icon={<Shield className="w-3 h-3" />}>
                  {profile.status}
                </GradientBadge>
              </div>
              <p className="text-sm text-indigo-600 font-semibold">
                {profile.role} • <span className="text-slate-500 font-normal">{profile.department}</span>
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {profile.email} • {profile.phone}
              </p>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <AnimatedButton
              type="button"
              variant="gradient"
              size="md"
              onClick={openEditModal}
              icon={<Edit3 className="w-4 h-4" />}
              className="flex-1 md:flex-initial"
            >
              Edit Profile
            </AnimatedButton>

            <button
              type="button"
              onClick={logout}
              className="px-4 py-2.5 rounded-2xl border border-rose-200/80 bg-rose-50/60 hover:bg-rose-100/80 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs hover:scale-105"
              title="Log out and return to Home page"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </div>

        {/* Quick Agent Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-indigo-100/60">
          <div className="p-3.5 rounded-2xl bg-white/60 border border-indigo-100/60 shadow-2xs">
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold mb-1">
              <Award className="w-4 h-4" /> Resolved Tickets
            </div>
            <div className="text-xl font-extrabold text-slate-800">1,428</div>
            <div className="text-[10px] text-slate-400 font-medium">+12% this month</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/60 border border-indigo-100/60 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold mb-1">
              <ThumbsUp className="w-4 h-4" /> CSAT Satisfaction
            </div>
            <div className="text-xl font-extrabold text-slate-800">98.7%</div>
            <div className="text-[10px] text-slate-400 font-medium">Top 1% across org</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/60 border border-indigo-100/60 shadow-2xs">
            <div className="flex items-center gap-2 text-cyan-600 text-xs font-bold mb-1">
              <Clock className="w-4 h-4" /> Avg First Response
            </div>
            <div className="text-xl font-extrabold text-slate-800">48s</div>
            <div className="text-[10px] text-slate-400 font-medium">Real-time ML sync</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/60 border border-indigo-100/60 shadow-2xs">
            <div className="flex items-center gap-2 text-purple-600 text-xs font-bold mb-1">
              <Cpu className="w-4 h-4" /> AI Auto Co-pilot
            </div>
            <div className="text-xl font-extrabold text-slate-800">Active</div>
            <div className="text-[10px] text-slate-400 font-medium">Tier-1 autonomous</div>
          </div>
        </div>
      </GlassCard>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "general"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-indigo-600 hover:bg-white"
          }`}
        >
          General Information
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "security"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-indigo-600 hover:bg-white"
          }`}
        >
          Security & Access
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "preferences"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-indigo-600 hover:bg-white"
          }`}
        >
          AI & Dispatch Preferences
        </button>
      </div>

      {/* Tab 1: General Info */}
      {activeTab === "general" && (
        <GlassCard hoverScale={false} className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Personal & Agent Details</h2>
              <p className="text-xs text-slate-500">Update your public identity displayed across ticket resolutions</p>
            </div>
            <button
              type="button"
              onClick={openEditModal}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Quick Modal Editor
            </button>
          </div>

          <form onSubmit={handleSaveDirect} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Job Title
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-500" /> Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" /> Timezone
                </label>
                <input
                  type="text"
                  disabled
                  value={profile.timezone}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Bio & Operational Notes</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              {saveSuccess ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" /> Profile successfully updated!
                </div>
              ) : (
                <div />
              )}
              <AnimatedButton
                type="submit"
                variant="gradient"
                size="md"
              >
                Save Changes
              </AnimatedButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Tab 2: Security */}
      {activeTab === "security" && (
        <GlassCard hoverScale={false} className="p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800">Security & Authentication</h2>
            <p className="text-xs text-slate-500">Manage credentials, two-factor authentication, and active sessions</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Security Password</div>
                  <div className="text-[11px] text-slate-500">Last changed 14 days ago (AES-256 encrypted)</div>
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-white text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                Update Password
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Two-Factor Authentication (2FA)</div>
                  <div className="text-[11px] text-slate-500">Authenticator App enabled for enterprise tenant</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                Enabled
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-rose-800">Log Out All Sessions</div>
                <div className="text-[11px] text-rose-600/80">Revoke access tokens on all devices and return to home page</div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Log Out to Home
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab 3: AI Preferences */}
      {activeTab === "preferences" && (
        <GlassCard hoverScale={false} className="p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800">AI Agent & Workflow Automation</h2>
            <p className="text-xs text-slate-500">Fine-tune how machine learning models assist your support responses</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-indigo-100 bg-indigo-50/20">
              <div>
                <div className="text-xs font-bold text-slate-800">Autonomous Auto-Reply Suggestions</div>
                <div className="text-[11px] text-slate-500">Pre-generate AI drafted responses for tier-1 inquiries</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl border border-indigo-100 bg-indigo-50/20">
              <div>
                <div className="text-xs font-bold text-slate-800">Real-Time Sentiment Tone Alerting</div>
                <div className="text-[11px] text-slate-500">Trigger visual alert when customer sentiment turns Frustrated or Angry</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl border border-indigo-100 bg-indigo-50/20">
              <div>
                <div className="text-xs font-bold text-slate-800">Instant Audio Notification</div>
                <div className="text-[11px] text-slate-500">Play chime when VIP ticket is classified</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
