'use client';

import React, { useState, useEffect } from 'react';
import { Profile } from '@/lib/types/biometrics';
import { X, Check } from 'lucide-react';

interface EditProfileModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Profile) => void;
}

export function EditProfileModal({
  profile,
  isOpen,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [heightCm, setHeightCm] = useState(profile.height_cm || 180);
  const [age, setAge] = useState(profile.age || 25);
  const [sex, setSex] = useState<'male' | 'female'>(profile.sex || 'male');
  const [expYears, setExpYears] = useState(profile.experience_years || 2);
  const [goal, setGoal] = useState(profile.goal || 'hypertrophy');
  const [targetWeight, setTargetWeight] = useState(profile.target_weight_kg || 85);

  useEffect(() => {
    if (profile) {
      setHeightCm(profile.height_cm);
      setAge(profile.age || 25);
      setSex(profile.sex);
      setExpYears(profile.experience_years);
      setGoal(profile.goal);
      setTargetWeight(profile.target_weight_kg || 85);
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...profile,
      height_cm: Number(heightCm),
      age: Number(age),
      sex,
      experience_years: Number(expYears),
      goal,
      target_weight_kg: Number(targetWeight),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-none p-0">
      <div className="w-full max-w-[480px] bg-[#131312] border-t border-[#33332E] rounded-t-[12px] p-5 space-y-5 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between border-b border-[#232320] pb-3">
          <h3 className="font-condensed text-lg font-bold text-[#E8E6E1]">
            EDIT LIFTER PROFILE
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-condensed font-bold text-[#8A8880] uppercase block">
                HEIGHT (CM)
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full bg-[#1A1A18] border border-[#232320] px-3.5 py-2.5 text-xs text-[#E8E6E1] font-mono-tabular focus:outline-none focus:border-[#C8471B] rounded-[4px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-condensed font-bold text-[#8A8880] uppercase block">
                AGE (YEARS)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-[#1A1A18] border border-[#232320] px-3.5 py-2.5 text-xs text-[#E8E6E1] font-mono-tabular focus:outline-none focus:border-[#C8471B] rounded-[4px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-condensed font-bold text-[#8A8880] uppercase block">
                SEX (FOR STANDARDS)
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as 'male' | 'female')}
                className="w-full bg-[#1A1A18] border border-[#232320] px-3 py-2.5 text-xs text-[#E8E6E1] focus:outline-none focus:border-[#C8471B] rounded-[4px]"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-condensed font-bold text-[#8A8880] uppercase block">
                TRAINING EXP (YRS)
              </label>
              <input
                type="number"
                step="0.5"
                value={expYears}
                onChange={(e) => setExpYears(Number(e.target.value))}
                className="w-full bg-[#1A1A18] border border-[#232320] px-3.5 py-2.5 text-xs text-[#E8E6E1] font-mono-tabular focus:outline-none focus:border-[#C8471B] rounded-[4px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-condensed font-bold text-[#8A8880] uppercase block">
                TRAINING GOAL
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-[#1A1A18] border border-[#232320] px-3.5 py-2.5 text-xs text-[#E8E6E1] focus:outline-none focus:border-[#C8471B] rounded-[4px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-condensed font-bold text-[#8A8880] uppercase block">
                TARGET WEIGHT (KG)
              </label>
              <input
                type="number"
                step="0.5"
                value={targetWeight}
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                className="w-full bg-[#1A1A18] border border-[#232320] px-3.5 py-2.5 text-xs text-[#E8E6E1] font-mono-tabular focus:outline-none focus:border-[#C8471B] rounded-[4px]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#C8471B] hover:bg-[#A33914] text-[#E8E6E1] font-condensed font-bold text-sm tracking-wider uppercase rounded-[4px] transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <Check className="w-4 h-4" />
            <span>SAVE PROFILE</span>
          </button>
        </form>
      </div>
    </div>
  );
}
