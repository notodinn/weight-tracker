import { Exercise, ProgramExercise } from '@/lib/types/program';

export interface StrengthStandard {
  key: string;
  name: string;
  // Bodyweight ratios for levels 1 (Beginner), 2 (Novice), 3 (Interm), 4 (Adv), 5 (Elite)
  ratios: {
    male: [number, number, number, number, number];
    female: [number, number, number, number, number];
  };
}

// Widely used male/female bodyweight strength ratio standards
export const STRENGTH_STANDARDS: Record<string, StrengthStandard> = {
  squat: {
    key: 'squat',
    name: 'Squat',
    ratios: {
      male: [0.8, 1.2, 1.5, 2.0, 2.4],
      female: [0.5, 0.8, 1.0, 1.4, 1.7],
    },
  },
  bench: {
    key: 'bench',
    name: 'Bench Press',
    ratios: {
      male: [0.6, 0.9, 1.25, 1.65, 2.0],
      female: [0.35, 0.55, 0.75, 1.0, 1.25],
    },
  },
  deadlift: {
    key: 'deadlift',
    name: 'Deadlift',
    ratios: {
      male: [1.0, 1.4, 1.8, 2.3, 2.8],
      female: [0.6, 0.9, 1.2, 1.6, 2.0],
    },
  },
  ohp: {
    key: 'ohp',
    name: 'Overhead Press',
    ratios: {
      male: [0.4, 0.6, 0.8, 1.05, 1.3],
      female: [0.25, 0.35, 0.5, 0.7, 0.9],
    },
  },
  row: {
    key: 'row',
    name: 'Barbell Row',
    ratios: {
      male: [0.5, 0.75, 1.0, 1.3, 1.6],
      female: [0.3, 0.45, 0.6, 0.8, 1.0],
    },
  },
  pullup: {
    key: 'pullup',
    name: 'Pull-Up',
    ratios: {
      male: [1.0, 1.15, 1.35, 1.6, 1.85],
      female: [0.85, 0.95, 1.1, 1.3, 1.5],
    },
  },
  dips: {
    key: 'dips',
    name: 'Dips',
    ratios: {
      male: [1.0, 1.2, 1.4, 1.7, 2.0],
      female: [0.85, 1.0, 1.15, 1.35, 1.6],
    },
  },
  leg_press: {
    key: 'leg_press',
    name: 'Leg Press',
    ratios: {
      male: [1.5, 2.2, 3.0, 4.0, 5.0],
      female: [1.0, 1.5, 2.0, 2.8, 3.5],
    },
  },
  lat_raise: {
    key: 'lat_raise',
    name: 'Lateral Raise',
    ratios: {
      male: [0.1, 0.15, 0.22, 0.3, 0.4],
      female: [0.05, 0.08, 0.12, 0.18, 0.25],
    },
  },
  bicep_curl: {
    key: 'bicep_curl',
    name: 'Bicep Curl',
    ratios: {
      male: [0.25, 0.38, 0.52, 0.7, 0.9],
      female: [0.12, 0.2, 0.3, 0.42, 0.55],
    },
  },
  tricep_ext: {
    key: 'tricep_ext',
    name: 'Tricep Pushdown',
    ratios: {
      male: [0.3, 0.45, 0.6, 0.8, 1.0],
      female: [0.15, 0.25, 0.35, 0.5, 0.65],
    },
  },
};

/**
 * Calculates estimated 1 Rep Max (e1RM) using Epley formula:
 * e1RM = weight * (1 + reps / 30)
 * For reps, assume top of prescribed range minus 1 (near failure).
 */
export function calculateEpleyE1RM(weightKg: number, repMax: number, isDumbbell: boolean): number {
  if (weightKg <= 0) return 0;
  const reps = Math.max(1, repMax - 1);
  const singleHandE1RM = weightKg * (1 + reps / 30);
  // Per-hand doubling for dumbbell exercises for BW ratio calculation
  return isDumbbell ? singleHandE1RM * 2 : singleHandE1RM;
}

/**
 * Calculates exercise strength level (0 to 5) from bodyweight ratio
 */
