export type WeightChangeType = 'increase' | 'decrease' | 'correction';

export interface Exercise {
  id: string;
  user_id: string;
  name: string;
  equipment?: string;
  is_dumbbell: boolean;
  is_bonus: boolean;
  standard_key?: string;
  increment_kg: number;
  current_weight_kg: number;
  notes?: string;
  primary_muscle?: string;
  secondary_muscles?: string[];
}

export interface ProgramExercise {
  id: string;
  day_id: string;
  exercise_id: string;
  position: number;
  sets: number;
  rep_min: number;
  rep_max: number;
  notes?: string;
  exercise: Exercise;
}

export interface ProgramDay {
  id: string;
  user_id: string;
  name: string;
  position: number;
  weekday?: number;
  program_exercises: ProgramExercise[];
}

export interface WeightHistoryEntry {
  id: string;
  user_id: string;
  exercise_id: string;
  date_time: string;
  old_weight_kg: number;
  new_weight_kg: number;
  type: WeightChangeType;
  note?: string;
}

export interface Checkin {
  id: string;
  user_id: string;
  date: string;
  day_id?: string;
}
