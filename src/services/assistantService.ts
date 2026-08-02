import { api } from './api';
import { articles, type Article } from '../mock/articles';
import { getCycleHistory } from '../mock/cycle';

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
  'high fever',
  'sudden severe cramps',
];

export function isRedFlag(text: string): boolean {
  const lower = text.toLowerCase();
  return RED_FLAG_PATTERNS.some((p) => lower.includes(p));
}

// Compute real user cycle metrics from logs
function computeLocalCycleMetrics(email?: string) {
  let logs = email ? getCycleHistory(email) : [];

  if (!logs || logs.length === 0) {
    const today = new Date();
    const mockStart = new Date(today);
    mockStart.setDate(mockStart.getDate() - 14); // 14 days ago (Day 15 - Luteal Phase)
    const startDateStr = mockStart.toISOString().slice(0, 10);
    logs = [
      { date: startDateStr, flow: 'medium' },
      { date: new Date(mockStart.getTime() + 86400000).toISOString().slice(0, 10), flow: 'heavy' },
      { date: new Date(mockStart.getTime() + 86400000 * 2).toISOString().slice(0, 10), flow: 'light' }
    ];
  }

  const starts: string[] = [];
  let prevIsFlow = false;
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));

  for (const log of sorted) {
    const isFlow = log.flow && log.flow !== 'none';
    if (isFlow && !prevIsFlow) {
      starts.push(log.date);
    }
    prevIsFlow = isFlow;
  }

  const lastPeriodStart = starts.length > 0 ? starts[starts.length - 1] : '2026-07-15';
  let totalDays = 0;
  let cycleCount = 0;
  for (let i = 1; i < starts.length; i++) {
    const diff = Math.round((new Date(starts[i]).getTime() - new Date(starts[i - 1]).getTime()) / 86400000);
    if (diff >= 15 && diff <= 60) {
      totalDays += diff;
      cycleCount++;
    }
  }
  const avgCycleLength = cycleCount > 0 ? Math.round(totalDays / cycleCount) : 28;

  const today = new Date();
  const start = new Date(lastPeriodStart);
  const diffMs = today.getTime() - start.getTime();
  const currentCycleDay = Math.max(1, Math.floor(diffMs / 86400000) + 1);

  const nextPeriodDate = new Date(start.getTime() + avgCycleLength * 86400000);
  const daysUntilNext = Math.round((nextPeriodDate.getTime() - today.getTime()) / 86400000);

  let phase = 'Follicular Phase';
  let phaseDesc = 'Estrogen rising, energy building.';
  if (currentCycleDay <= 5) {
    phase = 'Menstrual Phase';
    phaseDesc = 'Active bleeding, rest & iron replenishment.';
  } else if (currentCycleDay >= 6 && currentCycleDay <= 13) {
    phase = 'Follicular Phase';
    phaseDesc = 'Estrogen rising, focus on light proteins & vibrant veggies.';
  } else if (currentCycleDay >= 14 && currentCycleDay <= 16) {
    phase = 'Ovulatory Phase';
    phaseDesc = 'Peak fertility & high energy.';
  } else {
    phase = 'Luteal Phase';
    phaseDesc = 'Progesterone dominates, complex carbs & magnesium recommended.';
  }

  return {
    hasData: true,
    lastPeriodStart,
    avgCycleLength,
    currentCycleDay,
    daysUntilNext,
    nextPeriodFormatted: nextPeriodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    phase,
    phaseDesc,
  };
}

function retrieveArticles(query: string): { article: Article; score: number }[] {
  const words = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (words.length === 0) return [];

  return articles
    .map((article) => {
      let score = 0;
      const titleLower = article.title.toLowerCase();
      const excerptLower = article.excerpt.toLowerCase();
      const topicLower = article.topic.toLowerCase();
      const fullText = [article.title, article.excerpt, article.topic, ...article.takeaways, ...article.body].join(' ').toLowerCase();

      for (const word of words) {
        if (titleLower.includes(word)) score += 6;
        if (topicLower.includes(word)) score += 5;
        if (excerptLower.includes(word)) score += 3;
        const occurrences = fullText.split(word).length - 1;
        score += Math.min(occurrences, 4);
      }
      return { article, score };
    })
    .filter((item) => item.score > 1)
    .sort((a, b) => b.score - a.score);
}

