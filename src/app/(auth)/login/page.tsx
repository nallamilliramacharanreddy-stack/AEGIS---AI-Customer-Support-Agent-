"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, ArrowRight, CheckCircle2, Shield, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { useUser } from "@/context/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { profile } = useUser();
  const [email, setEmail] = useState(profile.email || "elena.rostova@aegis-ai.io");
  const [password, setPassword] = useState("••••••••••••");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/50 to-cyan-50/40">
      {/* Background blobs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl -z-10 animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl -z-10 animate-float-delayed" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard glowColor="indigo" hoverScale={false} className="p-8 space-y-6">
          {/* Logo Header */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-glow-indigo">
                <Zap className="w-6 h-6" />
              </div>
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome to Aegis AI</h1>
            <p className="text-xs text-slate-500 font-medium">Enterprise ML Customer Support Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Work Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <a href="#" className="text-[11px] font-semibold text-indigo-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-400 border-indigo-200"
                />
                <span className="text-xs font-medium text-slate-600">Remember credentials</span>
              </label>
            </div>

            {/* Submit Button */}
            <AnimatedButton
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Operations Dashboard
            </AnimatedButton>
          </form>

          {/* Social SSO */}
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-indigo-100" /></div>
              <span className="relative px-3 bg-white text-[10px] uppercase font-bold text-slate-400">Or single sign-on</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleLogin}
                className="py-2.5 px-4 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <Shield className="w-4 h-4 text-indigo-600" /> Google SSO
              </button>
              <button
                type="button"
                onClick={handleLogin}
                className="py-2.5 px-4 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-cyan-600" /> Okta SAML
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-slate-500 font-medium">
            Don&apos;t have an enterprise workspace?{" "}
            <Link href="/register" className="font-bold text-indigo-600 hover:underline">
              Create account
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
