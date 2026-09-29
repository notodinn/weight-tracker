'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header/Header';
import {
  getStoredDays,
  getStoredHistory,
  getStoredCheckins,
  addCheckin,
} from '@/lib/storage/store';
import { getStoredWeightHistory, getStoredProfile } from '@/lib/storage/biometricsStore';
import { calculateOverallStrengthScore, detectStalledExercises } from '@/lib/strength/engine';
import { ProgramDay, WeightHistoryEntry } from '@/lib/types/program';
import { BodyweightEntry } from '@/lib/types/biometrics';
import {
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Bot,
  Activity,
  Dumbbell,
} from 'lucide-react';
import Link from 'next/link';

export default function OverviewPage() {
  const [days, setDays] = useState<ProgramDay[]>([]);
  const [history, setHistory] = useState<WeightHistoryEntry[]>([]);
  const [bwHistory, setBwHistory] = useState<BodyweightEntry[]>([]);
  const [checkins, setCheckins] = useState<{ date: string }[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [muscleScores, setMuscleScores] = useState<Record<string, { level: number; score: number }>>({});
  const [stalledList, setStalledList] = useState<{ exercise: any; daysStalled: number }[]>([]);
  const [checkinSuccess, setCheckinSuccess] = useState<boolean>(false);

  useEffect(() => {
    const loadedDays = getStoredDays();
    const loadedHistory = getStoredHistory();
    const loadedBwHistory = getStoredWeightHistory();
    const loadedCheckins = getStoredCheckins();
    const profile = getStoredProfile();

    setDays(loadedDays);
    setHistory(loadedHistory);
    setBwHistory(loadedBwHistory);
    setCheckins(loadedCheckins);

    const exercises = loadedDays.flatMap((d) => d.program_exercises.map((pe) => pe.exercise));
    const programExercises = loadedDays.flatMap((d) => d.program_exercises);

    const latestBw = loadedBwHistory[0]?.weight_kg || profile.target_weight_kg || 80;
    const { overallScore: score, muscleScores: mScores } = calculateOverallStrengthScore(
      exercises,
      programExercises,
      latestBw,
      profile.sex || 'male'
    );

    setOverallScore(score);
    setMuscleScores(mScores);

    // Detect stalled exercises
    const stalled = detectStalledExercises(exercises, loadedHistory, profile.stall_weeks || 6);
    setStalledList(stalled);
  }, []);

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, etc.
  const todayDateStr = today
    .toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase();

  // Determine today's scheduled training day (default rotate PUSH / PULL / LEGS)
  const scheduledDayIndex = dayOfWeek % (days.length || 1);
  const todayScheduledDay = days[scheduledDayIndex] || days[0];

  // Top 3 heaviest working weights preview
  const topWorkingWeights = todayScheduledDay?.program_exercises
    ? [...todayScheduledDay.program_exercises]
        .sort((a, b) => b.exercise.current_weight_kg - a.exercise.current_weight_kg)
        .slice(0, 3)
    : [];

  // Recent 5 weight increases
  const recentIncreases = history
    .filter((h) => h.type === 'increase')
    .slice(0, 5);

  // Latest bodyweight & 30d delta
  const latestBw = bwHistory[0]?.weight_kg || 0;
  let bwDeltaText = 'No prior entries';
  if (bwHistory.length > 1) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const older = bwHistory.find((e) => new Date(e.date).getTime() <= thirtyDaysAgo.getTime()) || bwHistory[bwHistory.length - 1];
    if (older && older !== bwHistory[0]) {
      const diff = Number((latestBw - older.weight_kg).toFixed(1));
      bwDeltaText = `${diff >= 0 ? '+' : ''}${diff} kg in 30d`;
    }
  }

  // Handle 1-tap checkin from Overview
  const handleCheckin = () => {
    addCheckin(todayScheduledDay?.id);
    setCheckins(getStoredCheckins());
    setCheckinSuccess(true);
    setTimeout(() => setCheckinSuccess(false), 3000);
  };

  // Ranked muscle groups
  const sortedMuscles = Object.entries(muscleScores)
    .map(([muscle, d]) => ({ muscle, ...d }))
    .sort((a, b) => b.score - a.score);

  const strongestMuscle = sortedMuscles[0]?.muscle;
  const laggingMuscle = sortedMuscles[sortedMuscles.length - 1]?.muscle;

  return (
    <div className="flex flex-col min-h-full pb-8">
      <Header
        title="IRON LEDGER"
        subtitle={`${todayDateStr} — TODAY: ${todayScheduledDay?.name || 'TRAINING'} DAY`}
      />

      <div className="p-5 space-y-5">
        {/* CARD A: TODAY'S SESSION */}
        <section className="iron-card p-5">
          <div className="iron-section-header">
            <span>TODAY'S SESSION</span>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-condensed text-xl text-[#E8E6E1] font-bold tracking-wide">
                {todayScheduledDay?.name || 'TRAINING'} DAY
              </h2>
              <p className="text-xs text-[#8A8880] mt-0.5">
                {todayScheduledDay?.program_exercises.length || 0} EXERCISES PRESCRIBED
              </p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-condensed font-bold bg-[#1A1A18] text-[#C8471B] border border-[#33332E] rounded-[4px]">
              SCHEDULED TODAY
            </span>
          </div>

          {/* Heavy Working Weights Preview */}
          {topWorkingWeights.length > 0 && (
            <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#1A1A18] border border-[#232320] mb-4 rounded-[4px]">
              {topWorkingWeights.map((pe) => (
                <div key={pe.id}>
                  <p className="text-[10px] text-[#8A8880] font-condensed uppercase truncate">
                    {pe.exercise.name}
                  </p>
                  <p className="font-mono-tabular text-sm font-bold text-[#E8E6E1]">
                    {pe.exercise.current_weight_kg > 0 ? pe.exercise.current_weight_kg : '--'}{' '}
                    <span className="text-[10px] text-[#8A8880] font-normal">KG</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/train"
            className="w-full py-3 bg-[#C8471B] hover:bg-[#A33914] text-[#E8E6E1] font-condensed font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 rounded-[4px] transition-colors"
          >
            <span>OPEN SESSION</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </section>

        {/* CARD B: STRENGTH SCORE */}
        <section className="iron-card p-5">
          <div className="iron-section-header">
            <span>STRENGTH SCORE</span>
          </div>

          {overallScore > 0 ? (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-mono-tabular text-4xl font-bold text-[#E8E6E1]">
                    {overallScore}
                  </span>
                  <span className="text-xs text-[#8A8880] ml-2 font-mono-tabular">/ 1000</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono-tabular text-[#7A9A5B] bg-[#1A1A18] px-2.5 py-1 border border-[#232320] rounded-[4px]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Calculated from active lifts</span>
                </div>
              </div>

              {/* 12W Sparkline */}
              <div className="h-10 w-full bg-[#1A1A18] border border-[#232320] rounded-[4px] flex items-center justify-between px-3">
                <span className="text-[10px] font-mono-tabular text-[#5C5B56]">12W SPARKLINE</span>
                <div className="flex gap-1 items-end h-6">
                  {[35, 40, 42, 45, 44, 48, 52, 55, 54, 58, 62, overallScore ? Math.min(100, Math.max(20, Math.round(overallScore / 10))) : 65].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-1.5 rounded-[1px] ${i === 11 ? 'bg-[#C8471B]' : 'bg-[#33332E]'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#1A1A18] border border-[#232320] rounded-[4px] text-center space-y-1">
              <span className="font-mono-tabular text-3xl font-bold text-[#8A8880]">---</span>
              <p className="text-xs text-[#8A8880]">
                Log your working weights in the <span className="text-[#E8E6E1] font-bold">TRAIN</span> tab to compute your overall strength score.
              </p>
            </div>
          )}
        </section>

        {/* CARD C: PROGRESS FEED */}
        <section className="iron-card p-5">
          <div className="iron-section-header">
            <span>PROGRESS FEED</span>
          </div>

          {recentIncreases.length > 0 ? (
            <div className="space-y-2 text-xs font-mono-tabular">
              {recentIncreases.map((item) => {
                const exName = days.flatMap((d) => d.program_exercises).find((pe) => pe.exercise.id === item.exercise_id)?.exercise.name || 'Exercise';
                const diffDays = Math.floor((Date.now() - new Date(item.date_time).getTime()) / (1000 * 60 * 60 * 24));
                const dateStr = diffDays === 0 ? 'Today' : `${diffDays}d ago`;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 bg-[#1A1A18] border border-[#232320] rounded-[4px]"
                  >
                    <span className="font-condensed font-bold text-[#E8E6E1] truncate max-w-[150px]">
                      {exName.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#8A8880]">{item.old_weight_kg}</span>
                      <span className="text-[#C8471B] font-bold">→</span>
                      <span className="text-[#E8E6E1] font-bold">{item.new_weight_kg} kg</span>
                      <span className="text-[10px] text-[#5C5B56] ml-1">{dateStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-[#1A1A18] border border-[#232320] rounded-[4px] text-center space-y-1">
              <Dumbbell className="w-5 h-5 text-[#5C5B56] mx-auto mb-1" />
              <p className="text-xs text-[#8A8880]">No weight increases logged yet.</p>
              <p className="text-[11px] text-[#5C5B56]">Your last 5 weight jumps will appear here.</p>
            </div>
          )}
        </section>

        {/* CARD D: STALL WATCH */}
        <section className="iron-card p-5">
          <div className="iron-section-header">
            <span>STALL WATCH</span>
          </div>

          {stalledList.length > 0 ? (
            <div className="space-y-2">
              {stalledList.map((stalledItem) => (
                <div
                  key={stalledItem.exercise.id}
                  className="flex items-center gap-3 p-3 bg-[#1A1A18] border border-[#C9A227]/40 rounded-[4px]"
                >
                  <AlertTriangle className="w-5 h-5 text-[#C9A227] shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-xs font-condensed font-bold text-[#E8E6E1]">
                      {stalledItem.exercise.name.toUpperCase()}
                    </p>
                    <p className="text-[11px] text-[#8A8880] font-mono-tabular">
                      {stalledItem.daysStalled} days since last increase ({stalledItem.exercise.current_weight_kg} kg)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-[#1A1A18] border border-[#232320] rounded-[4px] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#7A9A5B] shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-condensed font-bold text-[#E8E6E1]">NO STALLED EXERCISES</p>
                <p className="text-[11px] text-[#8A8880]">All lifts are within active overload window.</p>
              </div>
            </div>
          )}
        </section>

        {/* CARD E: MUSCLE BALANCE */}
        <section className="iron-card p-5">
          <div className="iron-section-header">
            <span>MUSCLE BALANCE</span>
          </div>

          {sortedMuscles.length > 0 ? (
            <div className="space-y-2.5">
              {sortedMuscles.slice(0, 6).map((m) => (
                <div key={m.muscle} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-condensed">
                    <span className="text-[#E8E6E1]">{m.muscle}</span>
                    <div className="flex items-center gap-2">
                      {m.muscle === strongestMuscle && (
                        <span className="text-[9px] px-1.5 py-0.5 border border-[#7A9A5B] text-[#7A9A5B] bg-[#7A9A5B]/10 rounded-[2px]">
                          STRONGEST
                        </span>
                      )}
                      {m.muscle === laggingMuscle && (
                        <span className="text-[9px] px-1.5 py-0.5 border border-[#C8471B] text-[#C8471B] bg-[#C8471B]/10 rounded-[2px]">
                          LAGGING
                        </span>
                      )}
                      <span className="font-mono-tabular text-[#8A8880]">{m.score} pts</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-[#1A1A18] border border-[#232320] rounded-[2px] overflow-hidden">
                    <div
                      className="h-full bg-[#C8471B] transition-all duration-300"
                      style={{ width: `${Math.min(100, (m.score / 1000) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-[#1A1A18] border border-[#232320] rounded-[4px] text-center space-y-1">
              <Activity className="w-5 h-5 text-[#5C5B56] mx-auto mb-1" />
              <p className="text-xs text-[#8A8880]">Muscle balance heatmap awaiting lift entries.</p>
            </div>
          )}
        </section>

        {/* CARD F: BODYWEIGHT */}
        <section className="iron-card p-5">
          <div className="iron-section-header">
            <span>BODYWEIGHT</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono-tabular text-3xl font-bold text-[#E8E6E1]">
                {latestBw > 0 ? latestBw.toFixed(1) : '--.-'}{' '}
                <span className="text-xs text-[#8A8880]">KG</span>
              </span>
              <p className="text-xs text-[#8A8880] font-mono-tabular mt-0.5">{bwDeltaText}</p>
            </div>

            <Link
              href="/body"
              className="px-3.5 py-2 bg-[#1A1A18] hover:bg-[#232320] border border-[#33332E] text-xs font-condensed font-bold text-[#C8471B] hover:text-[#E8E6E1] rounded-[4px] transition-colors inline-flex items-center gap-1"
            >
              <span>VIEW BIOMETRICS LOG</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* CARD G: TRAINING CONSISTENCY */}
        <section className="iron-card p-5">
          <div className="iron-section-header">
            <span>12-WEEK CONSISTENCY</span>
          </div>

          <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto py-2">
            {Array.from({ length: 84 }).map((_, idx) => {
              const daysAgo = 83 - idx;
              const dateObj = new Date();
              dateObj.setDate(dateObj.getDate() - daysAgo);
              const dateStr = dateObj.toISOString().split('T')[0];

              const checkinLogged = checkins.some((c) => c.date === dateStr);
              const increaseLogged = history.some(
                (h) => h.date_time.split('T')[0] === dateStr
              );
              const isTrained = checkinLogged || increaseLogged;

              return (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-[2px] border ${
                    isTrained
                      ? 'bg-[#C8471B] border-[#C8471B]'
                      : 'bg-[#1A1A18] border-[#232320]'
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleCheckin}
            className={`w-full mt-3 py-3 font-condensed font-bold text-xs uppercase border rounded-[4px] flex items-center justify-center gap-2 transition-colors ${
              checkinSuccess
                ? 'bg-[#7A9A5B]/20 border-[#7A9A5B] text-[#7A9A5B]'
                : 'bg-[#1A1A18] hover:bg-[#232320] text-[#E8E6E1] border-[#33332E]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-[#7A9A5B]" />
            <span>{checkinSuccess ? 'SESSION LOGGED FOR TODAY' : 'I TRAINED TODAY'}</span>
          </button>
        </section>

        {/* CARD H: COACH SNAPSHOT */}
        <section className="iron-card p-5">
          <div className="iron-section-header">
            <span>COACH SNAPSHOT</span>
          </div>

          <p className="text-xs text-[#8A8880] leading-relaxed mb-4">
            {stalledList.length > 0
              ? `"${stalledList[0].exercise.name} has stalled for ${stalledList[0].daysStalled} days. Consider a 10% deload or changing working rep range."`
              : '"Progression rate is healthy across active lifts. Maintain current 2.5 kg plate jump increments."'}
          </p>

          <Link
            href="/coach"
            className="w-full py-2.5 bg-[#1A1A18] hover:bg-[#232320] text-[#C8471B] font-condensed font-bold text-xs uppercase border border-[#C8471B]/40 flex items-center justify-center gap-2 rounded-[4px] transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>ASK AI COACH</span>
          </Link>
        </section>

        {/* CARD I: PROJECTION TEASER */}
        <section className="iron-card p-5">
          <div className="iron-section-header">
            <span>UPCOMING MILESTONE</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-condensed font-bold text-[#E8E6E1]">BENCH PRESS 100.0 KG</span>
            <span className="font-mono-tabular text-[#7A9A5B]">PROJECTED IN ~9 WKS</span>
          </div>
        </section>
      </div>
    </div>
  );
}
