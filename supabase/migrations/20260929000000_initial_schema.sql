-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  height_cm NUMERIC DEFAULT 180,
  birth_date DATE,
  sex TEXT DEFAULT 'male',
  experience_years NUMERIC DEFAULT 2,
  goal TEXT DEFAULT 'hypertrophy',
  target_weight_kg NUMERIC,
  target_date DATE,
  unit TEXT DEFAULT 'kg',
  stall_weeks INTEGER DEFAULT 6,
  deload_pct INTEGER DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. BIOMETRICS WEIGHT TABLE
CREATE TABLE IF NOT EXISTS biometrics_weight (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE biometrics_weight ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own weight log"
  ON biometrics_weight FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_biometrics_weight_user_date ON biometrics_weight(user_id, date DESC);

-- 3. BIOMETRICS MEASUREMENTS TABLE
CREATE TABLE IF NOT EXISTS biometrics_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL, -- waist, chest, arms, thighs, bodyfat
  value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE biometrics_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own measurements"
  ON biometrics_measurements FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_biometrics_meas_user_date ON biometrics_measurements(user_id, date DESC);

-- 4. MUSCLE GROUPS REFERENCE TABLE
CREATE TABLE IF NOT EXISTS muscle_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('front', 'back', 'both')),
  svg_region_id TEXT NOT NULL
);

-- Seed muscle groups reference table
INSERT INTO muscle_groups (id, name, side, svg_region_id) VALUES
  ('chest', 'Chest', 'front', 'chest'),
  ('front_delts', 'Front Delts', 'front', 'front_delts'),
  ('side_delts', 'Side Delts', 'both', 'side_delts'),
  ('rear_delts', 'Rear Delts', 'back', 'rear_delts'),
  ('traps', 'Traps', 'back', 'traps'),
  ('upper_back_lats', 'Upper Back / Lats', 'back', 'upper_back_lats'),
  ('lower_back', 'Lower Back', 'back', 'lower_back'),
  ('biceps', 'Biceps', 'front', 'biceps'),
  ('triceps', 'Triceps', 'back', 'triceps'),
  ('forearms', 'Forearms', 'both', 'forearms'),
  ('abs_core', 'Abs / Core', 'front', 'abs_core'),
  ('glutes', 'Glutes', 'back', 'glutes'),
  ('quads', 'Quads', 'front', 'quads'),
  ('hamstrings', 'Hamstrings', 'back', 'hamstrings'),
  ('calves', 'Calves', 'both', 'calves')
ON CONFLICT (id) DO NOTHING;

-- 5. EXERCISES TABLE
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  equipment TEXT,
  is_dumbbell BOOLEAN DEFAULT FALSE,
  is_bonus BOOLEAN DEFAULT FALSE,
  standard_key TEXT,
  increment_kg NUMERIC DEFAULT 2.5,
  current_weight_kg NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exercises"
  ON exercises FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_exercises_user_name ON exercises(user_id, name);

-- 6. EXERCISE MUSCLES JOIN TABLE
CREATE TABLE IF NOT EXISTS exercise_muscles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  muscle_group_id TEXT NOT NULL REFERENCES muscle_groups(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('primary', 'secondary')),
  UNIQUE(exercise_id, muscle_group_id)
);

ALTER TABLE exercise_muscles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage exercise muscles"
  ON exercise_muscles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM exercises WHERE id = exercise_muscles.exercise_id AND user_id = auth.uid()
    )
  );

-- 7. PROGRAM DAYS TABLE
CREATE TABLE IF NOT EXISTS program_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  weekday INTEGER, -- 0 = Sunday, 1 = Monday, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE program_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own program days"
  ON program_days FOR ALL
  USING (auth.uid() = user_id);

-- 8. PROGRAM EXERCISES TABLE
CREATE TABLE IF NOT EXISTS program_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_id UUID NOT NULL REFERENCES program_days(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  sets INTEGER NOT NULL DEFAULT 3,
  rep_min INTEGER NOT NULL DEFAULT 8,
  rep_max INTEGER NOT NULL DEFAULT 12,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE program_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage program exercises"
  ON program_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM program_days WHERE id = program_exercises.day_id AND user_id = auth.uid()
    )
  );

-- 9. WEIGHT HISTORY TABLE
CREATE TABLE IF NOT EXISTS weight_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  date_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  old_weight_kg NUMERIC NOT NULL,
  new_weight_kg NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('increase', 'decrease', 'correction')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own weight history"
  ON weight_history FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_weight_history_user_ex_date ON weight_history(user_id, exercise_id, date_time DESC);

-- 10. CHECKINS TABLE
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_id UUID REFERENCES program_days(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own checkins"
  ON checkins FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON checkins(user_id, date DESC);

-- 11. COACH MESSAGES TABLE
CREATE TABLE IF NOT EXISTS coach_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'coach')),
  content TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'chat', -- chat, weekly_review, projection
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own coach messages"
  ON coach_messages FOR ALL
  USING (auth.uid() = user_id);

-- 12. STRENGTH SNAPSHOTS TABLE
CREATE TABLE IF NOT EXISTS strength_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  overall_score NUMERIC NOT NULL,
  per_muscle JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE strength_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own strength snapshots"
  ON strength_snapshots FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_strength_snapshots_user_date ON strength_snapshots(user_id, date DESC);
