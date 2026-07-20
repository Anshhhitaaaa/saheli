export interface AssistantSource {
  topic: string;
  source: string;
  articleId?: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: AssistantSource[];
  safetyFlag?: boolean;
  createdAt: string;
}

export interface AssistantConversation {
  id: string;
  messages: AssistantMessage[];
}

const USE_MOCK = true;

// Red-flag patterns — checked on user input AND draft response.
const RED_FLAG_PATTERNS = [
  'severe pain',
  'heavy bleeding',
  'soaking through',
  'fainting',
  'passed out',
  'can\'t stop bleeding',
  'suicidal',
  'self-harm',
  'hurt myself',
  'chest pain',
  'trouble breathing',
  'pregnancy and bleeding',
  'bleeding during pregnancy',
  'severe headache during pregnancy',
];

export function isRedFlag(text: string): boolean {
  const lower = text.toLowerCase();
  return RED_FLAG_PATTERNS.some((p) => lower.includes(p));
}

// Mock knowledge base — grounded answers per topic, never diagnostic.
const mockAnswers: { keywords: string[]; answer: string; sources: AssistantSource[] }[] = [
  {
    keywords: ['pcos', 'irregular', 'polycystic'],
    answer:
      "PCOS is a common hormonal pattern, not a single disease. It often shows up as irregular or infrequent periods, higher androgen levels, and many small follicles on an ultrasound — though not everyone has all three. There is no single test that confirms it; your clinician will use your history, an exam, blood tests, and sometimes an ultrasound together. Management is tailored to what matters most to you — cycle regularity, skin changes, fertility, or long-term metabolic health — and is something to build with your doctor rather than self-diagnose.",
    sources: [
      { topic: 'PCOS basics', source: 'Saheli Medical Review Board', articleId: 'pcos-basics' },
    ],
  },
  {
    keywords: ['fertility', 'fertile', 'conceive', 'trying'],
    answer:
      "Your fertile window is the roughly six days each cycle when pregnancy is possible — the five days before ovulation and the day of ovulation itself. Combining signals (cycle length, cervical mucus changes, and optionally ovulation predictor kits) is more reliable than any single one. If you have been trying for 12 months — or 6 months if you are over 35 — it is reasonable to bring this up with your doctor. Timing is one factor among many, and a clinician can help you see the full picture.",
    sources: [
      { topic: 'Fertile window', source: 'Saheli Medical Review Board', articleId: 'fertility-window' },
    ],
  },
  {
    keywords: ['pregnan', 'first trimester', 'nausea', 'morning sickness'],
    answer:
      "In the first trimester, hormone levels rise quickly, which can bring fatigue, nausea, and tender breasts — all common and usually manageable. Your first prenatal visit typically happens between weeks 8 and 12. Some symptoms deserve a prompt call rather than waiting for the next visit: severe abdominal pain, heavy bleeding, or feeling faint. These are not reasons to panic, but they are reasons to reach out the same day.",
    sources: [
      { topic: 'First trimester', source: 'Saheli Medical Review Board', articleId: 'first-trimester-changes' },
    ],
  },
  {
    keywords: ['menopause', 'perimenopause', 'hot flash', 'hot flash'],
    answer:
      "Perimenopause is the years leading up to menopause, when your ovaries gradually produce less estrogen. It can begin in your 40s, sometimes earlier, and typically lasts 4 to 8 years. Cycles often change — shorter, longer, heavier, lighter, or skipped — and sleep, mood, and temperature regulation can shift. Tracking your cycle, sleep, and symptoms gives your doctor useful information. If bleeding becomes very heavy, very frequent, or returns after a year without a period, bring it up promptly.",
    sources: [
      { topic: 'Perimenopause', source: 'Saheli Medical Review Board', articleId: 'perimenopause-101' },
    ],
  },
  {
    keywords: ['period', 'cycle', 'menstrual', 'cramp', 'bleeding'],
    answer:
      "Most cycle variation is normal. Cycles between 21 and 35 days are typical, and a few days of variation month to month is common. Reasons to book a non-urgent visit with your doctor include periods consistently closer than 21 days or farther than 35 days apart, bleeding that lasts more than 7 days, or bleeding between periods. Reasons to seek care the same day include severe pain that is not helped by usual measures, very heavy bleeding, or fainting — not emergencies to panic about, but reasons to reach out promptly.",
    sources: [
      { topic: 'Understanding your cycle', source: 'Saheli Medical Review Board', articleId: 'understanding-your-cycle' },
      { topic: 'When to see a doctor', source: 'Saheli Medical Review Board', articleId: 'when-to-see-a-doctor' },
    ],
  },
  {
    keywords: ['mood', 'sad', 'anxious', 'irritable', 'pmdd', 'pms'],
    answer:
      "It is common to notice mood changes across your cycle. In the days before a period, falling estrogen and progesterone can bring irritability, low mood, or tearfulness — usually mild and passing. When mood changes are severe enough to disrupt relationships, work, or daily life, and when they recur predictably before each period, it is worth mentioning to your doctor. There is a spectrum between typical premenstrual changes and PMDD, and a clinician can help you tell the difference. Tracking mood and cycle together is what makes the pattern visible.",
    sources: [
      { topic: 'Mood and your cycle', source: 'Saheli Medical Review Board', articleId: 'mood-and-your-cycle' },
    ],
  },
];

