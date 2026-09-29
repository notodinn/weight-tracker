'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header/Header';
import { getStoredDays, getStoredHistory, getStoredCheckins } from '@/lib/storage/store';
import { getStoredWeightHistory, getStoredProfile } from '@/lib/storage/biometricsStore';
import { calculateOverallStrengthScore, detectStalledExercises } from '@/lib/strength/engine';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'coach';
  content: string;
  createdAt: string;
}

const QUICK_ACTIONS = [
  'WEEKLY REVIEW',
  'WHAT SHOULD I INCREASE',
  'PROJECT MY GOALS',
  'WHY AM I STALLING',
  'PLAN A DELOAD',
];

export default function CoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [stalledInfo, setStalledInfo] = useState<string>('None');

  useEffect(() => {
    const days = getStoredDays();
    const history = getStoredHistory();
    const bwHistory = getStoredWeightHistory();
    const profile = getStoredProfile();

    const exercises = days.flatMap((d) => d.program_exercises.map((pe) => pe.exercise));
    const programExercises = days.flatMap((d) => d.program_exercises);

    const latestBw = bwHistory[0]?.weight_kg || profile.target_weight_kg || 80;
    const { overallScore: score } = calculateOverallStrengthScore(
      exercises,
      programExercises,
      latestBw,
      profile.sex || 'male'
    );
    setOverallScore(score);

    const stalled = detectStalledExercises(exercises, history, profile.stall_weeks || 6);
    if (stalled.length > 0) {
      setStalledInfo(`${stalled[0].daysStalled}d (${stalled[0].exercise.name})`);
    } else {
      setStalledInfo('None');
    }

    // Initial coach welcome message
    setMessages([
      {
        id: 'init-1',
        role: 'coach',
        content: `Welcome back. Your overall strength score is ${score || '---'}. ${
          stalled.length > 0
            ? `Stall detected on ${stalled[0].exercise.name} (${stalled[0].daysStalled} days).`
            : 'All active lifts are within progression bounds.'
        } How can I assist your progressive overload plan today?`,
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const days = getStoredDays();
      const history = getStoredHistory();
      const bwHistory = getStoredWeightHistory();
      const checkins = getStoredCheckins();
      const profile = getStoredProfile();

      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query.trim(),
          userState: {
            profile,
            programDays: days,
            history,
            bodyweightHistory: bwHistory,
            checkins,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch coach response');
      }

      const coachMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        role: 'coach',
        content: data.reply || 'No response content returned.',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'coach',
        content: `COACH API ERROR: ${err.message || 'Unable to analyze progression facts.'}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-24">
      <Header title="COACH" subtitle="SERVER-SIDE GEMINI PROGRESSION ADVISOR" />

      {/* TOP COMPACT STATUS STRIP */}
      <div className="bg-[#131312] border-b border-[#232320] px-4 py-2.5 flex items-center justify-between text-xs font-mono-tabular">
        <div className="flex items-center gap-1.5">
          <span className="text-[#8A8880] uppercase font-condensed">SCORE:</span>
          <span className="font-bold text-[#E8E6E1]">{overallScore > 0 ? overallScore : '---'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#8A8880] uppercase font-condensed">STALL:</span>
          <span className={stalledInfo !== 'None' ? 'text-[#C9A227] font-bold' : 'text-[#7A9A5B] font-bold'}>
            {stalledInfo}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#8A8880] uppercase font-condensed">NEXT:</span>
          <span className="text-[#7A9A5B] font-bold">BENCH 100k</span>
        </div>
      </div>

      <div className="p-5 space-y-4 flex-1 flex flex-col">
        {/* QUICK ACTION CHIPS */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              disabled={loading}
              onClick={() => handleSend(action)}
              className="shrink-0 px-3 py-1.5 bg-[#131312] hover:bg-[#1A1A18] disabled:opacity-50 text-[#E8E6E1] text-[11px] font-condensed font-bold border border-[#232320] hover:border-[#33332E] rounded-[4px] transition-colors"
            >
              {action}
            </button>
          ))}
        </div>

        {/* CHAT MESSAGES THREAD */}
        <div className="space-y-3.5 flex-1 overflow-y-auto min-h-[340px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 border rounded-[6px] max-w-[92%] space-y-1.5 ${
                msg.role === 'user'
                  ? 'ml-auto bg-[#1A1A18] border-[#33332E] text-[#E8E6E1]'
                  : 'mr-auto bg-[#131312] border-[#232320] text-[#E8E6E1]'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#232320] pb-1.5">
                <span className="font-condensed text-[10px] font-bold tracking-wider text-[#8A8880] uppercase flex items-center gap-1.5">
                  {msg.role === 'coach' ? (
                    <>
                      <Bot className="w-3.5 h-3.5 text-[#C8471B]" /> AI COACH
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 text-[#8A8880]" /> YOU
                    </>
                  )}
                </span>
                <span className="text-[9px] font-mono-tabular text-[#5C5B56]">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs leading-relaxed font-sans whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}

          {loading && (
            <div className="p-3 bg-[#131312] border border-[#232320] rounded-[6px] max-w-[80%] flex items-center gap-2 text-xs font-condensed text-[#C8471B]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>ANALYZING PROGRESSION FACTS...</span>
            </div>
          )}
        </div>

        {/* INPUT FORM */}
        <div className="sticky bottom-16 pt-2 bg-[#0B0B0A]">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="ASK COACH ABOUT YOUR OVERLOAD PLAN..."
              disabled={loading}
              className="flex-1 bg-[#131312] border border-[#232320] px-3.5 py-2.5 text-xs text-[#E8E6E1] placeholder-[#5C5B56] focus:outline-none focus:border-[#C8471B] rounded-[4px] font-mono-tabular"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSend()}
              className="px-4 bg-[#C8471B] hover:bg-[#A33914] disabled:opacity-50 text-[#E8E6E1] border border-[#C8471B] rounded-[4px] transition-colors flex items-center justify-center"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
