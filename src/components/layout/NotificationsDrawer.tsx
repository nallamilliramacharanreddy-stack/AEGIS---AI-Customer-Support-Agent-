"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Zap, Bot, ShieldCheck } from "lucide-react";
import { GradientBadge } from "../ui/GradientBadge";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NOTIFICATIONS = [
  {
    id: 'n-1',
    title: 'High-Confidence Auto-Resolution',
    message: 'Ticket #TCK-9403 resolved automatically via SAML SSO KB matching algorithm (99.1% precision).',
    time: '2 mins ago',
    type: 'success',
    icon: CheckCircle2
  },
  {
    id: 'n-2',
    title: 'Urgent Sentiment Alert Triggered',
    message: 'Ticket #TCK-9401 flagged as P1 Critical with Angry sentiment. Assigned to On-Call Manager.',
    time: '14 mins ago',
    type: 'alert',
    icon: AlertTriangle
  },
  {
    id: 'n-3',
    title: 'ML Model Auto-Retrained',
    message: 'Dataset batch #DS-882 processed. Naive Bayes classification threshold improved by +0.4%.',
    time: '1 hour ago',
    type: 'info',
    icon: Bot
  }
];

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed top-0 right-0 bottom-0 w-96 max-w-full z-50 bg-white/90 backdrop-blur-2xl border-l border-indigo-100 p-6 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between pb-4 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">AI Event Telemetry</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {NOTIFICATIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 hover:bg-indigo-50/80 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold text-xs text-slate-800">{item.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-indigo-100">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors"
              >
                Dismiss Telemetry Drawer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
