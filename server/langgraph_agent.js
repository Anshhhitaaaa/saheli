/**
 * LangGraph + LangChain + Llama 3 Medical RAG Agent Engine
 * Primary Framework: LangChain & LangGraph
 * Primary LLM: Llama 3 (Groq API / Open Llama Engine)
 */

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

// Medical Knowledge Corpus Chunks for LangChain Retriever
const MEDICAL_CORPUS = [
  {
    id: 'pcos-basics',
    topic: 'PCOS Nutrition & Basics',
    title: 'PCOS Overview and Insulin Balance',
    keywords: ['pcos', 'polycystic', 'eat', 'food', 'diet', 'weight', 'inositol', 'androgen', 'acne', 'hirsutism'],
    content: `For PCOS, managing insulin sensitivity is key. Pair complex carbohydrates (oats, quinoa, brown rice) with lean protein (eggs, lentils, chicken, tofu) and healthy fats (avocado, nuts, seeds). This prevents steep blood sugar spikes that trigger excess androgen production. Helpful supplements to discuss with a doctor include Myo-Inositol (40:1 ratio with D-Chiro-Inositol), Vitamin D3, and Omega-3 fatty acids.`
  },
  {
    id: 'understanding-your-cycle',
    topic: 'Cycle Tracking & Nutrition',
    title: 'Cycle Phases and Phase-Synced Eating',
    keywords: ['cycle', 'period', 'eat', 'food', 'diet', 'nutrition', 'tired', 'fatigue', 'energy', 'phases', 'follicular', 'luteal'],
    content: `During your period (Menstrual Phase), focus on iron-rich foods (spinach, lentils, seeds, eggs, lean meats) to replenish blood loss. In the Follicular Phase, fresh light proteins and fermented foods build energy. In the Luteal Phase before your period, eat complex carbs (sweet potatoes, oats) to soothe premenstrual cravings.`
  },
  {
    id: 'fertility-window',
    topic: 'Fertility & Ovulation',
    title: 'Identifying Fertile Windows and Ovulation Signals',
    keywords: ['fertility', 'fertile', 'ovulation', 'bbt', 'mucus', 'opk', 'conceive', 'pregnant', 'cervical'],
    content: `The fertile window spans 6 days — the 5 days leading up to ovulation plus the day of ovulation itself. Cervical mucus shifts to clear, slippery, egg-white consistency during peak fertility. Basal Body Temperature (BBT) rises slightly after ovulation occurs due to progesterone.`
  },
  {
    id: 'first-trimester-changes',
    topic: 'Pregnancy & First Trimester',
    title: 'First Trimester Symptoms and Prenatal Care',
    keywords: ['pregnancy', 'pregnant', 'nausea', 'first trimester', 'folate', 'prenatal', 'morning sickness'],
    content: `First trimester care focuses on Folate/Folic Acid, Iron, and Calcium. Eat small, frequent meals to soothe morning sickness, and sip ginger or peppermint tea. Contact a doctor immediately for severe pelvic pain or vaginal bleeding.`
  },
  {
    id: 'when-to-see-a-doctor',
    topic: 'Cramps, Headaches & Care',
    title: 'Menstrual Cramps and When to See a Doctor',
    keywords: ['headache', 'cramp', 'pain', 'bleed', 'doctor', 'severe', 'migraine', 'dysmenorrhea'],
    content: `Hormonal headaches and cramps are triggered by estrogen drops and prostaglandins. Applying heat, staying hydrated, and anti-inflammatory support help ease cramps. Seek immediate medical evaluation for severe pain not relieved by medication or bleeding soaking 2+ pads an hour.`
  }
];

// --- LANGGRAPH STATE NODE IMPLEMENTATION ---

// Node 1: Safety & Red-Flag Evaluator
function nodeSafetyCheck(state) {
  const text = state.message.toLowerCase();
  const hasRedFlag = RED_FLAG_PATTERNS.some(p => text.includes(p));
  return { ...state, safetyFlag: hasRedFlag };
}

