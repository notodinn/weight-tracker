export interface Profile {
  id: string;
  height_cm: number;
  birth_date?: string;
  age?: number;
  sex: 'male' | 'female';
  experience_years: number;
  goal: string;
  target_weight_kg?: number;
  target_date?: string;
  unit: 'kg' | 'lb';
  stall_weeks: number;
  deload_pct: number;
}

export interface BodyweightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight_kg: number;
}

export type MeasurementType = 'bodyfat' | 'waist' | 'chest' | 'arms' | 'thighs';

export interface MeasurementEntry {
  id: string;
  date: string;
  type: MeasurementType;
  value: number;
}
