'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showSettings?: boolean;
}

export function Header({ title, subtitle, showSettings = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0B0A]/95 border-b border-[#2A2A27] px-4 py-3 backdrop-none">
      <div className="max-w-[480px] mx-auto flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#C8471B] inline-block" />
            <h1 className="font-condensed text-lg font-bold tracking-widest text-[#E8E6E1]">
              {title || 'IRON LEDGER'}
            </h1>
          </div>
          {subtitle && (
            <p className="text-[11px] text-[#8A8880] tracking-wide font-mono-tabular uppercase mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {showSettings && (
          <Link
            href="/settings"
            className="p-2 border border-[#2A2A27] bg-[#131312] text-[#8A8880] hover:text-[#E8E6E1] hover:border-[#3A3A36] transition-colors rounded-[3px]"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        )}
      </div>
    </header>
  );
}
