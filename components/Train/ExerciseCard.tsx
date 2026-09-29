'use client';

import React, { useState, useEffect } from 'react';
import { ProgramExercise, WeightHistoryEntry, WeightChangeType } from '@/lib/types/program';
import { Plus, Edit2, RotateCcw, ChevronDown, ChevronUp, History, TrendingUp, AlertCircle } from 'lucide-react';
import { roundToNearestIncrement } from '@/lib/storage/store';

interface ExerciseCardProps {
  programExercise: ProgramExercise;
  isDeloadMode: boolean;
  historyEntries: WeightHistoryEntry[];
  onLogIncrease: (exerciseId: string, currentWeight: number, increment: number) => void;
  onUndo: (historyEntryId: string, exerciseId: string, oldWeight: number) => void;
  onEdit: (programExercise: ProgramExercise) => void;
}

export function ExerciseCard({
  programExercise,
  isDeloadMode,
  historyEntries,
  onLogIncrease,
  onUndo,
  onEdit,
}: ExerciseCardProps) {
  const { exercise, sets, rep_min, rep_max, notes } = programExercise;

  const [expanded, setExpanded] = useState(false);
  const [undoState, setUndoState] = useState<{
    historyId: string;
    oldWeight: number;
    timer: NodeJS.Timeout;
    secondsLeft: number;
  } | null>(null);

  // Compute next target weight
  const currentWeight = exercise.current_weight_kg || 0;
  const increment = exercise.increment_kg || 2.5;
  const nextTarget = roundToNearestIncrement(currentWeight + increment, 0.5);
  const deloadTarget = roundToNearestIncrement(currentWeight * 0.9, 0.5);

  // Compute days since last increase
  const lastIncreaseEntry = historyEntries.find((h) => h.type === 'increase');
  let daysSinceIncreaseText = 'No increases yet';
  if (lastIncreaseEntry) {
    const diffMs = Date.now() - new Date(lastIncreaseEntry.date_time).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    daysSinceIncreaseText = days === 0 ? 'Today' : `${days}d ago`;
  }

  // Handle Log Increase click
  const handleIncreaseClick = () => {
    // Record log increase
    onLogIncrease(exercise.id, currentWeight, increment);

    // Setup 8-second undo timer
    if (undoState?.timer) clearTimeout(undoState.timer);

    const timer = setTimeout(() => {
      setUndoState(null);
    }, 8000);

    setUndoState({
      historyId: 'recent',
      oldWeight: currentWeight,
      timer,
      secondsLeft: 8,
    });
  };

  // Countdown interval for undo bar
  useEffect(() => {
    if (!undoState) return;
    const interval = setInterval(() => {
      setUndoState((prev) => {
        if (!prev) return null;
        if (prev.secondsLeft <= 1) {
          clearInterval(interval);
          return null;
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [undoState?.historyId]);

  const handleUndoClick = () => {
    if (!undoState) return;
    clearTimeout(undoState.timer);
    onUndo(undoState.historyId, exercise.id, undoState.oldWeight);
    setUndoState(null);
  };

  return (
    <div className="iron-card p-4 space-y-3 transition-all duration-150">
      {/* HEADER: NAME, MUSCLE TAG, RX */}
      <div className="flex items-start justify-between">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-left group flex-1"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-condensed text-base font-bold text-[#E8E6E1] group-hover:text-[#C8471B] transition-colors">
              {exercise.name.toUpperCase()}
            </h3>
            {exercise.primary_muscle && (
              <span className="text-[10px] font-condensed px-1.5 py-0.5 bg-[#1A1A18] text-[#8A8880] border border-[#232320] rounded-[3px]">
                {exercise.primary_muscle}
              </span>
            )}
            {exercise.is_bonus && (
              <span className="text-[9px] font-condensed px-1.5 py-0.5 bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 rounded-[3px]">
                BONUS
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#8A8880] font-mono-tabular mt-1">
            <span>
              RX: {sets} × {rep_min === rep_max ? rep_min : `${rep_min}-${rep_max}`}
            </span>
            {notes && <span className="text-[#5C5B56] italic">({notes})</span>}
          </div>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(programExercise)}
            className="p-1.5 text-[#8A8880] hover:text-[#E8E6E1] bg-[#1A1A18] border border-[#232320] hover:border-[#33332E] rounded-[4px] transition-colors"
            aria-label="Edit Exercise"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-[#8A8880] hover:text-[#E8E6E1] bg-[#1A1A18] border border-[#232320] hover:border-[#33332E] rounded-[4px] transition-colors"
            aria-label="Expand History"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* WEIGHT DISPLAY STRIP */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-[#1A1A18] border border-[#232320] rounded-[4px]">
        <div>
          <span className="text-[10px] text-[#8A8880] font-condensed uppercase block">
            CURRENT WEIGHT
          </span>
          <span className="font-mono-tabular text-2xl font-bold text-[#E8E6E1]">
            {currentWeight} <span className="text-xs text-[#8A8880] font-normal">KG</span>
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[#C8471B] font-condensed uppercase block font-bold">
            {isDeloadMode ? 'DELOAD TARGET (90%)' : 'NEXT TARGET'}
          </span>
          <span className="font-mono-tabular text-xl font-bold text-[#E8E6E1]">
            {isDeloadMode ? deloadTarget : nextTarget} <span className="text-xs text-[#8A8880] font-normal">KG</span>
          </span>
        </div>
      </div>

      {/* LAST INCREASE TAG & LOG BUTTON */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-mono-tabular text-[#5C5B56]">
          Last increase: {daysSinceIncreaseText}
        </span>

        <button
          type="button"
          onClick={handleIncreaseClick}
          className="px-4 py-2.5 bg-[#C8471B] hover:bg-[#A33914] text-[#E8E6E1] font-condensed font-bold text-xs tracking-wider uppercase border border-[#C8471B] rounded-[4px] transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>LOG INCREASE (+{increment} KG)</span>
        </button>
      </div>

      {/* 8-SECOND INLINE UNDO BAR */}
      {undoState && (
        <div className="p-2.5 bg-[#C8471B]/15 border border-[#C8471B] text-xs font-mono-tabular text-[#E8E6E1] rounded-[4px] flex items-center justify-between animate-in fade-in duration-150">
          <span>Logged increase to {currentWeight} kg</span>
          <button
            type="button"
            onClick={handleUndoClick}
            className="px-2.5 py-1 bg-[#C8471B] hover:bg-[#A33914] text-[#E8E6E1] font-condensed font-bold text-[11px] uppercase rounded-[3px] flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>UNDO ({undoState.secondsLeft}s)</span>
          </button>
        </div>
      )}

      {/* EXPANDED HISTORY & STEP CHART */}
      {expanded && (
        <div className="pt-3 border-t border-[#232320] space-y-3">
          <div className="flex items-center justify-between text-xs font-condensed font-bold text-[#8A8880]">
            <span className="flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-[#C8471B]" /> PROGRESS HISTORY
            </span>
            <span>{historyEntries.length} ENTRIES</span>
          </div>

          {/* SVG STEP CHART */}
          {historyEntries.length > 0 ? (
            <div className="h-24 bg-[#1A1A18] border border-[#232320] rounded-[4px] p-2 flex flex-col justify-between">
              <div className="flex justify-between text-[10px] font-mono-tabular text-[#8A8880]">
                <span>WEIGHT STEP TREND</span>
                <span>LATEST: {currentWeight} KG</span>
              </div>
              <svg viewBox="0 0 300 50" className="w-full h-12 stroke-[#C8471B] fill-none">
                <polyline
                  points={historyEntries
                    .slice(0, 10)
                    .reverse()
                    .map((h, i) => `${i * 30},${50 - Math.min(45, (h.new_weight_kg / (currentWeight || 1)) * 30)}`)
                    .join(' ')}
                  strokeWidth="2"
                />
              </svg>
            </div>
          ) : (
            <div className="p-3 bg-[#1A1A18] border border-[#232320] text-center text-xs text-[#8A8880] rounded-[4px]">
              No previous history entries logged yet for this exercise.
            </div>
          )}

          {/* LAST 10 HISTORY LIST */}
          {historyEntries.length > 0 && (
            <div className="space-y-1.5 text-xs font-mono-tabular">
              {historyEntries.slice(0, 10).map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-2 bg-[#1A1A18] border border-[#232320] rounded-[3px]"
                >
                  <span className="text-[#8A8880] text-[10px]">
                    {new Date(h.date_time).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[#5C5B56]">{h.old_weight_kg}</span>
                    <span className="text-[#C8471B]">→</span>
                    <span className="font-bold text-[#E8E6E1]">{h.new_weight_kg} kg</span>
                  </div>

                  <span
                    className={`text-[9px] font-condensed px-1.5 py-0.5 border rounded-[2px] ${
                      h.type === 'increase'
                        ? 'border-[#7A9A5B] text-[#7A9A5B]'
                        : h.type === 'decrease'
                        ? 'border-[#C9A227] text-[#C9A227]'
                        : 'border-[#5C5B56] text-[#8A8880]'
                    }`}
                  >
                    {h.type.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
