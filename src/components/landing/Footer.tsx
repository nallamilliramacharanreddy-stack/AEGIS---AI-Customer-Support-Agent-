"use client";

import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-indigo-100 bg-white/60 backdrop-blur-xl py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-gradient-primary">Aegis AI</span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              World-Class Machine Learning Customer Support Agent platform engineered for high-scale enterprise SaaS teams.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">Modules</div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li><Link href="/dashboard/chatbot" className="hover:text-indigo-600 transition-colors">ML Chatbot</Link></li>
              <li><Link href="/dashboard/ticket-classification" className="hover:text-indigo-600 transition-colors">Classification</Link></li>
              <li><Link href="/dashboard/auto-replies" className="hover:text-indigo-600 transition-colors">Auto Replies</Link></li>
              <li><Link href="/dashboard/sentiment-analysis" className="hover:text-indigo-600 transition-colors">Sentiment Engine</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">Resources</div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li><Link href="/dashboard/knowledge-base" className="hover:text-indigo-600 transition-colors">Knowledge Base</Link></li>
              <li><Link href="/dashboard/voice-support" className="hover:text-indigo-600 transition-colors">Voice Support API</Link></li>
              <li><Link href="/dashboard/profile" className="hover:text-indigo-600 transition-colors">Agent Profile</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-indigo-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© {new Date().getFullYear()} Aegis AI SaaS Platform Inc. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
};
