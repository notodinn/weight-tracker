'use client';

import React, { useState } from 'react';
import { BodyweightEntry } from '@/lib/types/biometrics';

interface BodyweightChartProps {
  entries: BodyweightEntry[];
}

export type TimeRange = '30D' | '90D' | '1Y' | 'ALL';

export function BodyweightChart({ entries }: BodyweightChartProps) {
  const [range, setRange] = useState<TimeRange>('30D');

  if (!entries || entries.length === 0) {
    return (
      <div className="iron-card p-5 text-center space-y-3">
        <div className="flex bg-[#1A1A18] p-1 border border-[#232320] rounded-[6px] max-w-[240px] mx-auto">
          {(['30D', '90D', '1Y', 'ALL'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`flex-1 py-1 font-mono-tabular text-xs font-bold rounded-[4px] ${
                range === r ? 'bg-[#C8471B] text-[#E8E6E1]' : 'text-[#8A8880]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="h-32 bg-[#1A1A18] border border-[#232320] rounded-[4px] flex items-center justify-center text-xs text-[#8A8880]">
          No bodyweight entries recorded yet.
        </div>
      </div>
    );
  }

  // Filter entries based on range
  const now = new Date();
  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const filtered = sorted.filter((entry) => {
    const entryDate = new Date(entry.date);
    const diffDays = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
    if (range === '30D') return diffDays <= 30;
    if (range === '90D') return diffDays <= 90;
    if (range === '1Y') return diffDays <= 365;
    return true;
  });

  const chartData = filtered.length > 0 ? filtered : sorted;

  // Calculate min & max for scale
  const weights = chartData.map((d) => d.weight_kg);
  const minW = Math.max(0, Math.min(...weights) - 1);
  const maxW = Math.max(...weights) + 1;
  const rangeW = maxW - minW || 1;

  // Generate solid polyline points (W: 300, H: 80)
  const width = 300;
  const height = 80;

  const points = chartData
    .map((d, idx) => {
      const x = chartData.length === 1 ? width / 2 : (idx / (chartData.length - 1)) * width;
      const y = height - ((d.weight_kg - minW) / rangeW) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Compute 7-day moving average points
  const movingAvgPoints = chartData
    .map((d, idx) => {
      const startIdx = Math.max(0, idx - 6);
      const slice = chartData.slice(startIdx, idx + 1);
      const avg = slice.reduce((sum, item) => sum + item.weight_kg, 0) / slice.length;

      const x = chartData.length === 1 ? width / 2 : (idx / (chartData.length - 1)) * width;
      const y = height - ((avg - minW) / rangeW) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="iron-card p-5 space-y-4">
      {/* RANGE SELECTOR */}
      <div className="flex bg-[#1A1A18] p-1 border border-[#232320] rounded-[6px]">
        {(['30D', '90D', '1Y', 'ALL'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`flex-1 py-1 font-mono-tabular text-xs font-bold transition-colors rounded-[4px] ${
              range === r
                ? 'bg-[#C8471B] text-[#E8E6E1]'
                : 'text-[#8A8880] hover:text-[#E8E6E1]'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* SVG CHART CONTAINER */}
      <div className="bg-[#1A1A18] border border-[#232320] rounded-[4px] p-3 space-y-2">
        <div className="flex justify-between text-[10px] font-mono-tabular text-[#8A8880]">
          <span>MAX: {maxW.toFixed(1)} KG</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-[1.5px] bg-[#C8471B] inline-block" /> DAILY
            <span className="w-2.5 h-[1px] bg-[#8A8880] border-t border-dashed inline-block ml-1" /> 7D AVG
          </span>
          <span>MIN: {minW.toFixed(1)} KG</span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
          {/* Grid line */}
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#232320" strokeWidth="1" />

          {/* 7-day Moving Avg (dashed muted) */}
          <polyline
            points={movingAvgPoints}
            fill="none"
            stroke="#8A8880"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Daily Bodyweight Line (solid accent) */}
          <polyline
            points={points}
            fill="none"
            stroke="#C8471B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Dots */}
          {chartData.map((d, idx) => {
            const x = chartData.length === 1 ? width / 2 : (idx / (chartData.length - 1)) * width;
            const y = height - ((d.weight_kg - minW) / rangeW) * height;
            return (
              <circle
                key={d.id || idx}
                cx={x}
                cy={y}
                r="3"
                className="fill-[#C8471B] stroke-[#1A1A18]"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>

        <div className="flex justify-between text-[10px] font-mono-tabular text-[#5C5B56]">
          <span>{chartData[0]?.date}</span>
          <span>{chartData[chartData.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
}
