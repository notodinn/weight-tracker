import { Profile, BodyweightEntry, MeasurementEntry } from '@/lib/types/biometrics';
import { getStoredDays, getStoredHistory } from './store';

const BIOMETRICS_KEYS = {
  PROFILE: 'iron_ledger_profile',
  WEIGHT: 'iron_ledger_bodyweight_history',
  MEASUREMENTS: 'iron_ledger_measurements_history',
};

export const DEFAULT_PROFILE: Profile = {
  id: 'default-profile',
  height_cm: 180,
  age: 28,
  sex: 'male',
  experience_years: 3,
  goal: 'hypertrophy',
  target_weight_kg: 85,
  unit: 'kg',
  stall_weeks: 6,
  deload_pct: 90,
};

export function getStoredProfile(): Profile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  const raw = localStorage.getItem(BIOMETRICS_KEYS.PROFILE);
  if (!raw) return DEFAULT_PROFILE;
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(profile: Profile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BIOMETRICS_KEYS.PROFILE, JSON.stringify(profile));
}

export function getStoredWeightHistory(): BodyweightEntry[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(BIOMETRICS_KEYS.WEIGHT);
  if (!raw) return [];
  try {
    const list: BodyweightEntry[] = JSON.parse(raw);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

export function logBodyweight(date: string, weightKg: number): BodyweightEntry {
  const history = getStoredWeightHistory();
  const existingIdx = history.findIndex((entry) => entry.date === date);

  let updated: BodyweightEntry[];
  let entryToReturn: BodyweightEntry;

  if (existingIdx >= 0) {
    entryToReturn = { ...history[existingIdx], weight_kg: weightKg };
    updated = [...history];
    updated[existingIdx] = entryToReturn;
  } else {
    entryToReturn = {
      id: `bw-${Date.now()}`,
      date,
      weight_kg: weightKg,
    };
    updated = [entryToReturn, ...history];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(BIOMETRICS_KEYS.WEIGHT, JSON.stringify(updated));
  }

  return entryToReturn;
}

export function getStoredMeasurements(): MeasurementEntry[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(BIOMETRICS_KEYS.MEASUREMENTS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function logMeasurement(type: MeasurementEntry['type'], value: number, date?: string): MeasurementEntry {
  const todayStr = date || new Date().toISOString().split('T')[0];
  const history = getStoredMeasurements();

  const newEntry: MeasurementEntry = {
    id: `meas-${Date.now()}`,
    date: todayStr,
    type,
    value,
  };

  const updated = [newEntry, ...history];
  if (typeof window !== 'undefined') {
    localStorage.setItem(BIOMETRICS_KEYS.MEASUREMENTS, JSON.stringify(updated));
  }
  return newEntry;
}

export function exportDataAsJSON(): string {
  const data = {
    profile: getStoredProfile(),
    program_days: getStoredDays(),
    weight_history: getStoredHistory(),
    bodyweight_history: getStoredWeightHistory(),
    measurements: getStoredMeasurements(),
    exported_at: new Date().toISOString(),
  };

  return JSON.stringify(data, null, 2);
}

export function exportDataAsCSV(): string {
  const bwList = getStoredWeightHistory();
  let csv = 'Type,Date,Value,Unit\n';
  bwList.forEach((b) => {
    csv += `Bodyweight,${b.date},${b.weight_kg},kg\n`;
  });

  const weightHistory = getStoredHistory();
  weightHistory.forEach((w) => {
    csv += `LiftIncrease,${w.date_time},${w.new_weight_kg},kg\n`;
  });

  return csv;
}
