import { ProgramDay, Exercise, WeightHistoryEntry, Checkin, WeightChangeType } from '@/lib/types/program';

const STORAGE_KEYS = {
  DAYS: 'iron_ledger_program_days',
  HISTORY: 'iron_ledger_weight_history',
  CHECKINS: 'iron_ledger_checkins',
};

// INITIAL SEED DATA STRUCTURE FROM USER'S SPEC
export const INITIAL_PROGRAM_DAYS: ProgramDay[] = [
  {
    id: 'day-push',
    user_id: 'default-user',
    name: 'PUSH',
    position: 1,
    program_exercises: [
      {
        id: 'pe-1',
        day_id: 'day-push',
        exercise_id: 'ex-military-press',
        position: 1,
        sets: 5,
        rep_min: 5,
        rep_max: 5,
        notes: 'upphitun 2x8-10',
        exercise: {
          id: 'ex-military-press',
          user_id: 'default-user',
          name: 'Military Press',
          equipment: 'Barbell',
          is_dumbbell: false,
          is_bonus: false,
          standard_key: 'ohp',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Front Delts',
          secondary_muscles: ['Triceps', 'Traps'],
        },
      },
      {
        id: 'pe-2',
        day_id: 'day-push',
        exercise_id: 'ex-bench-press',
        position: 2,
        sets: 3,
        rep_min: 10,
        rep_max: 10,
        notes: 'upphitun 1x',
        exercise: {
          id: 'ex-bench-press',
          user_id: 'default-user',
          name: 'Bench press',
          equipment: 'Barbell',
          is_dumbbell: false,
          is_bonus: false,
          standard_key: 'bench',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Chest',
          secondary_muscles: ['Front Delts', 'Triceps'],
        },
      },
      {
        id: 'pe-3',
        day_id: 'day-push',
        exercise_id: 'ex-dips',
        position: 3,
        sets: 3,
        rep_min: 8,
        rep_max: 15,
        notes: 'to failure',
        exercise: {
          id: 'ex-dips',
          user_id: 'default-user',
          name: 'Dips',
          equipment: 'Bodyweight',
          is_dumbbell: false,
          is_bonus: false,
          standard_key: 'dips',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Chest',
          secondary_muscles: ['Triceps', 'Front Delts'],
        },
      },
      {
        id: 'pe-4',
        day_id: 'day-push',
        exercise_id: 'ex-lateral-raise',
        position: 4,
        sets: 3,
        rep_min: 10,
        rep_max: 10,
        exercise: {
          id: 'ex-lateral-raise',
          user_id: 'default-user',
          name: 'Lateral raise',
          equipment: 'Dumbbell',
          is_dumbbell: true,
          is_bonus: false,
          standard_key: 'lat_raise',
          increment_kg: 1.0,
          current_weight_kg: 0,
          primary_muscle: 'Side Delts',
        },
      },
      {
        id: 'pe-5',
        day_id: 'day-push',
        exercise_id: 'ex-tricep-pushdown',
        position: 5,
        sets: 3,
        rep_min: 12,
        rep_max: 12,
        exercise: {
          id: 'ex-tricep-pushdown',
          user_id: 'default-user',
          name: 'Tricep push down',
          equipment: 'Cable',
          is_dumbbell: false,
          is_bonus: false,
          standard_key: 'tricep_ext',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Triceps',
        },
      },
      {
        id: 'pe-6',
        day_id: 'day-push',
        exercise_id: 'ex-incline-bench',
        position: 6,
        sets: 3,
        rep_min: 10,
        rep_max: 10,
        notes: 'dropsett failure',
        exercise: {
          id: 'ex-incline-bench',
          user_id: 'default-user',
          name: 'Incline bench press',
          equipment: 'Barbell',
          is_dumbbell: false,
          is_bonus: false,
          standard_key: 'incline_bench',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Chest',
          secondary_muscles: ['Front Delts', 'Triceps'],
        },
      },
      {
        id: 'pe-7',
        day_id: 'day-push',
        exercise_id: 'ex-seated-calf-raise-push',
        position: 7,
        sets: 3,
        rep_min: 10,
        rep_max: 10,
        notes: 'Aukaæfing',
        exercise: {
          id: 'ex-seated-calf-raise-push',
          user_id: 'default-user',
          name: 'Seated calf raise',
          equipment: 'Machine',
          is_dumbbell: false,
          is_bonus: true,
          standard_key: 'calf_raise',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Calves',
        },
      },
      {
        id: 'pe-8',
        day_id: 'day-push',
        exercise_id: 'ex-facepull',
        position: 8,
        sets: 3,
        rep_min: 10,
        rep_max: 10,
        notes: 'Aukaæfing',
        exercise: {
          id: 'ex-facepull',
          user_id: 'default-user',
          name: 'Facepull',
          equipment: 'Cable',
          is_dumbbell: false,
          is_bonus: true,
          standard_key: 'facepull',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Rear Delts',
          secondary_muscles: ['Traps'],
        },
      },
    ],
  },
  {
    id: 'day-pull',
    user_id: 'default-user',
    name: 'PULL',
    position: 2,
    program_exercises: [
      {
        id: 'pe-9',
        day_id: 'day-pull',
        exercise_id: 'ex-pullups',
        position: 1,
        sets: 3,
        rep_min: 8,
        rep_max: 15,
        notes: 'to failure',
        exercise: {
          id: 'ex-pullups',
          user_id: 'default-user',
          name: 'Pull Ups',
          equipment: 'Bodyweight',
          is_dumbbell: false,
          is_bonus: false,
          standard_key: 'pullup',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Upper Back / Lats',
          secondary_muscles: ['Biceps'],
        },
      },
      {
        id: 'pe-10',
        day_id: 'day-pull',
        exercise_id: 'ex-barbell-row',
        position: 2,
        sets: 3,
        rep_min: 8,
        rep_max: 10,
        exercise: {
          id: 'ex-barbell-row',
          user_id: 'default-user',
          name: 'Bent Over Row Barbell',
          equipment: 'Barbell',
          is_dumbbell: false,
          is_bonus: false,
          standard_key: 'row',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Upper Back / Lats',
          secondary_muscles: ['Biceps', 'Lower Back'],
        },
      },
      {
        id: 'pe-11',
        day_id: 'day-pull',
        exercise_id: 'ex-tbar-row',
        position: 3,
        sets: 3,
        rep_min: 8,
        rep_max: 8,
        exercise: {
          id: 'ex-tbar-row',
          user_id: 'default-user',
          name: 'T-Bar row',
          equipment: 'Machine',
          is_dumbbell: false,
          is_bonus: false,
          standard_key: 'tbar_row',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Upper Back / Lats',
          secondary_muscles: ['Biceps'],
        },
      },
      {
        id: 'pe-12',
        day_id: 'day-pull',
        exercise_id: 'ex-db-shrug',
        position: 4,
        sets: 3,
        rep_min: 15,
        rep_max: 15,
        exercise: {
          id: 'ex-db-shrug',
          user_id: 'default-user',
          name: 'Dumbell shrug',
          equipment: 'Dumbbell',
          is_dumbbell: true,
          is_bonus: false,
          standard_key: 'shrug',
          increment_kg: 2.0,
          current_weight_kg: 0,
          primary_muscle: 'Traps',
        },
      },
      {
        id: 'pe-13',
        day_id: 'day-pull',
        exercise_id: 'ex-preacher-curl',
        position: 5,
        sets: 3,
        rep_min: 8,
        rep_max: 8,
        exercise: {
          id: 'ex-preacher-curl',
          user_id: 'default-user',
          name: 'Preacher Curl EZ Curl Bar',
          equipment: 'EZ Bar',
          is_dumbbell: false,
          is_bonus: false,
          standard_key: 'bicep_curl',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Biceps',
        },
      },
      {
        id: 'pe-14',
        day_id: 'day-pull',
        exercise_id: 'ex-hammer-curl',
        position: 6,
        sets: 3,
        rep_min: 8,
        rep_max: 8,
        exercise: {
          id: 'ex-hammer-curl',
          user_id: 'default-user',
          name: 'Hammer Curl',
          equipment: 'Dumbbell',
          is_dumbbell: true,
          is_bonus: false,
          standard_key: 'hammer_curl',
          increment_kg: 1.0,
          current_weight_kg: 0,
          primary_muscle: 'Biceps',
          secondary_muscles: ['Forearms'],
        },
      },
      {
        id: 'pe-15',
        day_id: 'day-pull',
        exercise_id: 'ex-incline-bench-pull',
        position: 7,
        sets: 3,
        rep_min: 10,
        rep_max: 10,
        notes: 'Aukaæfing',
        exercise: {
          id: 'ex-incline-bench-pull',
          user_id: 'default-user',
          name: 'Incline Bench Press',
          equipment: 'Barbell',
          is_dumbbell: false,
          is_bonus: true,
          standard_key: 'incline_bench',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Chest',
        },
      },
    ],
  },
  {
    id: 'day-legs',
    user_id: 'default-user',
    name: 'LEGS',
    position: 3,
    program_exercises: [
      {
        id: 'pe-16',
        day_id: 'day-legs',
        exercise_id: 'ex-squat',
        position: 1,
        sets: 5,
        rep_min: 5,
        rep_max: 5,
        exercise: {
          id: 'ex-squat',
          user_id: 'default-user',
          name: 'Barbell Squat',
          equipment: 'Barbell',
          is_dumbbell: false,
          is_bonus: false,
          standard_key: 'squat',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Quads',
          secondary_muscles: ['Glutes', 'Lower Back'],
        },
      },
      {
        id: 'pe-17',
        day_id: 'day-legs',
        exercise_id: 'ex-deadlift',
        position: 2,
        sets: 5,
        rep_min: 5,
        rep_max: 5,
        exercise: {
          id: 'ex-deadlift',
          user_id: 'default-user',
          name: 'Deadlift',
          equipment: 'Barbell',
          is_dumbbell: false,
          is_bonus: false,
          standard_key: 'deadlift',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Hamstrings',
          secondary_muscles: ['Glutes', 'Lower Back', 'Traps'],
        },
      },
      {
        id: 'pe-18',
        day_id: 'day-legs',
        exercise_id: 'ex-leg-press',
        position: 3,
        sets: 3,
        rep_min: 10,
        rep_max: 10,
        exercise: {
          id: 'ex-leg-press',
          user_id: 'default-user',
          name: 'Leg Press',
          equipment: 'Machine',
          is_dumbbell: false,
          is_bonus: false,
          standard_key: 'leg_press',
          increment_kg: 5.0,
          current_weight_kg: 0,
          primary_muscle: 'Quads',
          secondary_muscles: ['Glutes'],
        },
      },
      {
        id: 'pe-19',
        day_id: 'day-legs',
        exercise_id: 'ex-hamstring-curl',
        position: 4,
        sets: 3,
        rep_min: 10,
        rep_max: 10,
        exercise: {
          id: 'ex-hamstring-curl',
          user_id: 'default-user',
          name: 'Hamstring curl',
          equipment: 'Machine',
          is_dumbbell: false,
          is_bonus: false,
          standard_key: 'leg_curl',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Hamstrings',
        },
      },
      {
        id: 'pe-20',
        day_id: 'day-legs',
        exercise_id: 'ex-leg-extension',
        position: 5,
        sets: 3,
        rep_min: 10,
        rep_max: 10,
        exercise: {
          id: 'ex-leg-extension',
          user_id: 'default-user',
          name: 'Leg Extension',
          equipment: 'Machine',
          is_dumbbell: false,
          is_bonus: false,
          standard_key: 'leg_extension',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Quads',
        },
      },
      {
        id: 'pe-21',
        day_id: 'day-legs',
        exercise_id: 'ex-seated-calf-raises',
        position: 6,
        sets: 3,
        rep_min: 12,
        rep_max: 12,
        exercise: {
          id: 'ex-seated-calf-raises',
          user_id: 'default-user',
          name: 'Seated Calf Raises',
          equipment: 'Machine',
          is_dumbbell: false,
          is_bonus: false,
          standard_key: 'calf_raise',
          increment_kg: 2.5,
          current_weight_kg: 0,
          primary_muscle: 'Calves',
        },
      },
      {
        id: 'pe-22',
        day_id: 'day-legs',
        exercise_id: 'ex-lateral-front-raise-superset',
        position: 7,
        sets: 3,
        rep_min: 10,
        rep_max: 10,
        notes: 'Aukaæfing Superset',
        exercise: {
          id: 'ex-lateral-front-raise-superset',
          user_id: 'default-user',
          name: 'Lateral raise - Front raise Superset',
          equipment: 'Dumbbell',
          is_dumbbell: true,
          is_bonus: true,
          standard_key: 'lat_raise',
          increment_kg: 1.0,
          current_weight_kg: 0,
          primary_muscle: 'Side Delts',
          secondary_muscles: ['Front Delts'],
        },
      },
    ],
  },
];

