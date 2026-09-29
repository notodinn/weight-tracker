'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Dumbbell, Bot, Activity, User } from 'lucide-react';

export type TabId = 'overview' | 'train' | 'coach' | 'map' | 'body';

interface TabItem {
  id: TabId;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const TABS: TabItem[] = [
  { id: 'overview', label: 'OVERVIEW', href: '/overview', icon: LayoutDashboard },
  { id: 'train', label: 'TRAIN', href: '/train', icon: Dumbbell },
  { id: 'coach', label: 'COACH', href: '/coach', icon: Bot },
  { id: 'map', label: 'MAP', href: '/map', icon: Activity },
  { id: 'body', label: 'BODY', href: '/body', icon: User },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#131312] border-t border-[#2A2A27]"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      aria-label="Main Navigation"
    >
      <div className="max-w-[480px] mx-auto grid grid-cols-5 h-14">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || (pathname === '/' && tab.id === 'overview');
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors duration-150 ${
                isActive
                  ? 'text-[#C8471B] bg-[#1A1A18]'
                  : 'text-[#8A8880] hover:text-[#E8E6E1] bg-transparent'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C8471B]" />
              )}
              <Icon className="w-5 h-5 mb-0.5" strokeWidth={1.5} />
              <span className="font-condensed text-[10px] tracking-wider font-bold uppercase">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
