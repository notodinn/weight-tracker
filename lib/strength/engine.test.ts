import { describe, it, expect } from 'vitest';
import {
  calculateEpleyE1RM,
  getExerciseStrengthLevel,
  calculateOverallStrengthScore,
  detectStalledExercises,
} from './engine';
import { roundToNearestIncrement } from '@/lib/storage/store';
import { Exercise, ProgramExercise } from '@/lib/types/program';

describe('Strength Calculation Engine', () => {
  it('calculates Epley e1RM correctly for barbell lifts', () => {
    // 100kg for repMax 10 (reps = 9 near failure) -> 100 * (1 + 9/30) = 130kg
    const e1RM = calculateEpleyE1RM(100, 10, false);
    expect(e1RM).toBeCloseTo(130.0, 1);
  });

  it('doubles single-hand weight for dumbbell lifts in e1RM calculation', () => {
    // 20kg dumbbell for repMax 10 -> (20 * 1.3) * 2 = 52kg
    const e1RM = calculateEpleyE1RM(20, 10, true);
    expect(e1RM).toBeCloseTo(52.0, 1);
  });

  it('correctly maps bodyweight ratios to strength levels (0-5)', () => {
    const e1RM = 120;
    const bw = 80; // ratio = 1.5
    const { level } = getExerciseStrengthLevel(e1RM, bw, 'squat', 'male');
    // For squat male, ratio 1.5 corresponds to Intermediate (Level 3)
    expect(level).toBe(3);
  });

  it('computes transparent overall 0-1000 strength score', () => {
    const mockExercises: Exercise[] = [
      {
        id: 'ex-bench',
        user_id: 'u1',
        name: 'Bench Press',
        is_dumbbell: false,
        is_bonus: false,
        increment_kg: 2.5,
        current_weight_kg: 100,
        standard_key: 'bench',
        primary_muscle: 'Chest',
      },
      {
        id: 'ex-squat',
        user_id: 'u1',
        name: 'Barbell Squat',
        is_dumbbell: false,
        is_bonus: false,
        increment_kg: 2.5,
        current_weight_kg: 120,
        standard_key: 'squat',
        primary_muscle: 'Quads',
      },
    ];

    const mockProgramExercises: ProgramExercise[] = [
      {
        id: 'pe-1',
        day_id: 'd1',
        exercise_id: 'ex-bench',
        position: 1,
        sets: 3,
        rep_min: 10,
        rep_max: 10,
        exercise: mockExercises[0],
      },
      {
        id: 'pe-2',
        day_id: 'd1',
        exercise_id: 'ex-squat',
        position: 2,
        sets: 5,
        rep_min: 5,
        rep_max: 5,
        exercise: mockExercises[1],
      },
    ];

    const result = calculateOverallStrengthScore(mockExercises, mockProgramExercises, 80, 'male');
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.overallScore).toBeLessThanOrEqual(1000);
    expect(result.muscleScores['Chest']).toBeDefined();
    expect(result.muscleScores['Quads']).toBeDefined();
  });

  it('detects stalled exercises when no increase occurs for 6+ weeks', () => {
    const mockExercises: Exercise[] = [
      {
        id: 'ex-ohp',
        user_id: 'u1',
        name: 'Military Press',
        is_dumbbell: false,
        is_bonus: false,
        increment_kg: 2.5,
        current_weight_kg: 60,
      },
    ];

    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 50); // 50 days ago (> 6 weeks)

    const mockHistory = [
      {
        exercise_id: 'ex-ohp',
        date_time: oldDate.toISOString(),
        type: 'increase',
      },
    ];

    const stalled = detectStalledExercises(mockExercises, mockHistory, 6);
    expect(stalled.length).toBe(1);
    expect(stalled[0].exercise.name).toBe('Military Press');
    expect(stalled[0].daysStalled).toBeGreaterThanOrEqual(49);
  });

  it('rounds numbers to nearest plate increment accurately', () => {
    expect(roundToNearestIncrement(82.3, 0.5)).toBe(82.5);
    expect(roundToNearestIncrement(82.1, 0.5)).toBe(82.0);
    expect(roundToNearestIncrement(81.25, 2.5)).toBe(82.5);
  });
});