export function getStoredDays(): ProgramDay[] {
  if (typeof window === 'undefined') return INITIAL_PROGRAM_DAYS;
  const raw = localStorage.getItem(STORAGE_KEYS.DAYS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.DAYS, JSON.stringify(INITIAL_PROGRAM_DAYS));
    return INITIAL_PROGRAM_DAYS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROGRAM_DAYS;
  }
}

export function saveStoredDays(days: ProgramDay[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.DAYS, JSON.stringify(days));
}

export function getStoredHistory(exerciseId?: string): WeightHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
  if (!raw) return [];
  try {
    const list: WeightHistoryEntry[] = JSON.parse(raw);
    if (exerciseId) {
      return list.filter((h) => h.exercise_id === exerciseId);
    }
    return list;
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: Omit<WeightHistoryEntry, 'id' | 'user_id' | 'date_time'>): WeightHistoryEntry {
  const newEntry: WeightHistoryEntry = {
    ...entry,
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user_id: 'default-user',
    date_time: new Date().toISOString(),
  };

  const list = getStoredHistory();
  const updated = [newEntry, ...list];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  }
  return newEntry;
}

export function removeHistoryEntry(id: string) {
  const list = getStoredHistory();
  const updated = list.filter((h) => h.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  }
}

export function getStoredCheckins(): Checkin[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.CHECKINS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addCheckin(dayId?: string): Checkin {
  const todayStr = new Date().toISOString().split('T')[0];
  const list = getStoredCheckins();
  const existing = list.find((c) => c.date === todayStr);
  if (existing) return existing;

  const newCheckin: Checkin = {
    id: `chk-${Date.now()}`,
    user_id: 'default-user',
    date: todayStr,
    day_id: dayId,
  };
  const updated = [newCheckin, ...list];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(updated));
  }
  return newCheckin;
}

export function roundToNearestIncrement(val: number, step = 0.5): number {
  if (val <= 0) return 0;
  return Math.round(val / step) * step;
}
