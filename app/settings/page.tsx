'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header/Header';
import { ArrowLeft, Save, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [stallWeeks, setStallWeeks] = useState(6);
  const [deloadPct, setDeloadPct] = useState(90);

  return (
    <div className="flex flex-col min-h-full pb-6">
      <Header title="SETTINGS" subtitle="APP PREFERENCES & PROGRAM PARAMETERS" showSettings={false} />

      <div className="p-4 space-y-4">
        <Link
          href="/overview"
          className="text-xs text-[#8A8880] hover:text-[#E8E6E1] font-condensed font-bold uppercase inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO OVERVIEW</span>
        </Link>

        {/* UNITS & INCREMENTS */}
        <section className="iron-card p-4 space-y-3">
          <div className="iron-section-header">
            <span>UNITS & PLATE JUMPS</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-condensed font-bold text-[#E8E6E1]">WEIGHT UNIT</span>
            <div className="flex bg-[#1A1A18] p-0.5 border border-[#2A2A27] rounded-[2px]">
              <button
                type="button"
                onClick={() => setUnit('kg')}
                className={`px-3 py-1 font-mono-tabular text-xs font-bold ${
                  unit === 'kg' ? 'bg-[#C8471B] text-[#E8E6E1]' : 'text-[#8A8880]'
                }`}
              >
                KG
              </button>
              <button
                type="button"
                onClick={() => setUnit('lb')}
                className={`px-3 py-1 font-mono-tabular text-xs font-bold ${
                  unit === 'lb' ? 'bg-[#C8471B] text-[#E8E6E1]' : 'text-[#8A8880]'
                }`}
              >
                LB
              </button>
            </div>
          </div>
        </section>

        {/* PROGRAM CONFIG */}
        <section className="iron-card p-4 space-y-3">
          <div className="iron-section-header">
            <span>STALL & DELOAD CONFIG</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-condensed font-bold text-[#E8E6E1] block mb-1">
                STALL WATCH THRESHOLD (WEEKS)
              </label>
              <input
                type="number"
                value={stallWeeks}
                onChange={(e) => setStallWeeks(Number(e.target.value))}
                className="w-full bg-[#1A1A18] border border-[#2A2A27] px-3 py-2 text-xs font-mono-tabular text-[#E8E6E1] focus:outline-none focus:border-[#C8471B] rounded-[2px]"
              />
              <p className="text-[10px] text-[#8A8880] mt-1">
                Flags exercises on Stall Watch if no weight increase is logged for this duration.
              </p>
            </div>

            <div>
              <label className="text-xs font-condensed font-bold text-[#E8E6E1] block mb-1">
                DELOAD PERCENTAGE (%)
              </label>
              <input
                type="number"
                value={deloadPct}
                onChange={(e) => setDeloadPct(Number(e.target.value))}
                className="w-full bg-[#1A1A18] border border-[#2A2A27] px-3 py-2 text-xs font-mono-tabular text-[#E8E6E1] focus:outline-none focus:border-[#C8471B] rounded-[2px]"
              />
              <p className="text-[10px] text-[#8A8880] mt-1">
                Calculates deload mode weights as a percentage of current working weight (default 90%).
              </p>
            </div>
          </div>
        </section>

        {/* ACCOUNT */}
        <section className="iron-card p-4 space-y-3">
          <div className="iron-section-header">
            <span>ACCOUNT & AUTH</span>
          </div>
          <button
            type="button"
            className="w-full py-2.5 bg-[#131312] hover:bg-[#1A1A18] text-[#C8471B] font-condensed font-bold text-xs uppercase border border-[#C8471B]/30 rounded-[2px] flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>SIGN OUT</span>
          </button>
        </section>
      </div>
    </div>
  );
}