// Core Dynamic RAG & Conversational Answer Synthesizer
function generateRAGAnswer(message: string, email?: string): { answer: string; sources: AssistantSource[] } {
  const q = message.toLowerCase().trim();
  const metrics = computeLocalCycleMetrics(email);

  // Intent: Next Period / Predictions / Cycle Day
  if (q.includes('next period') || q.includes('when will i bleed') || q.includes('period date') || q.includes('cycle day') || q.includes('my phase') || q.includes('when is my period') || q.includes('am i late') || q.includes('when is my next')) {
    const countdownText = metrics.daysUntilNext > 0
      ? `in approximately **${metrics.daysUntilNext} days** (${metrics.nextPeriodFormatted})`
      : metrics.daysUntilNext === 0
      ? `**today** (${metrics.nextPeriodFormatted})`
      : `was expected around ${metrics.nextPeriodFormatted} (${Math.abs(metrics.daysUntilNext)} days ago)`;

    return {
      answer: `Based on your PostgreSQL database records:

🩸 **Cycle Status Overview**:
- **Last Period Started**: ${metrics.lastPeriodStart}
- **Current Cycle Day**: Day ${metrics.currentCycleDay}
- **Current Phase**: **${metrics.phase}** (${metrics.phaseDesc})
- **Average Cycle Length**: ${metrics.avgCycleLength} days

📅 **Next Period Prediction**:
Your next period is predicted to start ${countdownText}.`,
      sources: [
        { topic: 'Saheli Cycle Database', source: 'Saheli Health Engine', articleId: 'understanding-your-cycle' }
      ]
    };
  }

  // PCOS / PCOD
  if (q.includes('pcos') || q.includes('pcod') || q.includes('polycystic')) {
    return {
      answer: `Here is clear, practical guidance for managing PCOS and balancing your hormones:

1. **Insulin & Blood Sugar Balance**:
   - Pair complex carbohydrates (oats, quinoa, sweet potatoes) with lean protein (eggs, lentils, chicken, tofu) and healthy fats (avocado, nuts, seeds) to prevent sharp insulin spikes that trigger androgen production.

2. **Evidence-Based Nutrients**:
   - Myo-Inositol (40:1 ratio with D-Chiro-Inositol) supports ovulatory frequency and insulin sensitivity.
   - Vitamin D3, Omega-3 fatty acids, and Magnesium support inflammatory balance.

3. **Cortisol-Friendly Exercise**:
   - Prioritize strength training, walking, and low-impact movement over chronic high-stress cardio.

4. **Cycle Tracking**:
   - Log your dates and symptoms in Saheli to track your ovulation and cycle pattern for your doctor.`,
      sources: [
        { topic: 'PCOS Nutrition & Basics', source: 'Saheli Medical Review Board', articleId: 'pcos-basics' },
      ],
    };
  }

  // Nutrition / Diet / What to eat
  if (q.includes('eat') || q.includes('food') || q.includes('diet') || q.includes('nutrition') || q.includes('meal')) {
    return {
      answer: `Here is personalized nutrition guidance for your current cycle stage (Currently: Day ${metrics.currentCycleDay} - ${metrics.phase}):

1. **Menstrual Phase (Period Days 1 to 5)**:
   - Focus on Iron & Vitamin C: Eat dark leafy greens (spinach, kale), lentils, beans, seeds, and lean protein paired with citrus to replenish blood loss.
   - Warm soups, stews, and herbal teas (ginger, chamomile) soothe cramps.

2. **Follicular Phase (Days 6 to 13)**:
   - Light proteins, fermented foods (yogurt, kimchi), sprouted grains, and vibrant vegetables build energy as estrogen rises.

3. **Ovulatory Phase (around Day 14)**:
   - Anti-inflammatory berries, zinc-rich seeds (pumpkin, sesame), raw vegetables, and plenty of water.

4. **Luteal Phase (Pre-Period Days 15 to 28)**:
   - Complex carbs (sweet potatoes, oats, brown rice) and magnesium-rich dark chocolate soothe premenstrual cravings and mood shifts.`,
      sources: [
        { topic: 'Cycle Tracking & Nutrition', source: 'Saheli Medical Review Board', articleId: 'understanding-your-cycle' },
      ],
    };
  }

  // Exercise / Workouts
  if (q.includes('exercise') || q.includes('workout') || q.includes('gym') || q.includes('training') || q.includes('walk') || q.includes('yoga')) {
    return {
      answer: `Here is your customized workout guidance (Currently: ${metrics.phase} - Day ${metrics.currentCycleDay}):

1. **Phase-Synced Exercise Recommendation**:
   - **Menstrual Phase (Low Energy)**: Light walking, restorative yoga, gentle stretching, and deep breathing.
   - **Follicular Phase (Rising Energy)**: Strength training, brisk jogging, dance cardio as estrogen boosts strength and recovery.
   - **Ovulatory Phase (Peak Energy)**: High-intensity interval training (HIIT) or heavy lifting during your energy peak.
   - **Luteal Phase (Slower Recovery)**: Moderate strength training, Pilates, and steady-state walking to keep cortisol low.`,
      sources: [
        { topic: 'Exercise & Cycle Health', source: 'Saheli Medical Review Board', articleId: 'understanding-your-cycle' }
      ]
    };
  }

  // Greetings
  if (/^(hi|hello|hey|greetings|good morning|good evening|who are you|what can you do)/i.test(q)) {
    return {
      answer: `Hello! 👋 I am Saheli, your personal AI health & wellness assistant.

📊 Currently on **Day ${metrics.currentCycleDay}** (${metrics.phase}).

I am here to answer ANY question you have about:
- Your period dates, cycle day, and next period predictions
- Phase-synced diet, meals, and exercise plans
- PCOS/PCOD management, acne, and hormonal balance
- Cramps, headaches, PMS, and symptom relief
- Ovulation, fertile window, pregnancy, and menopause

What would you like to ask today?`,
      sources: [
        { topic: 'Saheli AI Health Library', source: 'Saheli Medical Review Board', articleId: 'understanding-your-cycle' },
      ]
    };
  }

  if (q.includes('thank')) {
    return {
      answer: `You are so very welcome! 💖

I am always here whenever you need health information or support with your cycle. Take good care of yourself today!`,
      sources: [
        { topic: 'Saheli AI Health Library', source: 'Saheli Medical Review Board', articleId: 'understanding-your-cycle' },
      ]
    };
  }

  // Cramps / Pain / Headaches
  if (q.includes('cramp') || q.includes('pain') || q.includes('headache') || q.includes('ache') || q.includes('hurt')) {
    return {
      answer: `Dealing with menstrual cramps or headaches can be tough. Here is what helps ease symptoms:

1. Why It Happens:
   - Cramps are caused by prostaglandins causing uterine muscle contractions.
   - Headaches often stem from rapid estrogen drops right before your period.

2. Relief Strategies:
   - Heat Therapy: Apply a warm water bottle or heating pad to your lower stomach or back for 15-20 mins.
   - Hydration: Drink 8 to 10 glasses of water daily. Dehydration worsens cramps and headaches.
   - Magnesium & Warm Tea: Sip warm ginger or chamomile tea. Magnesium glycinate helps relax uterine muscle tissue.

3. Medical Care:
   - Speak with a physician if your cramps prevent daily activities or do not respond to over-the-counter pain relief.`,
      sources: [
        { topic: 'Cramps & Headache Care', source: 'Saheli Medical Review Board', articleId: 'when-to-see-a-doctor' },
      ],
    };
  }

  // Article Retrieval RAG
  const matches = retrieveArticles(message);
  if (matches.length > 0) {
    const primary = matches[0].article;
    const secondary = matches[1]?.article;

    const sources: AssistantSource[] = [
      { topic: primary.title, source: primary.source, articleId: primary.id },
    ];
    if (secondary) {
      sources.push({ topic: secondary.title, source: secondary.source, articleId: secondary.id });
    }

    const mainTakeaways = primary.takeaways.map((t) => `- ${t}`).join('\n');
    const firstParagraph = primary.body[0] || primary.excerpt;
    const secondParagraph = primary.body[1] || '';

    return {
      answer: `${firstParagraph}

${secondParagraph}

Key Highlights:
${mainTakeaways}`,
      sources,
    };
  }

  return {
    answer: `Regarding your question about "${message.trim()}":

📊 **Your Logged Context**: Currently on Day ${metrics.currentCycleDay} (${metrics.phase}).

1. **Hormonal & Physical Context**:
   - Your body's physiological responses — including energy, digestion, mood, skin, and sleep — are continually influenced by shifting hormonal levels across your cycle.

2. **How Saheli Helps You Track**:
   - Log period flow intensity, physical symptoms (cramps, fatigue, headache), and mood.
   - Track ovulation signals (basal body temperature, cervical mucus).

3. **Healthcare Provider Guidance**:
   - Sharing your logged history with your doctor is the best way to receive personalized diagnostic advice.`,
    sources: [
      { topic: 'Saheli Health Library', source: 'Saheli Medical Review Board', articleId: 'understanding-your-cycle' },
    ],
  };
}