const fallbackAnswer =
  "That is a great question to bring to your doctor, because the specifics of your situation matter. In general, the patterns we see in women's health — cycle changes, mood shifts, fertility timing — are shaped by many factors and look different from person to person. Tracking what you notice and bringing those notes to your clinician is one of the most useful things you can do. I can share general information from our reviewed library if you tell me a bit more about what you are noticing.";

const fallbackSources: AssistantSource[] = [
  { topic: 'Understanding your cycle', source: 'Saheli Medical Review Board', articleId: 'understanding-your-cycle' },
];

function pickAnswer(message: string): { answer: string; sources: AssistantSource[] } {
  const lower = message.toLowerCase();
  for (const entry of mockAnswers) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return { answer: entry.answer, sources: entry.sources };
    }
  }
  return { answer: fallbackAnswer, sources: fallbackSources };
}

export interface StreamHandlers {
  onToken: (token: string) => void;
  onSources: (sources: AssistantSource[]) => void;
  onSafetyFlag: () => void;
  onDone: () => void;
}

/**
 * Sends a message to the assistant and streams the response.
 * Mock implementation simulates token-by-token streaming.
 */
export async function streamAssistantMessage(
  conversationId: string,
  message: string,
  handlers: StreamHandlers,
): Promise<void> {
  if (!USE_MOCK) {
    // Real backend wiring would go here — POST /api/assistant/message, read SSE stream.
    // For now the mock is the only path.
  }

  await new Promise((r) => setTimeout(r, 350)); // "thinking" delay

  const { answer, sources } = pickAnswer(message);
  const flag = isRedFlag(message) || isRedFlag(answer);

  if (flag) handlers.onSafetyFlag();

  // Token-by-token streaming — chunk by words for a natural cadence.
  const tokens = answer.match(/\S+\s*/g) ?? [answer];
  for (const tok of tokens) {
    await new Promise((r) => setTimeout(r, 35));
    handlers.onToken(tok);
  }

  handlers.onSources(sources);
  handlers.onDone();
}

export const suggestedQuestions = [
  'What counts as an irregular period?',
  'How do I know when I am ovulating?',
  'Is my fatigue related to my cycle?',
  'What should I track for PCOS?',
  'When does perimenopause usually start?',
];

export const suggestedQuestionsByFocus: Record<string, string[]> = {
  pcos: [
    'What should I track for PCOS?',
    'Is my cycle length normal for PCOS?',
    'What lifestyle changes help PCOS?',
  ],
  fertility: [
    'How do I know when I am ovulating?',
    'What is my fertile window?',
    'When should I see a fertility specialist?',
  ],
  pregnancy: [
    'What first-trimester symptoms are normal?',
    'When should I call my doctor in pregnancy?',
    'What should I track during pregnancy?',
  ],
  menopause: [
    'When does perimenopause usually start?',
    'Are hot flashes normal?',
    'When should I see a doctor about menopause?',
  ],
  periods: [
    'What counts as an irregular period?',
    'Why is my mood different before my period?',
    'When should I see a doctor about my period?',
  ],
  general: suggestedQuestions,
};
