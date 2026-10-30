"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Briefcase,
  Building,
  Phone,
  Check,
  RotateCcw,
  Sparkles,
  Camera,
  Globe
} from "lucide-react";
import confetti from "canvas-confetti";
import { useUser, AVATAR_PRESETS } from "@/context/UserContext";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export const EditProfileModal: React.FC = () => {
  const { profile, updateProfile, resetProfile, isEditModalOpen, closeEditModal } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    avatar: "",
    department: "",
    phone: "",
    bio: "",
    timezone: "",
    status: "Online" as "Online" | "Away" | "Busy" | "Offline",
  });

  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Sync form with profile whenever modal opens or profile changes
  useEffect(() => {
    if (isEditModalOpen) {
      setFormData({
        name: profile.name,
        role: profile.role,
        email: profile.email,
        avatar: profile.avatar,
        department: profile.department || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        timezone: profile.timezone || "Pacific Time (PT) - UTC-8",
        status: profile.status || "Online",
      });
      setIsSaved(false);
    }
  }, [isEditModalOpen, profile]);

  if (!isEditModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsSaved(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
      });
    } catch (err) {
      // ignore
    }

    setTimeout(() => {
      closeEditModal();
      setIsSaved(false);
    }, 600);
  };

  const handleReset = () => {
    resetProfile();
    closeEditModal();
  };

  const selectAvatar = (url: string) => {
    setFormData((prev) => ({ ...prev, avatar: url }));
  };

  const applyCustomAvatar = () => {
    if (customAvatarUrl.trim()) {
      selectAvatar(customAvatarUrl.trim());
      setShowCustomUrlInput(false);
      setCustomAvatarUrl("");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeEditModal}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-xl rounded-3xl bg-white/95 backdrop-blur-2xl border border-indigo-100 shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="relative p-6 pb-4 border-b border-indigo-100/70 bg-gradient-to-r from-indigo-50/70 via-white to-cyan-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-glow-indigo">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
                    Edit Profile
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Update your agent identity, credentials & details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin">
            {/* Avatar Section */}
            <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Agent Avatar & Presets
              </label>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <img
                    src={formData.avatar}
                    alt="Profile Preview"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Choose from photo presets
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectAvatar(preset)}
                        className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition-all ${
                          formData.avatar === preset
                            ? "border-indigo-600 ring-2 ring-indigo-400/50 scale-105"
                            : "border-transparent hover:border-indigo-300 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img src={preset} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                      className="px-2.5 py-1 rounded-xl bg-white border border-indigo-200 text-[10px] font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" /> URL
                    </button>
                  </div>
                </div>
              </div>

              {showCustomUrlInput && (
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    placeholder="Paste custom image link (https://...)"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                  />
                  <button
                    type="button"
                    onClick={applyCustomAvatar}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Elena Rostova"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all"
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Job Title / Role
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Head of Customer Support"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all"
                />
              </div>

              {/* Work Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" /> Work Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="elena.rostova@aegis-ai.io"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-500" /> Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Customer Operations & AI Ops"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 349-2810"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Live Availability
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all"
                >
                  <option value="Online">Online (Active Dispatch)</option>
                  <option value="Away">Away</option>
                  <option value="Busy">Busy (In Escalation)</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            </div>

            {/* Bio / Support Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" /> Professional Bio / Focus Area
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Spearheading autonomous customer tier-1 triage and automated AI workflows at Aegis."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <AnimatedButton
                  type="submit"
                  variant="gradient"
                  size="sm"
                  icon={isSaved ? <Check className="w-4 h-4" /> : undefined}
                >
                  {isSaved ? "Saved!" : "Save Changes"}
                </AnimatedButton>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
