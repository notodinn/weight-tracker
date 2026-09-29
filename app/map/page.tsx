'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header/Header';
import { AnatomicalBodyMap } from '@/components/Map/AnatomicalBodyMap';
import { calculateOverallStrengthScore } from '@/lib/strength/engine';
import { getStoredDays } from '@/lib/storage/store';
import { getStoredProfile } from '@/lib/storage/biometricsStore';
import { Info, X, CheckCircle } from 'lucide-react';

export default function MapPage() {
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const [selectedRegion, setSelectedRegion] = useState<string | null>('chest');
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [strengthData, setStrengthData] = useState<{
    overallScore: number;
    muscleScores: Record<string, { level: number; score: number }>;
  }>({ overallScore: 0, muscleScores: {} });

  useEffect(() => {
    const days = getStoredDays();
    const profile = getStoredProfile();
    const exercises = days.flatMap((d) => d.program_exercises.map((pe) => pe.exercise));
    const programExercises = days.flatMap((d) => d.program_exercises);

    const calculated = calculateOverallStrengthScore(
      exercises,
      programExercises,
      profile.target_weight_kg || 80,
      profile.sex || 'male'
    );
    setStrengthData(calculated);
  }, []);

  const days = getStoredDays();
  const allProgramExercises = days.flatMap((d) => d.program_exercises);

  // Compute weekly sets per muscle group from program (assuming 1 session per day per week)
  const weeklySetsPerMuscle: Record<string, number> = {};
  allProgramExercises.forEach((pe) => {
    const ex = pe.exercise;
    const sets = pe.sets || 3;

    if (ex.primary_muscle) {
      const key = ex.primary_muscle.toLowerCase().replace(/[^a-z0-9]/g, '_');
      weeklySetsPerMuscle[key] = (weeklySetsPerMuscle[key] || 0) + sets;
    }
    if (ex.secondary_muscles) {
      ex.secondary_muscles.forEach((sec) => {
        const key = sec.toLowerCase().replace(/[^a-z0-9]/g, '_');
        weeklySetsPerMuscle[key] = (weeklySetsPerMuscle[key] || 0) + Math.round(sets * 0.5);
      });
    }
  });

  // Contributing lifts for selected region
  const selectedRegionName = selectedRegion ? selectedRegion.toUpperCase().replace(/_/g, ' ') : '';
  const contributingLifts = allProgramExercises.filter((pe) => {
    const primaryMatch = pe.exercise.primary_muscle?.toLowerCase().includes(selectedRegion || '');
    const secondaryMatch = pe.exercise.secondary_muscles?.some((m) =>
      m.toLowerCase().includes(selectedRegion || '')
    );
    return primaryMatch || secondaryMatch;
  });

  // Rank muscles strongest -> weakest
  const rankedMuscles = Object.entries(strengthData.muscleScores)
    .map(([muscle, data]) => ({ muscle, ...data }))
    .sort((a, b) => b.score - a.score);

  const strongestMuscle = rankedMuscles[0]?.muscle;
  const laggingMuscle = rankedMuscles[rankedMuscles.length - 1]?.muscle;

  return (
    <div className="flex flex-col min-h-full pb-8">
      <Header title="STRENGTH MAP" subtitle="5-LEVEL ANATOMICAL MUSCLE HEATMAP" />

      <div className="p-5 space-y-5">
        {/* FRONT / BACK SEGMENTED TOGGLE */}
        <div className="flex bg-[#131312] p-1 border border-[#232320] rounded-[6px]">
          <button
            type="button"
            onClick={() => setViewSide('front')}
            className={`flex-1 py-2 font-condensed text-xs tracking-wider transition-colors rounded-[4px] ${
              viewSide === 'front'
                ? 'bg-[#C8471B] text-[#E8E6E1] font-bold'
                : 'text-[#8A8880] hover:text-[#E8E6E1] font-medium'
            }`}
          >
            FRONT ANTERIOR
          </button>
          <button
            type="button"
            onClick={() => setViewSide('back')}
            className={`flex-1 py-2 font-condensed text-xs tracking-wider transition-colors rounded-[4px] ${
              viewSide === 'back'
                ? 'bg-[#C8471B] text-[#E8E6E1] font-bold'
                : 'text-[#8A8880] hover:text-[#E8E6E1] font-medium'
            }`}
          >
            BACK POSTERIOR
          </button>
        </div>

        {/* 5-LEVEL LEGEND */}
        <div className="iron-card p-4 space-y-2.5">
          <div className="text-[10px] font-condensed font-bold text-[#8A8880] uppercase">
            STRENGTH LEVELS LEGEND
          </div>
          <div className="grid grid-cols-5 gap-1.5 text-[9px] font-mono-tabular text-center">
            <div className="p-1.5 bg-[#1A1A18] border border-[#232320] text-[#8A8880] rounded-[3px]">L0: NONE</div>
            <div className="p-1.5 bg-[#3A2A24] text-[#E8E6E1] rounded-[3px]">L1: BEGIN</div>
            <div className="p-1.5 bg-[#5E3020] text-[#E8E6E1] rounded-[3px]">L2: NOVICE</div>
            <div className="p-1.5 bg-[#8F3A18] text-[#E8E6E1] rounded-[3px]">L3: INTERM</div>
            <div className="p-1.5 bg-[#C8471B] text-[#E8E6E1] font-bold rounded-[3px]">L4: ADV</div>
          </div>
        </div>

        {/* ANATOMICAL SVG BODY MAP */}
        <AnatomicalBodyMap
          side={viewSide}
          muscleLevels={strengthData.muscleScores}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
        />

        {/* SELECTED MUSCLE DETAIL CARD */}
        {selectedRegion && (
          <div className="iron-card p-5 space-y-4 bg-[#1A1A18] border-[#33332E]">
            <div className="flex items-center justify-between border-b border-[#232320] pb-2.5">
              <div>
                <h3 className="font-condensed text-base font-bold text-[#E8E6E1]">
                  {selectedRegionName}
                </h3>
                <p className="text-xs text-[#8A8880] font-mono-tabular">
                  LEVEL {strengthData.muscleScores[selectedRegion]?.level || 0} — SCORE:{' '}
                  {strengthData.muscleScores[selectedRegion]?.score || 0} / 1000
                </p>
              </div>

              {selectedRegion === strongestMuscle && (
                <span className="px-2 py-0.5 text-[10px] font-condensed font-bold bg-[#7A9A5B]/20 text-[#7A9A5B] border border-[#7A9A5B]/40 rounded-[3px]">
                  STRONGEST
                </span>
              )}

              {selectedRegion === laggingMuscle && (
                <span className="px-2 py-0.5 text-[10px] font-condensed font-bold bg-[#C8471B]/20 text-[#C8471B] border border-[#C8471B]/40 rounded-[3px]">
                  LAGGING
                </span>
              )}
            </div>

            {/* CONTRIBUTING LIFTS */}
            <div className="space-y-2 text-xs font-mono-tabular">
              <span className="text-[#8A8880] text-[10px] block font-condensed">CONTRIBUTING EXERCISES</span>
              {contributingLifts.length > 0 ? (
                contributingLifts.map((pe) => (
                  <div
                    key={pe.id}
                    className="flex items-center justify-between p-2.5 bg-[#131312] border border-[#232320] rounded-[4px]"
                  >
                    <span className="font-condensed font-bold text-[#E8E6E1]">{pe.exercise.name}</span>
                    <span className="text-[#E8E6E1] font-bold">
                      {pe.exercise.current_weight_kg > 0 ? `${pe.exercise.current_weight_kg} kg` : 'Not set'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[#5C5B56] text-xs">No direct program exercises assigned to this muscle.</p>
              )}
            </div>
          </div>
        )}

        {/* RANKED LIST STRONGEST -> WEAKEST */}
        <section className="iron-card p-5 space-y-3">
          <div className="iron-section-header">
            <span>STRONGEST → WEAKEST RANKING</span>
          </div>

          {rankedMuscles.length > 0 ? (
            <div className="space-y-2 text-xs font-mono-tabular">
              {rankedMuscles.map((r, idx) => (
                <div
                  key={r.muscle}
                  className="flex items-center justify-between p-2.5 bg-[#1A1A18] border border-[#232320] rounded-[4px]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#C8471B] font-bold text-xs">{(idx + 1).toString().padStart(2, '0')}</span>
                    <span className="font-condensed font-bold text-[#E8E6E1]">{r.muscle}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#8A8880]">{r.score} PTS</span>
                    <span className="px-2 py-0.5 bg-[#131312] border border-[#33332E] text-[10px] text-[#E8E6E1] rounded-[3px]">
                      L{r.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8A8880] text-center p-3">
              Log working weights in the Train tab to generate muscle rankings.
            </p>
          )}
        </section>

        {/* WEEKLY SETS BENCHMARK */}
        <section className="iron-card p-5 space-y-3">
          <div className="iron-section-header">
            <span>WEEKLY SETS VS HYPERTROPHY TARGET (10-20 SETS/WK)</span>
          </div>

          <div className="space-y-3">
            {Object.entries(weeklySetsPerMuscle).map(([muscleKey, sets]) => {
              const displayName = muscleKey.toUpperCase().replace(/_/g, ' ');
              const isOptimal = sets >= 10 && sets <= 20;

              return (
                <div key={muscleKey} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono-tabular">
                    <span className="font-condensed text-[#E8E6E1]">{displayName}</span>
                    <span className={isOptimal ? 'text-[#7A9A5B] font-bold' : 'text-[#8A8880]'}>
                      {sets} SETS / WK {isOptimal ? '(OPTIMAL)' : ''}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#1A1A18] border border-[#232320] rounded-[2px] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOptimal ? 'bg-[#7A9A5B]' : 'bg-[#C8471B]'
                      }`}
                      style={{ width: `${Math.min(100, (sets / 20) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* TRANSPARENCY INFO SHEET BUTTON */}
        <button
          type="button"
          onClick={() => setIsInfoOpen(true)}
          className="w-full py-3 bg-[#131312] hover:bg-[#1A1A18] text-[#8A8880] hover:text-[#E8E6E1] text-xs font-condensed font-bold border border-[#232320] rounded-[6px] flex items-center justify-center gap-2 transition-colors uppercase"
        >
          <Info className="w-4 h-4 text-[#C8471B]" />
          <span>HOW THIS IS CALCULATED (EPLEY e1RM & BW RATIOS)</span>
        </button>
      </div>

      {/* TRANSPARENCY MODAL */}
      {isInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-sm bg-[#131312] border border-[#33332E] rounded-[10px] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#232320] pb-2.5">
              <h3 className="font-condensed text-base font-bold text-[#E8E6E1]">
                TRANSPARENT STRENGTH MATH
              </h3>
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="p-1 text-[#8A8880] hover:text-[#E8E6E1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#8A8880] space-y-3 leading-relaxed font-sans">
              <p>
                <strong className="text-[#E8E6E1]">1. Estimated 1RM (Epley Formula):</strong>
                <br />
                <code className="text-[#C8471B]">e1RM = weight × (1 + reps / 30)</code> where reps = top of prescribed range - 1.
              </p>
              <p>
                <strong className="text-[#E8E6E1]">2. Dumbbell Scaling:</strong>
                <br />
                Dumbbell lift weight is entered per-hand and doubled for bodyweight ratio calculations.
              </p>
              <p>
                <strong className="text-[#E8E6E1]">3. Muscle Weighting:</strong>
                <br />
                Primary target muscles receive 1.0 weight score factor; secondary muscles receive 0.4.
              </p>
              <p>
                <strong className="text-[#E8E6E1]">4. 0-1000 Strength Score:</strong>
                <br />
                Weighted aggregate across major muscle groups scaled relative to male/female strength standards.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsInfoOpen(false)}
              className="w-full py-2.5 bg-[#C8471B] text-[#E8E6E1] font-condensed font-bold text-xs uppercase rounded-[4px]"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
