'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header/Header';
import { BodyweightChart } from '@/components/Body/BodyweightChart';
import { LogWeightModal } from '@/components/Body/LogWeightModal';
import { EditProfileModal } from '@/components/Body/EditProfileModal';
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredWeightHistory,
  logBodyweight,
  getStoredMeasurements,
  logMeasurement,
  exportDataAsJSON,
  exportDataAsCSV,
} from '@/lib/storage/biometricsStore';
import { getStoredDays } from '@/lib/storage/store';
import { Profile, BodyweightEntry, MeasurementEntry } from '@/lib/types/biometrics';
import { Plus, Download, Edit2, TrendingDown, TrendingUp, Info } from 'lucide-react';

export default function BodyPage() {
  const [profile, setProfile] = useState<Profile>(getStoredProfile());
  const [weightHistory, setWeightHistory] = useState<BodyweightEntry[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>([]);
  const [isLogWeightOpen, setIsLogWeightOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    setProfile(getStoredProfile());
    setWeightHistory(getStoredWeightHistory());
    setMeasurements(getStoredMeasurements());
  }, []);

  // Compute latest bodyweight and 30d change
  const latestWeightEntry = weightHistory[0];
  const latestWeight = latestWeightEntry?.weight_kg || 0;

  // 30-day delta calculation
  let deltaText = 'No prior data';
  let deltaValue = 0;
  if (weightHistory.length > 1) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const olderEntry = weightHistory.find(
      (e) => new Date(e.date).getTime() <= thirtyDaysAgo.getTime()
    ) || weightHistory[weightHistory.length - 1];

    if (olderEntry && olderEntry !== latestWeightEntry) {
      deltaValue = Number((latestWeight - olderEntry.weight_kg).toFixed(1));
      deltaText = `${deltaValue >= 0 ? '+' : ''}${deltaValue} kg in 30d`;
    }
  }

  // Compute BMI
  let bmi = 0;
  if (latestWeight > 0 && profile.height_cm > 0) {
    const heightMeters = profile.height_cm / 100;
    bmi = Number((latestWeight / (heightMeters * heightMeters)).toFixed(1));
  }

  // Compute BW-relative strength ratios from logged lifts
  const programDays = getStoredDays();
  const allExercises = programDays.flatMap((d) => d.program_exercises.map((pe) => pe.exercise));

  const squatWeight = allExercises.find((e) => e.standard_key === 'squat')?.current_weight_kg || 0;
  const benchWeight = allExercises.find((e) => e.standard_key === 'bench')?.current_weight_kg || 0;
  const deadliftWeight = allExercises.find((e) => e.standard_key === 'deadlift')?.current_weight_kg || 0;

  const squatRatio = latestWeight > 0 ? (squatWeight / latestWeight).toFixed(2) : '0.00';
  const benchRatio = latestWeight > 0 ? (benchWeight / latestWeight).toFixed(2) : '0.00';
  const deadliftRatio = latestWeight > 0 ? (deadliftWeight / latestWeight).toFixed(2) : '0.00';

  const handleSaveWeight = (date: string, weightKg: number) => {
    logBodyweight(date, weightKg);
    setWeightHistory(getStoredWeightHistory());
  };

  const handleSaveProfile = (updated: Profile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  const handleExportJSON = () => {
    const jsonStr = exportDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iron_ledger_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvStr = exportDataAsCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iron_ledger_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-full pb-8">
      <Header title="BIOMETRICS & BODY" subtitle="BODYWEIGHT LOG, MEASUREMENTS & PROFILE" />

      <div className="p-5 space-y-5">
        {/* LATEST BODYWEIGHT HERO CARD */}
        <section className="iron-card p-5 space-y-4">
          <div className="iron-section-header">
            <span>LATEST BODYWEIGHT</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-mono-tabular text-4xl font-bold text-[#E8E6E1]">
                {latestWeight > 0 ? latestWeight.toFixed(1) : '--.-'}
              </span>
              <span className="text-sm text-[#8A8880] font-mono-tabular ml-2">KG</span>
            </div>

            {latestWeight > 0 && deltaText !== 'No prior data' && (
              <div className="flex items-center gap-1.5 text-xs font-mono-tabular text-[#7A9A5B] bg-[#1A1A18] px-2.5 py-1 border border-[#232320] rounded-[4px]">
                {deltaValue <= 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                <span>{deltaText}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsLogWeightOpen(true)}
            className="w-full py-3 bg-[#C8471B] hover:bg-[#A33914] text-[#E8E6E1] font-condensed font-bold text-xs uppercase tracking-wider rounded-[4px] flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>LOG TODAY'S WEIGHT</span>
          </button>
        </section>

        {/* BODYWEIGHT SVG TREND CHART */}
        <BodyweightChart entries={weightHistory} />

        {/* DERIVED STATS & BW RATIOS */}
        <section className="iron-card p-5 space-y-4">
          <div className="iron-section-header">
            <span>DERIVED STATS & BW RATIOS</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 font-mono-tabular text-center">
            <div className="p-3 bg-[#1A1A18] border border-[#232320] rounded-[4px]">
              <span className="text-[10px] text-[#8A8880] block font-condensed">SQUAT / BW</span>
              <span className="text-base font-bold text-[#E8E6E1]">{squatRatio}x</span>
              <span className="text-[9px] text-[#5C5B56] block mt-0.5">{squatWeight} kg</span>
            </div>
            <div className="p-3 bg-[#1A1A18] border border-[#232320] rounded-[4px]">
              <span className="text-[10px] text-[#8A8880] block font-condensed">BENCH / BW</span>
              <span className="text-base font-bold text-[#E8E6E1]">{benchRatio}x</span>
              <span className="text-[9px] text-[#5C5B56] block mt-0.5">{benchWeight} kg</span>
            </div>
            <div className="p-3 bg-[#1A1A18] border border-[#232320] rounded-[4px]">
              <span className="text-[10px] text-[#8A8880] block font-condensed">DEADLIFT / BW</span>
              <span className="text-base font-bold text-[#E8E6E1]">{deadliftRatio}x</span>
              <span className="text-[9px] text-[#5C5B56] block mt-0.5">{deadliftWeight} kg</span>
            </div>
          </div>

          {/* BMI NOTE */}
          <div className="p-3 bg-[#1A1A18] border border-[#232320] rounded-[4px] flex items-center justify-between text-xs font-mono-tabular">
            <div>
              <span className="text-[#8A8880]">ESTIMATED BMI: </span>
              <span className="font-bold text-[#E8E6E1]">{bmi > 0 ? bmi : '--.-'}</span>
            </div>
            <span className="text-[10px] text-[#5C5B56] italic">Crude metric; muscle mass ignored</span>
          </div>
        </section>

        {/* PROFILE SUMMARY */}
        <section className="iron-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#232320] pb-2">
            <span className="font-condensed text-xs font-bold text-[#8A8880] uppercase tracking-wider">
              LIFTER PROFILE
            </span>
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="text-xs text-[#C8471B] font-condensed font-bold flex items-center gap-1 hover:underline"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>EDIT PROFILE</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono-tabular">
            <div>
              <span className="text-[#8A8880] text-[10px] block font-condensed">HEIGHT</span>
              <span className="text-[#E8E6E1]">{profile.height_cm} cm</span>
            </div>
            <div>
              <span className="text-[#8A8880] text-[10px] block font-condensed">AGE / SEX</span>
              <span className="text-[#E8E6E1]">{profile.age || '--'} Yrs / {profile.sex?.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-[#8A8880] text-[10px] block font-condensed">EXPERIENCE</span>
              <span className="text-[#E8E6E1]">{profile.experience_years} Years</span>
            </div>
            <div>
              <span className="text-[#8A8880] text-[10px] block font-condensed">GOAL / TARGET</span>
              <span className="text-[#E8E6E1]">{profile.goal?.toUpperCase()} ({profile.target_weight_kg || '--'} kg)</span>
            </div>
          </div>
        </section>

        {/* DATA EXPORT BUTTONS */}
        <section className="iron-card p-5 space-y-3">
          <div className="iron-section-header">
            <span>DATA EXPORT & BACKUP</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleExportJSON}
              className="py-2.5 bg-[#1A1A18] hover:bg-[#232320] text-[#E8E6E1] font-condensed font-bold text-xs uppercase border border-[#33332E] rounded-[4px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#C8471B]" />
              <span>EXPORT JSON</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="py-2.5 bg-[#1A1A18] hover:bg-[#232320] text-[#E8E6E1] font-condensed font-bold text-xs uppercase border border-[#33332E] rounded-[4px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#8A8880]" />
              <span>EXPORT CSV</span>
            </button>
          </div>
        </section>
      </div>

      {/* MODALS */}
      <LogWeightModal
        isOpen={isLogWeightOpen}
        initialWeight={latestWeight > 0 ? latestWeight : 80.0}
        onClose={() => setIsLogWeightOpen(false)}
        onSave={handleSaveWeight}
      />

      <EditProfileModal
        profile={profile}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
