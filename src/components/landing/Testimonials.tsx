"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

const LOGOS = ["Vercel", "Linear", "Stripe", "Notion", "Figma", "Intercom"];

const REVIEWS = [
  {
    quote: "Aegis ML reduced our first-response latency from 4 hours down to 12 milliseconds. Our customer CSAT score jumped to an unprecedented 4.96/5.0.",
    author: "Jessica Lin",
    role: "VP of Customer Operations",
    company: "Stripe Enterprise",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
  },
  {
    quote: "The ticket classification accuracy is phenomenal. It flags P1 outages instantly before human engineers even open their monitoring dashboards.",
    author: "Devon Vance",
    role: "Head of Infrastructure",
    company: "Linear Systems",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  {
    quote: "Our support agents love the auto-reply suggestions. 82% of all inbound billing queries are resolved with a single click.",
    author: "Amara Nwosu",
    role: "Support Lead",
    company: "Vercel Platform",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enterprise Logos Bar */}
        <div className="mb-20 text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Trusted by World-Class Engineering & Support Teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-75">
            {LOGOS.map((name, idx) => (
              <motion.span
                key={name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ scale: 1.1, color: "#6366F1" }}
                className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-700 font-sans cursor-pointer transition-colors"
              >
                {name}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Testimonial Cards with Motion Hover */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((r, index) => (
            <motion.div
              key={r.author}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <GlassCard glowColor="indigo" className="h-full flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed font-medium italic">
                    &ldquo;{r.quote}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-indigo-100">
                  <img
                    src={r.avatar}
                    alt={r.author}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-200"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-800">{r.author}</div>
                    <div className="text-xs text-slate-500 font-medium">{r.role} • <span className="text-indigo-600 font-semibold">{r.company}</span></div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
