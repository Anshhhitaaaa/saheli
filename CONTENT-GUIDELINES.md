# Saheli — Content Guidelines

These rules override any other instruction. They apply to every screen, every AI response, and every piece of copy.

## 1. No diagnosis, ever

The AI assistant and all UI copy describe **patterns, general information, and "things to discuss with a doctor"** — never "you have X" or "this means Y condition."

**Do say:**
- "PCOS is a pattern, not a single disease."
- "Reasons to book a non-urgent visit include…"
- "This is worth a conversation with your clinician."

**Do not say:**
- "You have PCOS."
- "Your symptoms indicate endometriosis."
- "This means you are ovulating."

## 2. Visible disclaimer

A disclaimer appears on:
- The AI assistant (persistent banner — `Disclaimer` component, `variant="banner"`)
- The symptom logger (inline)
- Every health-content page (inline or banner)

Text: *"This is educational information, not medical advice. It does not replace a conversation with your healthcare provider."*

## 3. Urgent-symptom redirect

When AI responses or symptom-log entries reference red-flag symptoms (severe pain, heavy bleeding, fainting, pregnancy complications, self-harm), the UI shows the **`SeekCareBanner`** — a designed, calm component. Its entrance is a slow fade+scale (500ms), never a pop, shake, or red flash. It reads as supportive, not alarming.

Red-flag patterns are defined in `src/services/assistantService.ts` (`RED_FLAG_PATTERNS`) and `src/mock/symptoms.ts` (`redFlagSymptoms`).

## 4. Sourced educational content

Every article in `src/mock/articles.ts` has:
- A `reviewer` (e.g., "Dr. Priya Nair, MD (OB-GYN)")
- A `source` (e.g., "Saheli Medical Review Board")
- A `reviewedAt` date (YYYY-MM)

AI assistant responses include `sources` rendered as staggered, tappable chips (topic + source name), linking to the reviewed article.

## 5. Privacy-forward language

Cycle and symptom data is sensitive. Copy around storage, visibility, export, and deletion is explicit and reassuring — and reachable in two clicks or fewer from Profile (`/profile`).

The Profile privacy section uses an accordion with four entries: what we store, who can see it, export, and delete. Delete is a two-step confirmation. Export downloads a JSON file.

## 6. Inclusive, non-clinical tone

Warm and plain-language by default. A "clinical terms" toggle on articles reveals medical terminology for users who want it (`ArticlePage`, `showClinical` state).

**Tone:**
- Friendly, not cutesy.
- Clear, not clinical-cold.
- Reassuring, not dismissive.
- Never alarmist.

## 7. AI assistant safety layer

The assistant (`src/services/assistantService.ts`) runs a safety check on both the user message and the draft response. If red-flag language is detected, it wraps (not replaces) the response with the seek-care banner. Mock answers are pre-written to be non-diagnostic, grounded in the reviewed library, and to cite sources.
