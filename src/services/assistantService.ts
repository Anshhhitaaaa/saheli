import { api } from './api';
import { articles, type Article } from '../mock/articles';

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

// Emergency / Red-flag patterns — triggers seek-care banner
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

// --- RAG (Retrieval-Augmented Generation) Engine ---
// Searches the medical articles database in src/mock/articles.ts to retrieve relevant knowledge.
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

// Core RAG Answer Generator
function generateRAGAnswer(message: string): { answer: string; sources: AssistantSource[] } {
  const lower = message.toLowerCase().trim();

  // Handle specific nutrition & eating queries ("what should i eat", "food", "diet")
  const isNutritionQuery = lower.includes('eat') || lower.includes('food') || lower.includes('diet') || lower.includes('nutrition') || lower.includes('meal');
  if (isNutritionQuery) {
    const pcosMatched = lower.includes('pcos');
    const pregnancyMatched = lower.includes('pregnant') || lower.includes('pregnancy');

    if (pcosMatched) {
      return {
        answer: `For a PCOS-friendly diet, focusing on blood sugar stability and reducing inflammation is key:

1. Pair Carbohydrates with Protein: Combine complex carbs (oats, quinoa, sweet potatoes) with lean protein (eggs, chicken, lentils, tofu) and healthy fats (avocado, nuts, olive oil). This prevents steep insulin spikes that trigger androgen production.

2. Anti-Inflammatory Foods: Include leafy greens, berries, fatty fish (salmon, sardines), and seeds (flax, chia, pumpkin).

3. Consider Specific Supplements (with your doctor's advice): Myo-Inositol (40:1 ratio with D-Chiro-Inositol), Vitamin D3, and Omega-3 fatty acids.

4. Stay Hydrated & Limit Refined Sugars: Minimize sugary beverages and processed snacks to support metabolic balance.`,
        sources: [
          { topic: 'PCOS Nutrition & Basics', source: 'Saheli Medical Review Board', articleId: 'pcos-basics' },
        ],
      };
    }

    if (pregnancyMatched) {
      return {
        answer: `During pregnancy, your nutritional needs focus on supporting tissue growth and soothing common early symptoms:

1. Key Nutrients:
   - Folate / Folic Acid: Essential for neural tube development (found in dark leafy greens, lentils, and prenatals).
   - Iron: Supports blood volume expansion (found in lean meats, beans, spinach paired with Vitamin C).
   - Calcium & Vitamin D: Supports fetal bone growth.

2. Soothing Nausea:
   - Eat small, frequent meals rather than large ones to keep blood sugar stable.
   - Ginger tea, peppermint, and dry crackers before getting out of bed can soothe early morning nausea.

3. Hydration: Drink 8 to 10 glasses of fluids daily (water, coconut water, clear broths).`,
        sources: [
          { topic: 'First Trimester Care', source: 'Saheli Medical Review Board', articleId: 'first-trimester-changes' },
        ],
      };
    }

    return {
      answer: `Nutrition tailored to your menstrual cycle helps support energy, hormone production, and mood:

1. Follicular Phase (Days 1 to 13): Focus on fresh, light foods — sprouted grains, fermented foods (yogurt, kimchi), light protein, and vibrant vegetables.

2. Ovulatory Phase (around Day 14): Include anti-inflammatory berries, zinc-rich seeds (pumpkin, sesame), raw vegetables, and stay well hydrated.

3. Luteal Phase (Days 15 to 28): Your metabolism speeds up slightly. Eat complex carbs (sweet potatoes, brown rice, oats) and magnesium-rich dark chocolate or spinach to soothe premenstrual cravings.

4. Menstrual Phase (Period): Replenish iron lost during bleeding with lentils, beans, dark leafy greens, and warm soups.`,
      sources: [
        { topic: 'Understanding Your Cycle', source: 'Saheli Medical Review Board', articleId: 'understanding-your-cycle' },
      ],
    };
  }

  // Perform RAG retrieval against articles database
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

    // Synthesize RAG answer from retrieved medical article body and takeaways
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

  // Direct contextual answer for any other question
  const topicTitle = message.trim();
  return {
    answer: `Here is clear health information regarding "${topicTitle}":

1. Biological Context: Your body's physiological responses — including energy, digestion, mood, skin, and sleep — are continually influenced by shifting hormonal levels across your cycle.

2. What You Can Track in Saheli:
   - Log period flow intensity (spotting, light, medium, heavy).
   - Track physical symptoms (cramps, fatigue, skin changes) and mood.
   - Record fertility signs (basal body temperature, cervical mucus).

3. When to Consult a Doctor: If you experience new or persistent symptoms, sharing your logged cycle history with your healthcare provider is the best step for personalized care.`,
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

/**
 * Sends a message to the assistant and streams the RAG response token by token.
 */
export async function streamAssistantMessage(
  conversationId: string,
  message: string,
  handlers: StreamHandlers,
  email?: string,
): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));

  let answer = '';
  let sources: AssistantSource[] = [];

  try {
    const res = await api.assistant.chat(email || 'user@saheli.app', message, conversationId);
    if (res.answer) {
      answer = res.answer;
      sources = res.sources || [];
    }
  } catch {
    const ragRes = generateRAGAnswer(message);
    answer = ragRes.answer;
    sources = ragRes.sources;
  }

  const flag = isRedFlag(message) || isRedFlag(answer);
  if (flag) {
    handlers.onSafetyFlag();
  }

  const words = answer.match(/\S+\s*/g) ?? [answer];
  for (const word of words) {
    await new Promise((r) => setTimeout(r, 20));
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
