"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, Radio, Send, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBadge } from "@/components/ui/GradientBadge";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { processVoiceTranscript } from "@/lib/api";
import { useUser } from "@/context/UserContext";

interface CallLog {
  id: number;
  caller: string;
  duration: string;
  topic: string;
  sentiment: string;
  time: string;
}

export default function VoiceSupportPage() {
  const { profile } = useUser();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("Click microphone button to record your voice request...");
  const [customText, setCustomText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [detectedPriority, setDetectedPriority] = useState<string | null>(null);
  const [isBrowserSpeechSupported, setIsBrowserSpeechSupported] = useState(false);
  const [callHistory, setCallHistory] = useState<CallLog[]>([
    { id: 1, caller: 'Sarah Jenkins', duration: '1m 42s', topic: 'Order Delivery Delay', sentiment: 'Neutral', time: '10:14 AM' },
    { id: 2, caller: 'Alex Rivera', duration: '2m 10s', topic: 'Payment Failure Checkout', sentiment: 'Frustrated', time: '11:30 AM' },
  ]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsBrowserSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onend = async () => {
          setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition notice:", event.error);
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleProcessText = async (text: string) => {
    if (!text.trim()) return;
    try {
      const res = await processVoiceTranscript(text);
      setAiResponse(res.ai_response);
      setDetectedCategory(res.category);
      setDetectedPriority(res.priority);

      // Auto speak response
      speakText(res.ai_response);

      // Add to call history
      const newLog: CallLog = {
        id: Date.now(),
        caller: profile.name,
        duration: "0m 35s",
        topic: res.category || "General Support",
        sentiment: res.sentiment || "Neutral",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setCallHistory(prev => [newLog, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTranscript("Listening... Please speak now.");

      if (isBrowserSpeechSupported && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          return;
        } catch (e) {
          console.warn("Could not start native recognition, using audio simulation fallback:", e);
        }
      }

      // Safe simulation fallback when browser microphone is blocked or not available
      const sample = "Where is my package? The tracking number has not updated for 3 days.";
      setTimeout(async () => {
        setIsRecording(false);
        setTranscript(sample);
        await handleProcessText(sample);
      }, 2500);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
      if (transcript && transcript !== "Listening... Please speak now.") {
        handleProcessText(transcript);
      }
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = 1.0;
      speech.pitch = 1.0;
      setAgentSpeaking(true);
      speech.onend = () => setAgentSpeaking(false);
      speech.onerror = () => setAgentSpeaking(false);
      window.speechSynthesis.speak(speech);
    } else {
      setAgentSpeaking(true);
      setTimeout(() => setAgentSpeaking(false), 2000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    setTranscript(customText);
    handleProcessText(customText);
    setCustomText("");
  };

  return (
    <div className="space-y-6 pb-12">
      <Navbar
        title="Voice Support & Audio Intelligence"
        subtitle="Speech-to-Text → NLP ML Pipeline (Intent, Sentiment, Ticket Classification, Resolution)"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Microphone Visualizer & Transcription */}
        <GlassCard glowColor="indigo" className="lg:col-span-2 space-y-6 text-center flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-base">Live Speech-to-Text Studio</h3>
            </div>
            <GradientBadge variant="indigo" icon={<Radio className="w-3 h-3 text-rose-500 animate-ping" />}>
              {isRecording ? "Listening Live" : "Mic Standby"}
            </GradientBadge>
          </div>

          {/* Microphone Central Hub */}
          <div className="py-6 space-y-6">
            <div className="relative inline-block">
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-indigo-400/30 animate-ping" />
              )}
              <button
                onClick={toggleRecording}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
                  isRecording
                    ? "bg-gradient-to-tr from-rose-500 to-pink-600 scale-110 shadow-glow-purple"
                    : "bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 hover:scale-105 shadow-glow-indigo"
                }`}
                title={isRecording ? "Stop recording" : "Start speaking"}
              >
                {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>
            </div>

            {/* Audio Wave Equalizer */}
            <div className="flex items-center justify-center gap-1.5 h-12">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-cyan-400 transition-all duration-200 ${
                    isRecording || agentSpeaking ? "animate-wave" : "h-3 opacity-30"
                  }`}
                  style={{
                    animationDelay: `${i * 0.08}s`,
                    height: isRecording || agentSpeaking ? `${Math.floor(Math.random() * 35) + 12}px` : "12px"
                  }}
                />
              ))}
            </div>

            {/* Live Transcription Box */}
            <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 max-w-xl mx-auto space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Live Speech Transcription</span>
              <p className="text-xs font-medium text-slate-800 leading-relaxed italic">{transcript}</p>
              {aiResponse && (
                <div className="pt-2 text-xs font-bold text-indigo-700">
                  ML Response: &ldquo;{aiResponse}&rdquo;
                </div>
              )}
              {detectedCategory && (
                <div className="pt-1 flex items-center justify-center gap-2 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">{detectedCategory}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">{detectedPriority}</span>
                </div>
              )}
            </div>

            {/* Manual text input option */}
            <form onSubmit={handleManualSubmit} className="max-w-md mx-auto flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Or type speech transcript manually..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-indigo-100 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" /> Process
              </button>
            </form>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-indigo-100 flex flex-wrap items-center justify-center gap-4">
            <AnimatedButton
              onClick={() => speakText(aiResponse || "Aegis AI Customer Support Voice Engine is active.")}
              variant="primary"
              size="md"
              loading={agentSpeaking}
              icon={<Volume2 className="w-4 h-4" />}
            >
              Synthesize AI Vocal Response
            </AnimatedButton>
          </div>
        </GlassCard>

        {/* Right Col: Voice Call Logs */}
        <GlassCard glowColor="cyan" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
            <h3 className="font-bold text-slate-800 text-base">Voice Call Logs</h3>
            <span className="text-xs font-mono font-bold text-indigo-600">{callHistory.length} Active Logs</span>
          </div>

          <div className="space-y-3">
            {callHistory.map((call) => (
              <div key={call.id} className="p-4 rounded-2xl bg-white border border-indigo-100 space-y-1.5 hover:border-indigo-300 transition-all shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{call.caller}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{call.time}</span>
                </div>
                <div className="text-xs font-medium text-slate-600">{call.topic}</div>
                <div className="flex items-center justify-between text-[10px] pt-1">
                  <span className="text-slate-400 font-medium">Duration: {call.duration}</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold">{call.sentiment}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