export function getExerciseStrengthLevel(
  e1RM: number,
  bodyweightKg: number,
  standardKey?: string,
  sex: 'male' | 'female' = 'male'
): { level: number; score: number; ratio: number } {
  const bw = bodyweightKg > 0 ? bodyweightKg : 80;
  const ratio = e1RM / bw;

  if (e1RM <= 0) return { level: 0, score: 0, ratio: 0 };

  const std = standardKey ? STRENGTH_STANDARDS[standardKey] : null;
  const thresholds = std
    ? std.ratios[sex]
    : [0.4, 0.7, 1.0, 1.4, 1.8]; // default fallback ratios

  let level = 0;
  if (ratio >= thresholds[4]) level = 5;
  else if (ratio >= thresholds[3]) level = 4;
  else if (ratio >= thresholds[2]) level = 3;
  else if (ratio >= thresholds[1]) level = 2;
  else if (ratio >= thresholds[0]) level = 1;

  // Continuous score scaling 0 to 1000
  const maxThreshold = thresholds[4];
  const score = Math.min(1000, Math.round((ratio / maxThreshold) * 900));

  return { level, score, ratio };
}

/**
 * Calculates overall 0-1000 STRENGTH SCORE across major muscle groups
 */
export function calculateOverallStrengthScore(
  exercises: Exercise[],
  programExercises: ProgramExercise[],
  bodyweightKg: number,
  sex: 'male' | 'female' = 'male'
): {
  overallScore: number;
  muscleScores: Record<string, { level: number; score: number }>;
} {
  const muscleScores: Record<string, { totalScore: number; totalWeight: number }> = {};

  exercises.forEach((ex) => {
    // Skip bonus exercises from polluting main score if user wants
    if (ex.is_bonus) return;

    // Find prescription
    const pe = programExercises.find((p) => p.exercise_id === ex.id);
    const repMax = pe ? pe.rep_max : 10;

    const e1RM = calculateEpleyE1RM(ex.current_weight_kg, repMax, ex.is_dumbbell);
    const { level, score } = getExerciseStrengthLevel(e1RM, bodyweightKg, ex.standard_key, sex);

    if (ex.primary_muscle) {
      const key = ex.primary_muscle;
      if (!muscleScores[key]) muscleScores[key] = { totalScore: 0, totalWeight: 0 };
      muscleScores[key].totalScore += score * 1.0;
      muscleScores[key].totalWeight += 1.0;
    }

    if (ex.secondary_muscles) {
      ex.secondary_muscles.forEach((sec) => {
        if (!muscleScores[sec]) muscleScores[sec] = { totalScore: 0, totalWeight: 0 };
        muscleScores[sec].totalScore += score * 0.4;
        muscleScores[sec].totalWeight += 0.4;
      });
    }
  });

  const finalMuscleMap: Record<string, { level: number; score: number }> = {};
  let aggregateScoreSum = 0;
  let muscleCount = 0;

  Object.entries(muscleScores).forEach(([muscle, data]) => {
    if (data.totalWeight > 0) {
      const avgScore = Math.round(data.totalScore / data.totalWeight);
      const level = Math.min(5, Math.floor((avgScore / 1000) * 5));
      finalMuscleMap[muscle] = { level, score: avgScore };

      aggregateScoreSum += avgScore;
      muscleCount += 1;
    }
  });

  const overallScore = muscleCount > 0 ? Math.round(aggregateScoreSum / muscleCount) : 0;

  return {
    overallScore,
    muscleScores: finalMuscleMap,
  };
}

/**
 * Detects exercises that have stalled beyond threshold weeks
 */
export function detectStalledExercises(
  exercises: Exercise[],
  history: { exercise_id: string; date_time: string; type: string }[],
  stallWeeksThreshold = 6
): { exercise: Exercise; daysStalled: number }[] {
  const now = new Date().getTime();
  const thresholdMs = stallWeeksThreshold * 7 * 24 * 60 * 60 * 1000;
  const stalled: { exercise: Exercise; daysStalled: number }[] = [];

  exercises.forEach((ex) => {
    if (ex.current_weight_kg <= 0) return; // skip uninitiated exercises

    const exHistory = history
      .filter((h) => h.exercise_id === ex.id && h.type === 'increase')
      .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());

    const lastIncreaseDate = exHistory.length > 0 ? new Date(exHistory[0].date_time).getTime() : 0;
    const diffMs = now - lastIncreaseDate;

    if (diffMs >= thresholdMs) {
      const daysStalled = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      stalled.push({ exercise: ex, daysStalled });
    }
  });

  return stalled.sort((a, b) => b.daysStalled - a.daysStalled);
}
