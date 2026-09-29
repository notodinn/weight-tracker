'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface LogWeightModalProps {
  isOpen: boolean;
  initialWeight?: number;
  onClose: () => void;
  onSave: (date: string, weightKg: number) => void;
}

export function LogWeightModal({
  isOpen,
  initialWeight = 80.0,
  onClose,
  onSave,
}: LogWeightModalProps) {
  const [date, setDate] = useState<string>('');
  const [weight, setWeight] = useState<number>(initialWeight);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    if (initialWeight > 0) {
      setWeight(initialWeight);
    }
  }, [isOpen, initialWeight]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight > 0 && date) {
      onSave(date, Number(weight.toFixed(1)));
      onClose();
    }
  };

  const adjustWeight = (delta: number) => {
    setWeight((w) => Math.max(0, Number((w + delta).toFixed(1))));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-none p-0">
      <div className="w-full max-w-[480px] bg-[#131312] border-t border-[#33332E] rounded-t-[12px] p-5 space-y-5 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between border-b border-[#232320] pb-3">
          <h3 className="font-condensed text-lg font-bold text-[#E8E6E1]">
            LOG BODYWEIGHT
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8A8880] hover:text-[#E8E6E1] bg-[#1A1A18] border border-[#232320] rounded-[4px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* DATE SELECTOR */}
          <div className="space-y-1">
            <label className="text-xs font-condensed font-bold text-[#8A8880] uppercase block">
              ENTRY DATE
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#1A1A18] border border-[#232320] px-3.5 py-2.5 text-xs text-[#E8E6E1] font-mono-tabular focus:outline-none focus:border-[#C8471B] rounded-[4px]"
            />
          </div>

          {/* WEIGHT DISPLAY & STEPPERS */}
          <div className="space-y-2">
            <label className="text-xs font-condensed font-bold text-[#8A8880] uppercase block text-center">
              BODYWEIGHT (KG)
            </label>

            <div className="flex items-center justify-center p-4 bg-[#1A1A18] border border-[#232320] rounded-[6px]">
              <span className="font-mono-tabular text-4xl font-bold text-[#E8E6E1]">
                {weight.toFixed(1)} <span className="text-sm text-[#8A8880]">KG</span>
              </span>
            </div>

            {/* STEPPER BUTTONS */}
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => adjustWeight(-1.0)}
                className="py-3 bg-[#1A1A18] hover:bg-[#232320] border border-[#232320] text-sm font-mono-tabular font-bold text-[#8A8880] hover:text-[#E8E6E1] rounded-[4px]"
              >
                -1.0
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(-0.1)}
                className="py-3 bg-[#1A1A18] hover:bg-[#232320] border border-[#232320] text-sm font-mono-tabular font-bold text-[#8A8880] hover:text-[#E8E6E1] rounded-[4px]"
              >
                -0.1
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(0.1)}
                className="py-3 bg-[#1A1A18] hover:bg-[#232320] border border-[#232320] text-sm font-mono-tabular font-bold text-[#8A8880] hover:text-[#E8E6E1] rounded-[4px]"
              >
                +0.1
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(1.0)}
                className="py-3 bg-[#1A1A18] hover:bg-[#232320] border border-[#232320] text-sm font-mono-tabular font-bold text-[#8A8880] hover:text-[#E8E6E1] rounded-[4px]"
              >
                +1.0
              </button>
            </div>
          </div>

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
