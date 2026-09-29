'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header/Header';
import { DaySelector } from '@/components/Train/DaySelector';
import { ExerciseCard } from '@/components/Train/ExerciseCard';
import { EditExerciseSheet } from '@/components/Train/EditExerciseSheet';
import {
  getStoredDays,
  saveStoredDays,
  getStoredHistory,
  addHistoryEntry,
  removeHistoryEntry,
  addCheckin,
  roundToNearestIncrement,
} from '@/lib/storage/store';
import { ProgramDay, ProgramExercise, WeightHistoryEntry, WeightChangeType } from '@/lib/types/program';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export default function TrainPage() {
  const [days, setDays] = useState<ProgramDay[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string>('day-push');
  const [isDeloadMode, setIsDeloadMode] = useState<boolean>(false);
  const [history, setHistory] = useState<WeightHistoryEntry[]>([]);
  const [editingExercise, setEditingExercise] = useState<ProgramExercise | null>(null);
  const [checkinSuccess, setCheckinSuccess] = useState<boolean>(false);

  // Load state on client mount
  useEffect(() => {
    const loadedDays = getStoredDays();
    setDays(loadedDays);
    if (loadedDays.length > 0) {
      setSelectedDayId(loadedDays[0].id);
    }
    setHistory(getStoredHistory());
  }, []);

  const selectedDay = days.find((d) => d.id === selectedDayId) || days[0];

  // Handle Log Increase action
  const handleLogIncrease = (exerciseId: string, currentWeight: number, increment: number) => {
    const newWeight = roundToNearestIncrement(currentWeight + increment, 0.5);

    // 1. Add history entry
    const entry = addHistoryEntry({
      exercise_id: exerciseId,
      old_weight_kg: currentWeight,
      new_weight_kg: newWeight,
      type: 'increase',
    });

    // 2. Update exercise current weight in store state
    const updatedDays = days.map((day) => ({
      ...day,
      program_exercises: day.program_exercises.map((pe) => {
        if (pe.exercise.id === exerciseId) {
          return {
            ...pe,
            exercise: {
              ...pe.exercise,
              current_weight_kg: newWeight,
            },
          };
        }
        return pe;
      }),
    }));

    setDays(updatedDays);
    saveStoredDays(updatedDays);
    setHistory(getStoredHistory());
  };

  // Handle Undo action
  const handleUndo = (historyId: string, exerciseId: string, oldWeight: number) => {
    // 1. Remove history entry
    if (historyId !== 'recent') {
      removeHistoryEntry(historyId);
    }

    // 2. Restore exercise current weight
    const updatedDays = days.map((day) => ({
      ...day,
      program_exercises: day.program_exercises.map((pe) => {
        if (pe.exercise.id === exerciseId) {
          return {
            ...pe,
            exercise: {
              ...pe.exercise,
              current_weight_kg: oldWeight,
            },
          };
        }
        return pe;
      }),
    }));

    setDays(updatedDays);
    saveStoredDays(updatedDays);
    setHistory(getStoredHistory());
  };

  // Handle Save from Edit Sheet
  const handleSaveEdit = (data: {
    exerciseId: string;
    newWeightKg: number;
    incrementKg: number;
    type: WeightChangeType;
    note?: string;
  }) => {
    const currentEx = selectedDay?.program_exercises.find(
      (pe) => pe.exercise.id === data.exerciseId
    )?.exercise;

    const oldWeight = currentEx?.current_weight_kg || 0;

    // 1. Add history entry if not a pure correction or if requested
    if (data.type !== 'correction' || oldWeight !== data.newWeightKg) {
      addHistoryEntry({
        exercise_id: data.exerciseId,
        old_weight_kg: oldWeight,
        new_weight_kg: data.newWeightKg,
        type: data.type,
        note: data.note,
      });
    }

    // 2. Update exercise in days
    const updatedDays = days.map((day) => ({
      ...day,
      program_exercises: day.program_exercises.map((pe) => {
        if (pe.exercise.id === data.exerciseId) {
          return {
            ...pe,
            exercise: {
              ...pe.exercise,
              current_weight_kg: data.newWeightKg,
              increment_kg: data.incrementKg,
              notes: data.note || pe.exercise.notes,
            },
          };
        }
        return pe;
      }),
    }));

    setDays(updatedDays);
    saveStoredDays(updatedDays);
    setHistory(getStoredHistory());
  };

  // Handle Session Checkin
  const handleCheckin = () => {
    addCheckin(selectedDayId);
    setCheckinSuccess(true);
    setTimeout(() => setCheckinSuccess(false), 3000);
  };

  if (!selectedDay) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="TRAIN" subtitle="PROGRAM WORKFLOW" />
        <div className="p-5 text-center text-xs text-[#8A8880]">Loading training days...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full pb-8">
      <Header title="TRAIN" subtitle="SELECT DAY & LOG PROGRESSIVE OVERLOAD" />

      <div className="p-5 space-y-5">
        {/* DAY SELECTOR & DELOAD MODE TOGGLE */}
        <DaySelector
          days={days}
          selectedDayId={selectedDayId}
          onSelectDay={setSelectedDayId}
          isDeloadMode={isDeloadMode}
          onToggleDeload={() => setIsDeloadMode(!isDeloadMode)}
        />

        {/* DELOAD BANNER */}
        {isDeloadMode && (
          <div className="p-3.5 bg-[#C9A227]/10 border border-[#C9A227]/40 text-xs text-[#C9A227] rounded-[6px] flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>DELOAD VIEW MODE: Displaying 90% target weights. Database values remain unchanged.</span>
          </div>
        )}

        {/* SECTION HEADER */}
        <div className="iron-section-header">
          <span>{selectedDay.name} DAY EXERCISES ({selectedDay.program_exercises.length})</span>
        </div>

        {/* EXERCISE LIST */}
        <div className="space-y-3.5">
          {selectedDay.program_exercises.map((pe) => {
            const exHistory = history.filter((h) => h.exercise_id === pe.exercise.id);
            return (
              <ExerciseCard
                key={pe.id}
                programExercise={pe}
                isDeloadMode={isDeloadMode}
                historyEntries={exHistory}
                onLogIncrease={handleLogIncrease}
                onUndo={handleUndo}
                onEdit={(progEx) => setEditingExercise(progEx)}
              />
            );
          })}
        </div>

        {/* SESSION CHECKIN BUTTON */}
        <button
          type="button"
          onClick={handleCheckin}
          className={`w-full py-3.5 font-condensed font-bold text-xs uppercase border rounded-[6px] flex items-center justify-center gap-2 transition-colors ${
            checkinSuccess
              ? 'bg-[#7A9A5B]/20 border-[#7A9A5B] text-[#7A9A5B]'
              : 'bg-[#131312] hover:bg-[#1A1A18] text-[#E8E6E1] border-[#33332E]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-[#7A9A5B]" />
          <span>{checkinSuccess ? 'SESSION LOGGED FOR TODAY' : 'I TRAINED THIS DAY'}</span>
        </button>
      </div>

      {/* EDIT BOTTOM SHEET */}
      <EditExerciseSheet
        exercise={editingExercise?.exercise || null}
        isOpen={!!editingExercise}
        onClose={() => setEditingExercise(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
