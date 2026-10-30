"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  Sparkles,
  Download,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Cpu,
  User,
  ShieldAlert,
  Package,
  Truck,
  RotateCcw,
  XCircle,
  HelpCircle,
  UserCheck,
  RefreshCw,
  Globe,
  AlertTriangle,
  FileText
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBadge } from "@/components/ui/GradientBadge";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useUser } from "@/context/UserContext";
import {
  sendChatMessage,
  submitFeedback,
  sendHumanReply,
  resolveConversation,
  cancelOrder,
  returnOrder,
  SupportWorkflowState,
  OrderRecord,
  TicketRecord
} from "@/lib/api";

interface Message {
  id: string;
  sender: 'user' | 'ai' | 'human_agent' | 'system';
  text: string;
  timestamp: string;
  intent?: string;
  confidence?: number;
  confidenceLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  emotion?: string;
  urgency?: string;
  escalated?: boolean;
  order?: OrderRecord | null;
  ticket?: TicketRecord | null;
  groundedSources?: string[];
  entities?: Record<string, any>;
  state?: SupportWorkflowState;
  feedback?: 'like' | 'dislike' | null;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm-init',
    sender: 'ai',
    text: "Hello Elena! I am Aegis Autonomous Customer Support Agent. I can assist you with order status, tracking, cancellations, returns, refunds, technical issues, and billing. How can I help you today?",
    timestamp: "12:00 PM",
    intent: "GENERAL_INFORMATION",
    confidence: 100,
    confidenceLevel: "HIGH",
    emotion: "POSITIVE",
    urgency: "NORMAL"
  }
];

const QUICK_SUGGESTIONS = [
  "Where is my order?",
  "It's ORD-12345",
  "Can I cancel it?",
  "Can I return my product?",
  "I want to speak with a human support agent.",
  "Payment failed during checkout with error 500."
];

