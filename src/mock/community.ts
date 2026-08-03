export interface CommunityPost {
  id: string;
  topic: 'periods' | 'pcos' | 'fertility' | 'pregnancy' | 'menopause' | 'general';
  author: string; // pseudonym
  title: string;
  body: string;
  replies: { id: string; author: string; body: string }[];
  likes?: string[];
  createdAt: string;
}

export const communityPosts: CommunityPost[] = [
  {
    id: 'p1',
    topic: 'pcos',
    author: 'lotus_42',
    title: 'Anyone else with long cycles that finally regularized?',
    body: 'My cycles were 40+ days for years. After a year of small changes (mostly walking and protein), they have crept down to 34 days. Curious what helped others — not looking for medical advice, just shared experiences.',
    replies: [
      { id: 'r1', author: 'mango_tree', body: 'Same here. Consistent sleep made the biggest difference for me, more than food.' },
      { id: 'r2', author: 'river_stone', body: 'Took me almost two years. Be patient with yourself.' },
    ],
    createdAt: '2026-07-15T10:00:00Z',
  },
  {
    id: 'p2',
    topic: 'pregnancy',
    author: 'soft_rain',
    title: 'First trimester fatigue — when did it ease for you?',
    body: 'Week 9 and I could sleep standing up. Hearing from people who have been through it would help. I am already talking to my doctor, just want company.',
    replies: [
      { id: 'r3', author: 'amber_light', body: 'Started lifting around week 12 for me. You are almost there.' },
    ],
    createdAt: '2026-07-14T16:30:00Z',
  },
  {
    id: 'p3',
    topic: 'menopause',
    author: 'cedar_moon',
    title: 'Hot flashes at work — discreet strategies?',
    body: 'Not looking for medical advice, just practical tips from anyone who has navigated this in an office setting. Layered clothing is my current go-to.',
    replies: [
      { id: 'r4', author: 'quiet_wind', body: 'A small USB desk fan was a quiet lifesaver for me.' },
    ],
    createdAt: '2026-07-13T08:15:00Z',
  },
  {
    id: 'p4',
    topic: 'periods',
    author: 'jasmine_7',
    title: 'Tracking apps that do not feel judgmental?',
    body: 'I want to log without being told what everything "means." Saheli has been good so far — wondering what else people like.',
    replies: [],
    createdAt: '2026-07-12T12:00:00Z',
  },
];
