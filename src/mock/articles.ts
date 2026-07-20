import type { OnboardingFocus } from '../context/AuthContext';

export interface ArticleSummary {
  id: string;
  title: string;
  topic: 'periods' | 'pcos' | 'fertility' | 'pregnancy' | 'menopause' | 'general';
  audience: OnboardingFocus | 'all';
  excerpt: string;
  readMinutes: number;
  reviewer: string;
  source: string;
  reviewedAt: string;
  gated: boolean;
  cover?: string;
}

export interface Article extends ArticleSummary {
  body: string[]; // paragraphs
  takeaways: string[];
  clinicalTerms?: { term: string; plain: string }[];
}

export const articles: Article[] = [
  {
    id: 'understanding-your-cycle',
    title: 'Understanding your menstrual cycle',
    topic: 'periods',
    audience: 'all',
    excerpt:
      'A plain-language walk through the phases of your cycle, what your body is doing, and why tracking matters.',
    readMinutes: 6,
    reviewer: 'Dr. Priya Nair, MD (OB-GYN)',
    source: 'Saheli Medical Review Board',
    reviewedAt: '2026-05',
    gated: false,
    cover:
      'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=900',
    body: [
      'Your menstrual cycle is the monthly rhythm your body follows to prepare for a possible pregnancy. It is counted from the first day of one period to the first day of the next. Most cycles fall between 21 and 35 days, and a variation of a few days from month to month is completely normal.',
      'The cycle has two main phases. The follicular phase begins on the first day of your period, when hormone levels drop and your body begins preparing a new egg. After ovulation — usually around the midpoint — the luteal phase begins, during which the lining of the uterus thickens to support a possible pregnancy.',
      'If no pregnancy occurs, hormone levels fall and the lining sheds — this is your period. Tracking the first day of bleeding, the length of your cycle, and how you feel across the month can help you notice your own patterns and have more useful conversations with your doctor.',
    ],
    takeaways: [
      'A normal cycle is 21–35 days; a few days of variation is common.',
      'Tracking helps you spot your patterns, not diagnose a problem.',
      'Bring your tracked data to your doctor for more useful conversations.',
    ],
    clinicalTerms: [
      { term: 'Follicular phase', plain: 'The first half of your cycle, before ovulation.' },
      { term: 'Luteal phase', plain: 'The second half, after ovulation.' },
      { term: 'Ovulation', plain: 'When an egg is released, around the middle of the cycle.' },
    ],
  },
  {
    id: 'pcos-basics',
    title: 'PCOS: what it is and what it is not',
    topic: 'pcos',
    audience: 'pcos',
    excerpt:
      'Polycystic ovary syndrome explained without scare stories — the patterns, the diagnosis, and what to discuss with your doctor.',
    readMinutes: 8,
    reviewer: 'Dr. Priya Nair, MD (OB-GYN)',
    source: 'Saheli Medical Review Board',
    reviewedAt: '2026-04',
    gated: false,
    cover:
      'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=900',
    body: [
      'Polycystic ovary syndrome (PCOS) is a common hormonal pattern that affects roughly 1 in 10 people with ovaries. It is not a single disease with a single cause — it is a cluster of related signs, and it looks different from person to person.',
      'The most common patterns include irregular or infrequent periods, higher levels of androgens (sometimes called "male hormones," though everyone has them), and ovaries that show many small follicles on an ultrasound. Not everyone has all three, and having them does not by itself mean something is wrong.',
      'PCOS is diagnosed by your clinician using a combination of your history, an exam, blood tests, and sometimes an ultrasound. There is no single test that confirms it. Management focuses on what matters most to you — cycle regularity, skin changes, fertility, or long-term metabolic health — and is tailored with your doctor.',
    ],
    takeaways: [
      'PCOS is a pattern, not a disease with one cause.',
      'Diagnosis requires a clinician — no single test confirms it.',
      'Management is personalized to your goals, with your doctor.',
    ],
    clinicalTerms: [
      { term: 'Androgens', plain: 'Hormones present in everyone; higher in some PCOS patterns.' },
      { term: 'Follicles', plain: 'Small fluid-filled sacs that hold eggs.' },
    ],
  },
  {
    id: 'fertility-window',
    title: 'Your fertile window, plainly explained',
    topic: 'fertility',
    audience: 'fertility',
    excerpt:
      'What the fertile window is, how to identify it, and why timing is only one part of the picture.',
    readMinutes: 7,
    reviewer: 'Dr. Priya Nair, MD (OB-GYN)',
    source: 'Saheli Medical Review Board',
    reviewedAt: '2026-05',
    gated: true,
    cover:
      'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=900',
    body: [
      'The fertile window is the handful of days each cycle when pregnancy is possible. It includes the five days before ovulation and the day of ovulation itself, because sperm can survive for several days and the egg lives for about 24 hours.',
      'Identifying the window is easiest when you combine signals — cycle length, changes in cervical mucus, and optionally ovulation predictor kits. A single signal is often less reliable than the picture they build together.',
      'If you have been trying to conceive for 12 months (or 6 months if you are over 35), it is reasonable to bring this up with your doctor. Timing helps, but it is one factor among many, and a clinician can help you understand the full picture.',
    ],
    takeaways: [
      'The fertile window is about 6 days, ending on ovulation day.',
      'Combining signals is more reliable than any single one.',
      'See a doctor after 12 months of trying (6 months if over 35).',
    ],
  },
  {
    id: 'first-trimester-changes',
    title: 'First trimester: what changes to expect',
    topic: 'pregnancy',
    audience: 'pregnancy',
    excerpt:
      'A calm overview of the first 12 weeks — what your body is doing and what to bring up at your first visits.',
    readMinutes: 9,
    reviewer: 'Dr. Priya Nair, MD (OB-GYN)',
    source: 'Saheli Medical Review Board',
    reviewedAt: '2026-06',
    gated: true,
    cover:
      'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=900',
    body: [
      'The first trimester spans weeks 1 to 12. During this time your body is doing extraordinary work, even before it shows. Hormone levels rise quickly, which can bring fatigue, nausea, and tender breasts — all common and usually manageable.',
      'Your first prenatal visit typically happens between weeks 8 and 12. It is a good time to share your history, ask questions, and confirm dates. Bring a list so you do not forget what you wanted to ask.',
      'Some symptoms deserve a prompt call to your doctor rather than waiting for the next visit — severe abdominal pain, heavy bleeding, or feeling faint. These are not emergencies to panic about, but they are reasons to reach out the same day.',
    ],
    takeaways: [
      'Fatigue and nausea are common in the first trimester.',
      'Your first prenatal visit is usually between weeks 8 and 12.',
      'Severe pain, heavy bleeding, or fainting warrant a same-day call.',
    ],
  },
  {
    id: 'perimenopause-101',
    title: 'Perimenopause: the transition, demystified',
    topic: 'menopause',
    audience: 'menopause',
    excerpt:
      'Perimenopause can last years and look different for everyone. Here is what to expect and what to track.',
    readMinutes: 7,
    reviewer: 'Dr. Priya Nair, MD (OB-GYN)',
    source: 'Saheli Medical Review Board',
    reviewedAt: '2026-03',
    gated: true,
    cover:
      'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=900',
    body: [
      'Perimenopause is the years leading up to menopause, when your ovaries gradually produce less estrogen. It can begin in your 40s, sometimes earlier, and typically lasts 4 to 8 years. Menopause itself is defined as 12 months without a period.',
      'During perimenopause, cycles often change — they may become shorter, longer, heavier, lighter, or skip months. Sleep, mood, and temperature regulation (hot flashes) can also shift. None of this means something is wrong; it is the expected shape of the transition.',
      'Tracking your cycle, sleep, and symptoms gives your doctor useful information. If bleeding becomes very heavy, very frequent, or returns after a year without a period, bring it up promptly — not as an emergency, but as a reason to check in.',
    ],
    takeaways: [
      'Perimenopause can last 4–8 years and varies widely.',
      'Cycle and sleep changes are expected, not alarming by themselves.',
      'Unusual bleeding after a gap is worth a prompt doctor visit.',
    ],
  },
  {
    id: 'when-to-see-a-doctor',
    title: 'When to see a doctor about your period',
    topic: 'periods',
    audience: 'all',
    excerpt:
      'A clear, non-alarmist guide to the signs worth a conversation with your clinician.',
    readMinutes: 5,
    reviewer: 'Dr. Priya Nair, MD (OB-GYN)',
    source: 'Saheli Medical Review Board',
    reviewedAt: '2026-05',
    gated: false,
    cover:
      'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=900',
    body: [
      'Most cycle variation is normal. But some patterns are worth a conversation with your doctor — not because they are emergencies, but because they can point to something worth understanding.',
      'Reasons to book a non-urgent visit include: periods consistently closer than 21 days or farther than 35 days apart; bleeding that lasts more than 7 days; bleeding between periods; or periods that significantly disrupt your daily life.',
      'Reasons to seek care the same day include: severe pain that is not helped by usual measures, very heavy bleeding (soaking through protection hourly), fainting, or a fever with pelvic pain. These are not reasons to panic, but they are reasons to reach out promptly.',
    ],
    takeaways: [
      'Most variation is normal; some patterns warrant a doctor visit.',
      'Book a visit for cycles <21 or >35 days or bleeding between periods.',
      'Seek same-day care for severe pain, very heavy bleeding, or fainting.',
    ],
  },
  {
    id: 'mood-and-your-cycle',
    title: 'Mood and your cycle: the connection',
    topic: 'general',
    audience: 'all',
    excerpt:
      'Why your mood can shift across the month, what is typical, and what to mention to your doctor.',
    readMinutes: 6,
    reviewer: 'Dr. Priya Nair, MD (OB-GYN)',
    source: 'Saheli Medical Review Board',
    reviewedAt: '2026-04',
    gated: false,
    cover:
      'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=900',
    body: [
      'It is common to notice mood changes across your cycle. In the days before a period, falling estrogen and progesterone can bring irritability, low mood, or tearfulness. For most people these are mild and pass within a few days.',
      'When mood changes are severe enough to disrupt relationships, work, or daily life — and when they recur predictably before each period — it is worth mentioning to your doctor. There is a spectrum between normal premenstrual changes and premenstrual dysphoric disorder (PMDD), and a clinician can help you tell the difference.',
      'Tracking both your mood and your cycle together is what makes the pattern visible. A few notes a day is enough to start a useful conversation.',
    ],
    takeaways: [
      'Mild pre-period mood changes are common and normal.',
      'Severe, recurring mood shifts are worth discussing with your doctor.',
      'Tracking mood + cycle together makes the pattern visible.',
    ],
  },
];

export const articleSummaries: ArticleSummary[] = articles.map(
  ({ body, takeaways, clinicalTerms, ...summary }) => summary,
);

export function getArticle(id: string): Article | undefined {
  return articles.find((a) => a.id === id);
}
