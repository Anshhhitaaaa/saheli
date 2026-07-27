export interface FertilityEntry {
  date: string; // ISO date
  bbt: number | null; // basal body temp, °C
  mucus: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg-white' | null;
  opk: 'negative' | 'positive' | null; // ovulation predictor kit
  note?: string;
}

export const fertilityEntries: FertilityEntry[] = [
  { date: '2026-07-10', bbt: 36.4, mucus: 'dry', opk: 'negative' },
  { date: '2026-07-11', bbt: 36.42, mucus: 'sticky', opk: 'negative' },
  { date: '2026-07-12', bbt: 36.45, mucus: 'creamy', opk: 'negative' },
  { date: '2026-07-13', bbt: 36.5, mucus: 'watery', opk: 'negative' },
  { date: '2026-07-14', bbt: 36.62, mucus: 'egg-white', opk: 'positive', note: 'Ovulation day suspected.' },
  { date: '2026-07-15', bbt: 36.7, mucus: 'egg-white', opk: 'positive' },
  { date: '2026-07-16', bbt: 36.75, mucus: 'creamy', opk: 'negative' },
  { date: '2026-07-17', bbt: 36.78, mucus: 'sticky', opk: 'negative' },
  { date: '2026-07-18', bbt: 36.76, mucus: 'dry', opk: 'negative' },
];

export const mucusLabels: Record<NonNullable<FertilityEntry['mucus']>, string> = {
  dry: 'Dry',
  sticky: 'Sticky',
  creamy: 'Creamy',
  watery: 'Watery',
  'egg-white': 'Egg-white (fertile)',
};

export const mucusOptions = Object.keys(mucusLabels) as NonNullable<FertilityEntry['mucus']>[];
