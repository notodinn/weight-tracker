'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push('/overview');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0A] text-[#E8E6E1] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* WORDMARK BRAND */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center gap-2">
            <span className="w-3 h-3 bg-[#C8471B] inline-block" />
            <h1 className="font-condensed text-3xl font-bold tracking-widest text-[#E8E6E1]">
              IRON LEDGER
            </h1>
          </div>
          <p className="text-xs text-[#8A8880] tracking-wider uppercase font-mono-tabular">
            PERSONAL WEIGHT TRACKER & PROGRESSION
          </p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="iron-card p-6 space-y-4">
          <div className="iron-section-header">
            <span>SIGN IN</span>
          </div>

          {error && (
            <div className="p-3 bg-[#C8471B]/10 border border-[#C8471B] text-xs text-[#C8471B] rounded-[4px]">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-condensed font-bold text-[#8A8880] uppercase block">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lifter@ironledger.app"
              className="w-full bg-[#1A1A18] border border-[#232320] px-3.5 py-2.5 text-xs text-[#E8E6E1] placeholder-[#5C5B56] focus:outline-none focus:border-[#C8471B] rounded-[4px] font-mono-tabular"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-condensed font-bold text-[#8A8880] uppercase block">
              PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#1A1A18] border border-[#232320] px-3.5 py-2.5 text-xs text-[#E8E6E1] placeholder-[#5C5B56] focus:outline-none focus:border-[#C8471B] rounded-[4px] font-mono-tabular"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#C8471B] hover:bg-[#A33914] disabled:opacity-50 text-[#E8E6E1] font-condensed font-bold text-sm tracking-wider uppercase rounded-[4px] transition-colors mt-2"
          >
            {loading ? 'AUTHENTICATING...' : 'ENTER LEDGER'}
          </button>

          <p className="text-[11px] text-[#5C5B56] text-center font-mono-tabular pt-1">
            NO ACCOUNT?{' '}
            <Link href="/signup" className="text-[#C8471B] hover:text-[#E8814A] transition-colors">
              CREATE ONE
            </Link>
          </p>
        </form>

        <p className="text-[11px] text-[#5C5B56] text-center font-mono-tabular">
          SINGLE-USER ENCRYPTED AGGREGATE LEDGER
        </p>
      </div>
    </div>
  );
}
