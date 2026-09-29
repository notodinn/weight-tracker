'use client';

import React, { useState, useEffect } from 'react';
import { Exercise, WeightChangeType } from '@/lib/types/program';
import { X, Check, ArrowUp, ArrowDown, Edit3 } from 'lucide-react';

interface EditExerciseSheetProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    exerciseId: string;
    newWeightKg: number;
    incrementKg: number;
    type: WeightChangeType;
    note?: string;
  }) => void;
}

export function EditExerciseSheet({
  exercise,
  isOpen,
  onClose,
  onSave,
}: EditExerciseSheetProps) {
  const [weight, setWeight] = useState<number>(0);
  const [increment, setIncrement] = useState<number>(2.5);
  const [logType, setLogType] = useState<WeightChangeType>('increase');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (exercise) {
      setWeight(exercise.current_weight_kg || 0);
      setIncrement(exercise.increment_kg || 2.5);
      setNote(exercise.notes || '');
      setLogType('increase');
    }
  }, [exercise]);

  if (!isOpen || !exercise) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      exerciseId: exercise.id,
      newWeightKg: Number(weight),
      incrementKg: Number(increment),
      type: logType,
      note: note.trim() ? note.trim() : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-none p-0">
      <div className="w-full max-w-[480px] bg-[#131312] border-t border-[#33332E] rounded-t-[12px] p-5 space-y-5 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between border-b border-[#232320] pb-3">
          <div>
            <h3 className="font-condensed text-lg font-bold text-[#E8E6E1]">
              EDIT {exercise.name.toUpperCase()}
            </h3>
            <p className="text-xs text-[#8A8880] font-mono-tabular">
              CURRENT WORKING WEIGHT: {exercise.current_weight_kg} KG
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8A8880] hover:text-[#E8E6E1] bg-[#1A1A18] border border-[#232320] rounded-[4px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* LOG TYPE SELECTOR */}
          <div className="space-y-1">
            <label className="text-xs font-condensed font-bold text-[#8A8880] uppercase block">
              ACTION / ENTRY TYPE
            </label>
            <div className="grid grid-cols-3 gap-2 bg-[#1A1A18] p-1 border border-[#232320] rounded-[6px]">
              <button
                type="button"
                onClick={() => setLogType('increase')}
                className={`py-2 text-xs font-condensed font-bold rounded-[4px] flex items-center justify-center gap-1 ${
                  logType === 'increase'
                    ? 'bg-[#C8471B] text-[#E8E6E1]'
                    : 'text-[#8A8880] hover:text-[#E8E6E1]'
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" /> INCREASE
              </button>

              <button
                type="button"
                onClick={() => setLogType('decrease')}
                className={`py-2 text-xs font-condensed font-bold rounded-[4px] flex items-center justify-center gap-1 ${
                  logType === 'decrease'
                    ? 'bg-[#C9A227]/20 border border-[#C9A227] text-[#C9A227]'
                    : 'text-[#8A8880] hover:text-[#E8E6E1]'
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5" /> DECREASE
              </button>

              <button
                type="button"
                onClick={() => setLogType('correction')}
                className={`py-2 text-xs font-condensed font-bold rounded-[4px] flex items-center justify-center gap-1 ${
                  logType === 'correction'
                    ? 'bg-[#232320] border border-[#33332E] text-[#E8E6E1]'
                    : 'text-[#8A8880] hover:text-[#E8E6E1]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> CORRECT
              </button>
            </div>
            <p className="text-[10px] text-[#5C5B56]">
              {logType === 'increase' && 'Logs a progressive weight increase.'}
              {logType === 'decrease' && 'Logs a deload/injury weight reduction without breaking progress math.'}
              {logType === 'correction' && 'Fixes weight entry without creating a progress timeline entry.'}
            </p>
          </div>

          {/* EXACT NEW WEIGHT INPUT */}
          <div className="space-y-1">
            <label className="text-xs font-condensed font-bold text-[#8A8880] uppercase block">
              NEW WORKING WEIGHT (KG)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="0"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="flex-1 bg-[#1A1A18] border border-[#232320] px-3.5 py-2.5 text-lg font-mono-tabular font-bold text-[#E8E6E1] focus:outline-none focus:border-[#C8471B] rounded-[4px]"
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setWeight((w) => Math.max(0, w - increment))}
                  className="px-3 py-2.5 bg-[#1A1A18] border border-[#232320] text-sm font-mono-tabular font-bold text-[#8A8880] hover:text-[#E8E6E1] rounded-[4px]"
                >
                  -{increment}
                </button>
                <button
                  type="button"
                  onClick={() => setWeight((w) => w + increment)}
                  className="px-3 py-2.5 bg-[#1A1A18] border border-[#232320] text-sm font-mono-tabular font-bold text-[#8A8880] hover:text-[#E8E6E1] rounded-[4px]"
                >
                  +{increment}
                </button>
              </div>
            </div>
          </div>

          {/* DEFAULT INCREMENT */}
          <div className="space-y-1">
            <label className="text-xs font-condensed font-bold text-[#8A8880] uppercase block">
              PLATE INCREMENT (KG JUMP)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={increment}
              onChange={(e) => setIncrement(Number(e.target.value))}
              className="w-full bg-[#1A1A18] border border-[#232320] px-3.5 py-2 text-xs font-mono-tabular text-[#E8E6E1] focus:outline-none focus:border-[#C8471B] rounded-[4px]"
            />
          </div>

          {/* NOTE */}
          <div className="space-y-1">
            <label className="text-xs font-condensed font-bold text-[#8A8880] uppercase block">
              OPTIONAL NOTE
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Felt smooth, switched grip"
              className="w-full bg-[#1A1A18] border border-[#232320] px-3.5 py-2 text-xs text-[#E8E6E1] placeholder-[#5C5B56] focus:outline-none focus:border-[#C8471B] rounded-[4px]"
            />
          </div>

          {/* SAVE BUTTON */}
          <button
            type="submit"
            className="w-full py-3 bg-[#C8471B] hover:bg-[#A33914] text-[#E8E6E1] font-condensed font-bold text-sm tracking-wider uppercase rounded-[4px] transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <Check className="w-4 h-4" />
            <span>SAVE ENTRY</span>
          </button>
        </form>
      </div>
    </div>
  );
}
