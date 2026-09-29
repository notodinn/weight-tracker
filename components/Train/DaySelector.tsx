'use client';

import React from 'react';
import { ProgramDay } from '@/lib/types/program';

interface DaySelectorProps {
  days: ProgramDay[];
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
  isDeloadMode: boolean;
  onToggleDeload: () => void;
}

export function DaySelector({
  days,
  selectedDayId,
  onSelectDay,
  isDeloadMode,
  onToggleDeload,
}: DaySelectorProps) {
  return (
    <div className="flex items-center justify-between gap-2.5">
      <div className="flex bg-[#131312] p-1 border border-[#232320] rounded-[6px] flex-1">
        {days.map((day) => {
          const isSelected = day.id === selectedDayId;
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDay(day.id)}
              className={`flex-1 py-2 font-condensed text-xs tracking-wider transition-colors rounded-[4px] ${
                isSelected
                  ? 'bg-[#C8471B] text-[#E8E6E1] font-bold'
                  : 'text-[#8A8880] hover:text-[#E8E6E1] font-medium'
              }`}
            >
              {day.name}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onToggleDeload}
        className={`px-3.5 py-2 text-xs font-condensed tracking-wider font-bold border transition-colors rounded-[6px] ${
          isDeloadMode
            ? 'bg-[#C9A227]/20 border-[#C9A227] text-[#C9A227]'
            : 'bg-[#131312] border-[#232320] text-[#8A8880] hover:text-[#E8E6E1]'
        }`}
      >
        DELOAD MODE
      </button>
    </div>
  );
}