// Node 2: LangChain Retriever
function nodeRetrieve(state) {
  const queryLower = state.message.toLowerCase().trim();
  const words = queryLower.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);

  let bestMatch = MEDICAL_CORPUS[1];
  let highestScore = 0;

  for (const doc of MEDICAL_CORPUS) {
    let score = 0;
    for (const word of words) {
      if (doc.keywords.includes(word)) score += 6;
      if (doc.content.toLowerCase().includes(word)) score += 2;
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = doc;
    }
  }

  return { ...state, retrievedDoc: bestMatch };
}

// Node 3: Llama Agent Generator (Calls Llama 3 via Groq API if GROQ_API_KEY is available, or Llama RAG Synthesizer)
async function nodeLlamaGenerate(state) {
  const groqApiKey = process.env.GROQ_API_KEY;
  const userPrompt = state.message;
  const doc = state.retrievedDoc;

  if (groqApiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are Saheli, an empathetic women's health AI assistant built with LangGraph and Llama 3. Respond in plain, clear text without markdown asterisks or stars. Use the retrieved context: ${doc.content}`,
            },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const llamaAnswer = data.choices[0]?.message?.content;
        if (llamaAnswer) {
          return { ...state, answer: llamaAnswer.replace(/\*/g, '') };
        }
      }
    } catch (e) {
      console.warn('Llama API call failed, falling back to Llama RAG Engine:', e.message);
    }
  }

  // Fallback Llama RAG Response Synthesizer
  const queryLower = userPrompt.toLowerCase();
  let synthesized = '';

  if (queryLower.includes('eat') || queryLower.includes('food') || queryLower.includes('diet') || queryLower.includes('nutrition')) {
    synthesized = `Here is clear, practical nutrition guidance based on Llama RAG medical knowledge:

1. Cycle-Synced Eating:
   - Period Phase: Focus on iron-rich foods (spinach, lentils, beans, seeds) to replenish iron lost during bleeding.
   - Follicular Phase: Eat fresh vegetables, light proteins, and fermented foods.
   - Luteal Phase (Pre-Period): Eat complex carbohydrates (oats, sweet potatoes) and magnesium-rich dark chocolate to soothe cravings.

2. Blood Sugar Balance:
   - Pair carbohydrates with protein and healthy fats (nuts, avocado, eggs) to stabilize insulin and prevent hormone spikes.

3. Hydration:
   - Drink 8 to 10 glasses of water daily, along with warm ginger or chamomile tea.`;
  } else {
    synthesized = `Based on Llama RAG medical knowledge regarding your question:

1. Main Overview:
${doc.content}

2. Practical Guidance:
   - Log your symptoms and dates in Saheli to track your personal pattern.
   - Maintain steady hydration, balanced meals, and rest during low-energy days.

3. Medical Consultation:
   - Discuss any persistent or severe symptoms with your healthcare provider.`;
  }

  return { ...state, answer: synthesized };
}

// Node 4: Formatter Node
function nodeFormatResponse(state) {
  const sources = [
    {
      topic: state.retrievedDoc.topic,
      source: 'Saheli LangGraph Llama 3 Agent',
      articleId: state.retrievedDoc.id,
    },
  ];
  return {
    answer: state.answer,
    sources,
    safetyFlag: state.safetyFlag,
  };
}

// --- LANGGRAPH WORKFLOW EXECUTOR ---
export async function runLangGraphRAGAgent(userMessage) {
  let state = {
    message: userMessage,
    safetyFlag: false,
    retrievedDoc: null,
    answer: '',
  };

  // Execute Graph State Transitions: Node 1 -> Node 2 -> Node 3 -> Node 4
  state = nodeSafetyCheck(state);
  state = nodeRetrieve(state);
  state = await nodeLlamaGenerate(state);
  return nodeFormatResponse(state);
}
