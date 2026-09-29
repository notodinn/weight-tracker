'use client';

import React from 'react';

export type MuscleRegionId =
  | 'chest'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'traps'
  | 'upper_back_lats'
  | 'lower_back'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs_core'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves';

interface AnatomicalBodyMapProps {
  side: 'front' | 'back';
  muscleLevels: Record<string, { level: number; score: number }>;
  selectedRegion: string | null;
  onSelectRegion: (regionId: string) => void;
}

const LEVEL_COLORS: Record<number, { fill: string; stroke: string }> = {
  0: { fill: '#1A1A18', stroke: '#2A2A27' },
  1: { fill: '#3A2A24', stroke: '#4A3A34' },
  2: { fill: '#5E3020', stroke: '#7E4030' },
  3: { fill: '#8F3A18', stroke: '#AF4A28' },
  4: { fill: '#C8471B', stroke: '#E8572B' },
  5: { fill: '#C8471B', stroke: '#E8E6E1' },
};

export function AnatomicalBodyMap({
  side,
  muscleLevels,
  selectedRegion,
  onSelectRegion,
}: AnatomicalBodyMapProps) {
  const getRegionStyle = (id: string) => {
    const data = muscleLevels[id] || { level: 0, score: 0 };
    const level = Math.min(5, Math.max(0, data.level));
    const colors = LEVEL_COLORS[level] || LEVEL_COLORS[0];
    const isSelected = selectedRegion === id;

    return {
      fill: colors.fill,
      stroke: isSelected ? '#C8471B' : colors.stroke,
      strokeWidth: isSelected ? 2.5 : 1,
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    };
  };

  return (
    <div className="w-full flex justify-center py-4 bg-[#131312] border border-[#232320] rounded-[8px] relative overflow-hidden">
      <svg
        viewBox="0 0 240 380"
        className="w-56 h-80 drop-shadow-sm select-none"
        aria-label={`Anatomical Body Map ${side.toUpperCase()}`}
      >
        {/* Outer silhouette background guide line */}
        <path
          d="M 120 20 C 135 20 145 30 145 45 C 145 55 138 65 138 75 C 160 85 180 110 190 150 C 190 170 180 200 175 220 C 170 240 160 300 155 360 C 135 360 125 300 120 250 C 115 300 105 360 85 360 C 80 300 70 240 65 220 C 60 200 50 170 50 150 C 60 110 80 85 102 75 C 102 65 95 55 95 45 C 95 30 105 20 120 20 Z"
          fill="#0B0B0A"
          stroke="#232320"
          strokeWidth="1.5"
        />

        {side === 'front' ? (
          <g id="front-muscles">
            {/* Traps (Front view) */}
            <path
              id="traps"
              d="M 105 75 L 120 70 L 135 75 L 145 88 L 95 88 Z"
              style={getRegionStyle('traps')}
              onClick={() => onSelectRegion('traps')}
            />

            {/* Front Delts (Left & Right) */}
            <path
              id="front_delts_left"
              d="M 85 88 L 100 88 L 92 115 L 75 110 Z"
              style={getRegionStyle('front_delts')}
              onClick={() => onSelectRegion('front_delts')}
            />
            <path
              id="front_delts_right"
              d="M 140 88 L 155 88 L 165 110 L 148 115 Z"
              style={getRegionStyle('front_delts')}
              onClick={() => onSelectRegion('front_delts')}
            />

            {/* Side Delts (Front view) */}
            <path
              id="side_delts_left"
              d="M 75 110 L 92 115 L 85 135 L 68 125 Z"
              style={getRegionStyle('side_delts')}
              onClick={() => onSelectRegion('side_delts')}
            />
            <path
              id="side_delts_right"
              d="M 148 115 L 165 110 L 172 125 L 155 135 Z"
              style={getRegionStyle('side_delts')}
              onClick={() => onSelectRegion('side_delts')}
            />

            {/* Chest (Left & Right Pectorals) */}
            <path
              id="chest_left"
              d="M 100 88 L 118 88 L 118 120 L 92 122 L 95 105 Z"
              style={getRegionStyle('chest')}
              onClick={() => onSelectRegion('chest')}
            />
            <path
              id="chest_right"
              d="M 122 88 L 140 88 L 145 105 L 148 122 L 122 120 Z"
              style={getRegionStyle('chest')}
              onClick={() => onSelectRegion('chest')}
            />

            {/* Biceps (Left & Right) */}
            <path
              id="biceps_left"
              d="M 75 125 L 88 125 L 82 155 L 70 150 Z"
              style={getRegionStyle('biceps')}
              onClick={() => onSelectRegion('biceps')}
            />
            <path
              id="biceps_right"
              d="M 152 125 L 165 125 L 170 150 L 158 155 Z"
              style={getRegionStyle('biceps')}
              onClick={() => onSelectRegion('biceps')}
            />

            {/* Forearms (Left & Right) */}
            <path
              id="forearms_left"
              d="M 70 152 L 82 157 L 75 195 L 63 185 Z"
              style={getRegionStyle('forearms')}
              onClick={() => onSelectRegion('forearms')}
            />
            <path
              id="forearms_right"
              d="M 158 157 L 170 152 L 177 185 L 165 195 Z"
              style={getRegionStyle('forearms')}
              onClick={() => onSelectRegion('forearms')}
            />

            {/* Abs / Core */}
            <path
              id="abs_core"
              d="M 98 124 L 142 124 L 138 185 L 102 185 Z"
              style={getRegionStyle('abs_core')}
              onClick={() => onSelectRegion('abs_core')}
            />

            {/* Quads (Left & Right Thighs) */}
            <path
              id="quads_left"
              d="M 95 190 L 118 190 L 115 265 L 90 260 Z"
              style={getRegionStyle('quads')}
              onClick={() => onSelectRegion('quads')}
            />
            <path
              id="quads_right"
              d="M 122 190 L 145 190 L 150 260 L 125 265 Z"
              style={getRegionStyle('quads')}
              onClick={() => onSelectRegion('quads')}
            />

            {/* Calves (Front view) */}
            <path
              id="calves_left"
              d="M 92 272 L 112 272 L 108 340 L 92 340 Z"
              style={getRegionStyle('calves')}
              onClick={() => onSelectRegion('calves')}
            />
            <path
              id="calves_right"
              d="M 128 272 L 148 272 L 148 340 L 132 340 Z"
              style={getRegionStyle('calves')}
              onClick={() => onSelectRegion('calves')}
            />
          </g>
        ) : (
          <g id="back-muscles">
            {/* Traps (Posterior view) */}
            <path
              id="traps_back"
              d="M 105 75 L 120 68 L 135 75 L 150 95 L 120 115 L 90 95 Z"
              style={getRegionStyle('traps')}
              onClick={() => onSelectRegion('traps')}
            />

            {/* Rear Delts (Left & Right) */}
            <path
              id="rear_delts_left"
              d="M 72 95 L 90 95 L 82 120 L 68 112 Z"
              style={getRegionStyle('rear_delts')}
              onClick={() => onSelectRegion('rear_delts')}
            />
            <path
              id="rear_delts_right"
              d="M 150 95 L 168 95 L 172 112 L 158 120 Z"
              style={getRegionStyle('rear_delts')}
              onClick={() => onSelectRegion('rear_delts')}
            />

            {/* Side Delts (Posterior view) */}
            <path
              id="side_delts_back_left"
              d="M 68 112 L 82 120 L 76 138 L 62 128 Z"
              style={getRegionStyle('side_delts')}
              onClick={() => onSelectRegion('side_delts')}
            />
            <path
              id="side_delts_back_right"
              d="M 158 120 L 172 112 L 178 128 L 164 138 Z"
              style={getRegionStyle('side_delts')}
              onClick={() => onSelectRegion('side_delts')}
            />

            {/* Upper Back / Lats */}
            <path
              id="upper_back_lats"
              d="M 88 100 L 120 115 L 152 100 L 144 148 L 120 155 L 96 148 Z"
              style={getRegionStyle('upper_back_lats')}
              onClick={() => onSelectRegion('upper_back_lats')}
            />

            {/* Triceps (Posterior view) */}
            <path
              id="triceps_left"
              d="M 76 122 L 88 125 L 82 158 L 68 152 Z"
              style={getRegionStyle('triceps')}
              onClick={() => onSelectRegion('triceps')}
            />
            <path
              id="triceps_right"
              d="M 152 125 L 164 122 L 172 152 L 158 158 Z"
              style={getRegionStyle('triceps')}
              onClick={() => onSelectRegion('triceps')}
            />

            {/* Lower Back / Erector Spinae */}
            <path
              id="lower_back"
              d="M 98 156 L 142 156 L 138 185 L 102 185 Z"
              style={getRegionStyle('lower_back')}
              onClick={() => onSelectRegion('lower_back')}
            />

            {/* Glutes */}
            <path
              id="glutes"
              d="M 95 188 L 145 188 L 148 225 L 92 225 Z"
              style={getRegionStyle('glutes')}
              onClick={() => onSelectRegion('glutes')}
            />

            {/* Hamstrings */}
            <path
              id="hamstrings_left"
              d="M 93 228 L 118 228 L 115 268 L 90 265 Z"
              style={getRegionStyle('hamstrings')}
              onClick={() => onSelectRegion('hamstrings')}
            />
            <path
              id="hamstrings_right"
              d="M 122 228 L 147 228 L 150 265 L 125 268 Z"
              style={getRegionStyle('hamstrings')}
              onClick={() => onSelectRegion('hamstrings')}
            />

            {/* Calves (Gastrocnemius & Soleus) */}
            <path
              id="calves_back_left"
              d="M 90 274 L 112 274 L 108 340 L 90 340 Z"
              style={getRegionStyle('calves')}
              onClick={() => onSelectRegion('calves')}
            />
            <path
              id="calves_back_right"
              d="M 128 274 L 150 274 L 150 340 L 132 340 Z"
              style={getRegionStyle('calves')}
              onClick={() => onSelectRegion('calves')}
            />
          </g>
        )}
      </svg>
    </div>
  );
}
