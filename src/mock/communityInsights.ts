export interface CommunityInsight {
  topic: string;
  label: string;
  pattern: string;
  count: number;
}

// Aggregate, anonymized community patterns — framed as peer patterns, never diagnostic.
export const communityInsights: CommunityInsight[] = [
  {
    topic: 'pcos',
    label: 'Cycle length',
    pattern: 'Many people with PCOS-focused tracking mention cycles between 35 and 45 days.',
    count: 1284,
  },
  {
    topic: 'periods',
    label: 'Pre-period mood',
    pattern: 'A common pattern members log is irritability and fatigue in the 3–4 days before a period.',
    count: 2103,
  },
  {
    topic: 'fertility',
    label: 'BBT shift',
    pattern: 'Members tracking basal body temperature often see a 0.2–0.5°C rise after ovulation.',
    count: 642,
  },
  {
    topic: 'menopause',
    label: 'Sleep changes',
    pattern: 'Sleep disruption is one of the most logged symptoms in perimenopause tracking.',
    count: 871,
  },
  {
    topic: 'pregnancy',
    label: 'First-trimester fatigue',
    pattern: 'Fatigue is the most commonly logged first-trimester symptom among pregnancy-mode members.',
    count: 1540,
  },
];

export interface PartnerArticle {
  id: string;
  title: string;
  excerpt: string;
  readMinutes: number;
}

export const partnerArticles: PartnerArticle[] = [
  {
    id: 'partners-understanding-pcos',
    title: 'Understanding PCOS as a partner',
    excerpt: 'What PCOS is, how it can feel, and how to offer support without fixing.',
    readMinutes: 5,
  },
  {
    id: 'partners-pregnancy-together',
    title: 'Pregnancy: what partners can expect',
    excerpt: 'A plain-language guide to the changes your partner is navigating and how to be in it together.',
    readMinutes: 7,
  },
  {
    id: 'partners-menopause',
    title: 'Menopause: a partner’s guide',
    excerpt: 'Why mood, sleep, and temperature shift — and what support actually helps.',
    readMinutes: 6,
  },
];
