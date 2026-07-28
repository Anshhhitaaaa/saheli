export interface Medication {
  id: string;
  name: string;
  type: 'birth-control' | 'pcos' | 'prenatal' | 'supplement' | 'other';
  dose: string;
  schedule: string; // e.g. "Daily, 8:00 AM"
  active: boolean;
  startedAt: string;
  notes?: string;
  takenDates?: string[];
}

export const medications: Medication[] = [
  {
    id: 'm1',
    name: 'Metformin',
    type: 'pcos',
    dose: '500 mg',
    schedule: 'Daily, with breakfast',
    active: true,
    startedAt: '2026-03-01',
    notes: 'For PCOS — discussed with Dr. Nair.',
  },
  {
    id: 'm2',
    name: 'Prenatal multivitamin',
    type: 'prenatal',
    dose: '1 tablet',
    schedule: 'Daily, with lunch',
    active: true,
    startedAt: '2026-05-10',
  },
  {
    id: 'm3',
    name: 'Vitamin D3',
    type: 'supplement',
    dose: '1000 IU',
    schedule: 'Daily, with dinner',
    active: false,
    startedAt: '2026-01-15',
    notes: 'Paused — levels normalized.',
  },
];

export const medicationTypes: { value: Medication['type']; label: string }[] = [
  { value: 'birth-control', label: 'Birth control' },
  { value: 'pcos', label: 'PCOS medication' },
  { value: 'prenatal', label: 'Prenatal vitamin' },
  { value: 'supplement', label: 'Supplement' },
  { value: 'other', label: 'Other' },
];