export default function ChatbotPage() {
  const { profile } = useUser();
  const [conversationId, setConversationId] = useState<string>(`CONV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'ai',
      text: `Hello ${profile.name}! I am Aegis Autonomous Customer Support Agent. I can assist you with order status, tracking, cancellations, returns, refunds, technical issues, and billing. How can I help you today?`,
      timestamp: "12:00 PM",
      intent: "GENERAL_INFORMATION",
      confidence: 100,
      confidenceLevel: "HIGH",
      emotion: "POSITIVE",
      urgency: "NORMAL"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [workflowStatusText, setWorkflowStatusText] = useState("AI Ready");

  // Active Telemetry State
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [activeIntent, setActiveIntent] = useState<string>("GENERAL_INFORMATION");
  const [activeConfidence, setActiveConfidence] = useState<number>(99.4);
  const [activeConfidenceLevel, setActiveConfidenceLevel] = useState<'HIGH' | 'MEDIUM' | 'LOW'>("HIGH");
  const [activeSentiment, setActiveSentiment] = useState<string>("POSITIVE");
  const [activeUrgency, setActiveUrgency] = useState<string>("NORMAL");
  const [activeLanguage, setActiveLanguage] = useState<string>("English");
  const [activeEntities, setActiveEntities] = useState<Record<string, any>>({});
  const [activeSources, setActiveSources] = useState<string[]>([]);
  const [activeState, setActiveState] = useState<SupportWorkflowState>("IDLE");

  // Human Agent Takeover Mode State
  const [humanTakeoverMode, setHumanTakeoverMode] = useState<boolean>(false);
  const humanAgentName = `${profile.name} (${profile.role || "Head of Support"})`;
  const [activeTicket, setActiveTicket] = useState<TicketRecord | null>(null);

  // Sync greeting when profile name changes
  useEffect(() => {
    setMessages(prev => prev.map(m => {
      if (m.id === 'm-init') {
        return {
          ...m,
          text: `Hello ${profile.name}! I am Aegis Autonomous Customer Support Agent. I can assist you with order status, tracking, cancellations, returns, refunds, technical issues, and billing. How can I help you today?`
        };
      }
      return m;
    }));
  }, [profile.name]);

  const startNewConversation = () => {
    const newId = `CONV-${Math.floor(1000 + Math.random() * 9000)}`;
    setConversationId(newId);
    setMessages([
      {
        id: `m-init-${Date.now()}`,
        sender: 'ai',
        text: "New session started. How can I assist you with your order, billing, or support request today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: "GENERAL_INFORMATION",
        confidence: 100,
        confidenceLevel: "HIGH",
        emotion: "POSITIVE",
        urgency: "NORMAL"
      }
    ]);
    setActiveState("IDLE");
    setActiveIntent("GENERAL_INFORMATION");
    setActiveEntities({});
    setActiveSources([]);
    setActiveTicket(null);
    setHumanTakeoverMode(false);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    if (!textToSend) setInput("");

    // If human agent mode is active, send as human agent message
    if (humanTakeoverMode) {
      const humanMsg: Message = {
        id: `human-${Date.now()}`,
        sender: 'human_agent',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, humanMsg]);
      try {
        await sendHumanReply(conversationId, query, humanAgentName);
      } catch (e) {
        console.error("Failed to send human reply:", e);
      }
      return;
    }

    // Customer User Message
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setActiveState("PROCESSING");
    setWorkflowStatusText("AI is validating input & detecting intent...");

    try {
      // Step-by-step UI state transition animation
      setTimeout(() => {
        setWorkflowStatusText("Searching Knowledge Base & Calling Business Services...");
      }, 350);

      const res = await sendChatMessage(query, {
        conversationId,
        customerId: "CUST-104",
        language: selectedLanguage
      });

      // Update telemetry
      setActiveIntent(res.intent || "GENERAL_INFORMATION");
      setActiveConfidence(res.intent_confidence || 95.0);
      setActiveConfidenceLevel(res.confidence_level || "HIGH");
      setActiveSentiment(res.sentiment || "NEUTRAL");
      setActiveUrgency(res.urgency || "NORMAL");
      setActiveLanguage(res.language?.language_name || "English");
      setActiveEntities(res.entities || {});
      setActiveSources(res.grounded_sources || []);
      setActiveState(res.state || "ANSWERED");

      if (res.ticket) {
        setActiveTicket(res.ticket);
      }

      setIsTyping(false);
      setWorkflowStatusText("AI Response Ready");

      const aiMsg: Message = {
        id: res.message_id || `ai-${Date.now()}`,
        sender: 'ai',
        text: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: res.intent,
        confidence: res.intent_confidence,
        confidenceLevel: res.confidence_level,
        emotion: res.sentiment,
        urgency: res.urgency,
        escalated: res.escalated,
        order: res.order,
        ticket: res.ticket,
        groundedSources: res.grounded_sources,
        entities: res.entities,
        state: res.state
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setIsTyping(false);
      setActiveState("ERROR");
      setWorkflowStatusText("Error connecting to backend");
    }
  };

  const handleFeedback = async (messageId: string, rating: 'like' | 'dislike') => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback: rating } : m));
    try {
      await submitFeedback({
        conversation_id: conversationId,
        message_id: messageId,
        rating,
        comment: rating === 'like' ? 'Helpful and accurate answer' : 'Could be improved'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickCancelOrder = async (orderId: string) => {
    setIsTyping(true);
    try {
      const cancelRes = await cancelOrder(orderId);
      setIsTyping(false);
      const text = cancelRes.success
        ? `Order #${orderId} was successfully cancelled. Full refund authorized.`
        : `Order #${orderId} cannot be cancelled in-transit: ${cancelRes.reason}`;

      setMessages(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'system',
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {
      setIsTyping(false);
    }
  };

  const handleQuickReturnOrder = async (orderId: string) => {
    setIsTyping(true);
    try {
      const retRes = await returnOrder(orderId);
      setIsTyping(false);
      const text = retRes.success
        ? `Return Authorization #${retRes.rma_code} generated for Order #${orderId}. Prepaid return label emailed.`
        : `Unable to initiate return for Order #${orderId}: ${retRes.reason}`;

      setMessages(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'system',
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {
      setIsTyping(false);
    }
  };

  const handleResolveConversation = async () => {
    try {
      await resolveConversation(conversationId);
      setActiveState("RESOLVED");
      setHumanTakeoverMode(false);
      setMessages(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'system',
          text: "✅ This support session has been officially marked as RESOLVED by the support supervisor. The customer satisfaction survey has been dispatched.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const exportChat = () => {
    const chatText = messages.map(m => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.text}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis-support-transcript-${conversationId}.txt`;
    a.click();
  };

  const getStateBadgeColor = (st: SupportWorkflowState) => {
    switch (st) {
      case 'ANSWERED': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'CLARIFICATION_REQUIRED': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'ACTION_REQUIRED': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'ESCALATED_TO_HUMAN':
      case 'HUMAN_AGENT_ACTIVE': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'TICKET_CREATED': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'RESOLVED': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'ERROR':
      case 'UNABLE_TO_VERIFY': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Navbar
        title="Enterprise Conversational AI Support Agent"
        subtitle="End-to-End Decision Engine • Real Database Integration • Human Escalation"
      />

      {/* Human Agent Active Banner */}
      {humanTakeoverMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md flex items-center justify-between gap-4 text-xs font-semibold"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Human Agent Takeover Mode Active ({humanAgentName}) — AI Auto-reply is paused for this session.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResolveConversation}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all"
            >
              Mark Resolved
            </button>
            <button
              onClick={() => setHumanTakeoverMode(false)}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold transition-all"
            >
              Resume AI
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Real-time Telemetry & Grounding Matrix */}
        <div className="space-y-6 lg:col-span-1">
          <GlassCard glowColor="indigo" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Live Support Telemetry</h3>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStateBadgeColor(activeState)}`}>
                {activeState}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Session ID & Language */}
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Session ID</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">{conversationId}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1 justify-end">
                    <Globe className="w-3 h-3 text-indigo-500" /> Language
                  </span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="mt-0.5 text-[11px] font-bold text-indigo-700 bg-white border border-indigo-200 rounded-lg px-1.5 py-0.5 focus:outline-none"
                  >
                    <option value="en">English (EN)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="es">Spanish (ES)</option>
                    <option value="fr">French (FR)</option>
                    <option value="de">German (DE)</option>
                  </select>
                </div>
              </div>

              {/* Detected Intent */}
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Detected Intent</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-200/60 text-indigo-800">
                    {activeConfidenceLevel} CONFIDENCE
                  </span>
                </div>
                <div className="font-extrabold text-indigo-700 text-sm">
                  {activeIntent}
                </div>
                <div className="w-full bg-indigo-200/60 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${activeConfidence}%` }} />
                </div>
              </div>

              {/* Sentiment & Urgency */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-cyan-50/60 border border-cyan-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sentiment</span>
                  <span className={`font-bold text-xs ${
                    activeSentiment === 'ANGRY' || activeSentiment === 'FRUSTRATED'
                      ? 'text-rose-600'
                      : activeSentiment === 'POSITIVE' ? 'text-emerald-600' : 'text-cyan-700'
                  }`}>
                    {activeSentiment}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Urgency</span>
                  <span className={`font-bold text-xs ${
                    activeUrgency === 'CRITICAL' || activeUrgency === 'HIGH' ? 'text-rose-600' : 'text-slate-700'
                  }`}>
                    {activeUrgency}
                  </span>
                </div>
              </div>

              {/* Extracted Entities */}
              {Object.keys(activeEntities).length > 0 && (
                <div className="p-3 rounded-xl bg-white border border-indigo-100 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Extracted Entities</span>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(activeEntities).map(([k, v]) => (
                      <span key={k} className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-mono">
                        {k}: <strong>{String(v)}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Grounded Evidence Sources */}
              {activeSources.length > 0 && (
                <div className="p-3 rounded-xl bg-white border border-indigo-100 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1">
                    <FileText className="w-3 h-3 text-indigo-500" /> Grounded Evidence
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {activeSources.map((s, idx) => (
                      <li key={idx} className="line-clamp-1 text-slate-700 font-medium">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-indigo-100 flex gap-2">
              <button
                onClick={startNewConversation}
                className="flex-1 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> New Session
              </button>
              <button
                onClick={() => setHumanTakeoverMode(!humanTakeoverMode)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  humanTakeoverMode
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" /> {humanTakeoverMode ? "Agent Active" : "Takeover"}
              </button>
            </div>
          </GlassCard>

          {/* Quick Support Suggestions */}
          <GlassCard glowColor="cyan" className="space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Test Support Queries</h3>
            <div className="space-y-2">
              {QUICK_SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="w-full p-2.5 rounded-xl bg-white border border-indigo-100 hover:border-indigo-300 text-left text-xs font-medium text-slate-700 hover:text-indigo-600 transition-all shadow-2xs leading-snug"
                >
                  {q}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Main Chat Workspace */}
        <div className="lg:col-span-3">
          <GlassCard glowColor="indigo" className="p-6 h-[700px] flex flex-col justify-between space-y-4">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-glow-indigo">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    Aegis Support Intelligence Pipeline
                    <GradientBadge variant="emerald" size="sm" icon={<CheckCircle2 className="w-2.5 h-2.5" />}>
                      Online & Grounded
                    </GradientBadge>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    FastAPI • scikit-learn NLU • SQLite Central Orders DB
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  {workflowStatusText}
                </span>
                <button
                  onClick={exportChat}
                  className="p-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export Log
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                const isHumanAgent = m.sender === 'human_agent';
                const isSystem = m.sender === 'system';

                if (isSystem) {
                  return (
                    <div key={m.id} className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-center text-xs text-slate-600 font-medium my-2">
                      {m.text}
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${
                      isUser
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                        : isHumanAgent
                        ? 'bg-gradient-to-tr from-amber-500 to-orange-500 ring-2 ring-amber-300'
                        : 'bg-gradient-to-tr from-indigo-600 to-cyan-400'
                    }`}>
                      {isUser ? <User className="w-4 h-4" /> : isHumanAgent ? <UserCheck className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`max-w-[82%] space-y-2 ${isUser ? 'text-right' : ''}`}>
                      {/* Message Bubble */}
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-tr-none shadow-md font-medium'
                          : isHumanAgent
                          ? 'bg-amber-50 border border-amber-200 text-slate-800 rounded-tl-none font-medium'
                          : 'bg-white border border-indigo-100 text-slate-800 rounded-tl-none shadow-sm'
                      }`}>
                        {isHumanAgent && (
                          <div className="text-[10px] text-amber-700 font-bold mb-1 uppercase tracking-wider flex items-center gap-1">
                            <UserCheck className="w-3 h-3" /> Live Support Specialist ({profile.name})
                          </div>
                        )}
                        {m.text}

                        {/* Embedded Order Card */}
                        {m.order && (
                          <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-left space-y-2">
                            <div className="flex items-center justify-between pb-1.5 border-b border-indigo-200/60">
                              <span className="font-extrabold text-indigo-900 text-xs flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5 text-indigo-600" />
                                {m.order.order_id} • {m.order.product_name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                                {m.order.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Carrier & Tracking</span>
                                <span className="font-semibold text-slate-800 flex items-center gap-1">
                                  <Truck className="w-3 h-3 text-cyan-600" /> {m.order.carrier} ({m.order.tracking_number || "Pending"})
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Delivery Estimate</span>
                                <span className="font-semibold text-slate-800">{m.order.estimated_delivery}</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-indigo-200/60 flex gap-2">
                              {m.order.cancel_eligible === 1 && (
                                <button
                                  onClick={() => handleQuickCancelOrder(m.order!.order_id)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-[10px] font-bold transition-all flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" /> Cancel Order
                                </button>
                              )}
                              {m.order.return_eligible === 1 && (
                                <button
                                  onClick={() => handleQuickReturnOrder(m.order!.order_id)}
                                  className="px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 hover:bg-cyan-100 text-[10px] font-bold transition-all flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" /> Request Return
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Embedded Ticket Card */}
                        {m.ticket && (
                          <div className="mt-3 p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-left space-y-1.5">
                            <div className="flex items-center justify-between pb-1 border-b border-purple-200/60">
                              <span className="font-extrabold text-purple-900 text-xs flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                                Escalation Ticket #{m.ticket.ticket_id}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                                {m.ticket.priority}
                              </span>
                            </div>
                            <p className="text-[11px] text-purple-800 font-medium">
                              <strong>Subject:</strong> {m.ticket.subject}
                            </p>
                            <div className="text-[10px] text-slate-500 flex justify-between">
                              <span>Assigned: <strong>{m.ticket.assigned_agent}</strong></span>
                              <span>Status: <strong>{m.ticket.status}</strong></span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Telemetry & Feedback */}
                      {m.sender === 'ai' && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium pt-0.5">
                          {m.intent && (
                            <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                              Intent: {m.intent} ({m.confidence}%)
                            </span>
                          )}
                          {m.emotion && <span>• Sentiment: {m.emotion}</span>}

                          <div className="flex items-center gap-1 ml-auto">
                            <button
                              onClick={() => handleFeedback(m.id, 'like')}
                              className={`p-1 rounded hover:bg-indigo-50 transition-colors ${
                                m.feedback === 'like' ? 'text-emerald-600 font-bold bg-emerald-50' : 'text-slate-400'
                              }`}
                              title="Helpful Answer"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(m.id, 'dislike')}
                              className={`p-1 rounded hover:bg-rose-50 transition-colors ${
                                m.feedback === 'dislike' ? 'text-rose-600 font-bold bg-rose-50' : 'text-slate-400'
                              }`}
                              title="Needs Improvement"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold p-2 bg-indigo-50/50 rounded-xl w-fit">
                  <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
                  {workflowStatusText}
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  humanTakeoverMode
                    ? `Type reply as Human Support Specialist (${profile.name})...`
                    : "Type your support request or order question (e.g. 'Where is my order?')..."
                }
                className={`flex-1 px-4 py-3 rounded-2xl border text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-inner ${
                  humanTakeoverMode
                    ? 'bg-amber-50/60 border-amber-200 text-amber-950 focus:ring-amber-400/50 focus:bg-white'
                    : 'bg-indigo-50/40 border-indigo-100 text-slate-800 focus:ring-indigo-400/50 focus:bg-white'
                }`}
              />
              <AnimatedButton
                type="submit"
                variant={humanTakeoverMode ? "secondary" : "primary"}
                size="md"
                icon={<Send className="w-4 h-4" />}
              >
                {humanTakeoverMode ? "Send as Agent" : "Send"}
              </AnimatedButton>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
