export interface SymptomEntry {
  id: string;
  date: string; // ISO date
  mood: 'calm' | 'happy' | 'anxious' | 'sad' | 'irritable' | 'tired';
  symptoms: string[];
  severity: 1 | 2 | 3 | 4 | 5;
  note?: string;
  redFlag: boolean;
}

export const symptomOptions = [
  'Cramps',
  'Headache',
  'Bloating',
  'Breast tenderness',
  'Fatigue',
  'Backache',
  'Acne',
  'Mood swings',
  'Cravings',
  'Insomnia',
  'Nausea',
  'Hot flashes',
  'Severe pain', // red-flag
  'Heavy bleeding', // red-flag
  'Fainting', // red-flag
] as const;

export const redFlagSymptoms = ['Severe pain', 'Heavy bleeding', 'Fainting'];

export const moodOptions: SymptomEntry['mood'][] = [
  'calm',
  'happy',
  'anxious',
  'sad',
  'irritable',
  'tired',
];

export const symptomHistory: SymptomEntry[] = [
  {
    id: 's1',
    date: '2026-07-12',
    mood: 'irritable',
    symptoms: ['Cramps', 'Bloating', 'Headache'],
    severity: 3,
    note: 'Day 1, usual pattern.',
    redFlag: false,
  },
  {
    id: 's2',
    date: '2026-07-05',
    mood: 'tired',
    symptoms: ['Fatigue', 'Cravings'],
    severity: 2,
    redFlag: false,
  },
  {
    id: 's3',
    date: '2026-06-28',
    mood: 'anxious',
    symptoms: ['Cramps', 'Backache'],
    severity: 3,
    redFlag: false,
  },
  {
    id: 's4',
    date: '2026-06-20',
    mood: 'sad',
    symptoms: ['Severe pain', 'Heavy bleeding'],
    severity: 5,
    note: 'Worse than usual — called my doctor.',
    redFlag: true,
  },
];