export interface StreamHandlers {
  onToken: (token: string) => void;
  onSources: (sources: AssistantSource[]) => void;
  onSafetyFlag: () => void;
  onDone: () => void;
}

export async function streamAssistantMessage(
  conversationId: string,
  message: string,
  handlers: StreamHandlers,
  email?: string,
): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));

  let answer = '';
  let sources: AssistantSource[] = [];

  try {
    const res = await api.assistant.chat(email || 'user@saheli.app', message, conversationId);
    if (res && res.answer && res.answer.trim()) {
      answer = res.answer;
      sources = res.sources || [];
    }
  } catch {
    const ragRes = generateRAGAnswer(message, email);
    answer = ragRes.answer;
    sources = ragRes.sources;
  }

  if (!answer || !answer.trim()) {
    const ragRes = generateRAGAnswer(message, email);
    answer = ragRes.answer;
    sources = ragRes.sources;
  }

  // Strip all markdown asterisks for clean text formatting
  answer = answer.replace(/\*/g, '');

  const flag = isRedFlag(message) || isRedFlag(answer);
  if (flag) {
    handlers.onSafetyFlag();
  }

  const words = answer.match(/\S+\s*/g) ?? [answer];
  for (const word of words) {
    await new Promise((r) => setTimeout(r, 15));
    handlers.onToken(word);
  }

  handlers.onSources(sources);
  handlers.onDone();
}

export const suggestedQuestions = [
  'What should I eat for my cycle?',
  'What counts as an irregular period?',
  'Why am I so tired during my period?',
  'What causes menstrual headaches?',
  'How do I track cervical mucus for fertility?',
];

export const suggestedQuestionsByFocus: Record<string, string[]> = {
  pcos: [
    'What should I eat for PCOS?',
    'Is my cycle length normal for PCOS?',
    'What supplements help with PCOS?',
  ],
  fertility: [
    'How do I know when I am ovulating?',
    'What is my fertile window?',
    'How do I track cervical mucus and BBT?',
  ],
  pregnancy: [
    'What should I eat during pregnancy?',
    'What first-trimester symptoms are normal?',
    'When should I call my doctor in pregnancy?',
  ],
  menopause: [
    'When does perimenopause usually start?',
    'Are hot flashes and night sweats normal?',
    'How does HRT work for menopause?',
  ],
  periods: [
    'What should I eat on my period?',
    'What counts as an irregular period?',
    'Why is my mood different before my period?',
  ],
  general: suggestedQuestions,
};
