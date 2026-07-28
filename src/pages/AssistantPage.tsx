import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, BookOpen, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Disclaimer } from '../components/common/Disclaimer';
import { SeekCareBanner } from '../components/common/SeekCareBanner';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  streamAssistantMessage,
  suggestedQuestionsByFocus,
  type AssistantMessage,
  type AssistantSource,
} from '../services/assistantService';
import { fadeUp, staggerContainer, chipReveal, easeOut } from '../animations/variants';
import { useReducedMotionPref } from '../hooks/useReducedMotionPref';

export function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftSources, setDraftSources] = useState<AssistantSource[]>([]);
  const [draftSafety, setDraftSafety] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [aiConsented, setAiConsented] = useState(() => localStorage.getItem('saheli-ai-consent') === 'true');
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPref();
  const conversationId = useRef('c_' + (user?.id ?? 'anon'));

  const suggestions = suggestedQuestionsByFocus[user?.focus ?? 'general'] ?? suggestedQuestionsByFocus.general;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  }, [messages, draft, streaming, reduced]);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    if (!aiConsented) {
      setConsentOpen(true);
      return;
    }
    const userMsg: AssistantMessage = {
      id: 'm' + Date.now(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);
    setDraft('');
    setDraftSources([]);
    setDraftSafety(false);

    await streamAssistantMessage(
      conversationId.current,
      text,
      {
        onToken: (tok) => setDraft((prev) => prev + tok),
        onSources: (srcs) => setDraftSources(srcs),
        onSafetyFlag: () => setDraftSafety(true),
        onDone: () => {
          setMessages((prev) => [
            ...prev,
            {
              id: 'm' + Date.now(),
              role: 'assistant',
              content: draftRef.current,
              sources: draftSourcesRef.current,
              safetyFlag: draftSafetyRef.current,
              createdAt: new Date().toISOString(),
            },
          ]);
          setDraft('');
          setDraftSources([]);
          setDraftSafety(false);
          setStreaming(false);
        },
      },
      user?.email,
    );
  };

  // Refs to read latest values inside onDone callback
  const draftRef = useRef('');
  const draftSourcesRef = useRef<AssistantSource[]>([]);
  const draftSafetyRef = useRef(false);
  useEffect(() => { draftRef.current = draft; }, [draft]);
  useEffect(() => { draftSourcesRef.current = draftSources; }, [draftSources]);
  useEffect(() => { draftSafetyRef.current = draftSafety; }, [draftSafety]);

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col md:h-[calc(100vh-7rem)]">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="shrink-0">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Ask Saheli
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sand-600 dark:text-sand-300">
          Grounded in reviewed content. It cites sources, never diagnoses.
        </motion.p>
      </motion.div>

      <div className="mt-4 shrink-0">
        <Disclaimer />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && !streaming && (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
            <motion.div variants={fadeUp} className="flex items-start gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay-100 text-clay-600 dark:bg-clay-800/40 dark:text-clay-200">
                <Sparkles className="h-5 w-5" />
              </span>
              <Card className="max-w-xl">
                <p className="text-sm text-sand-700 dark:text-sand-200">
                  Hi {user?.name.split(' ')[0] ?? 'there'}. I am Saheli. Ask me anything about your cycle,
                  symptoms, PCOS, fertility, pregnancy, or menopause — I will share general information
                  from our reviewed library and always point you to your doctor for anything specific.
                </p>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <p className="mb-2 text-sm font-600 text-sand-600 dark:text-sand-300">Try one of these:</p>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-wrap gap-2">
                {suggestions.map((q) => (
                  <motion.button
                    key={q}
                    variants={chipReveal}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => send(q)}
                    className="chip"
                  >
                    {q}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {/* Streaming draft */}
        <AnimatePresence>
          {streaming && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay-100 text-clay-600 dark:bg-clay-800/40 dark:text-clay-200">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="card max-w-xl p-4">
                {draft ? (
                  <p className="whitespace-pre-wrap text-sm text-sand-700 dark:text-sand-200">
                    {draft}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="ml-0.5 inline-block h-4 w-0.5 align-middle bg-clay-400"
                    />
                  </p>
                ) : (
                  <TypingIndicator />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="mt-4 shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask a question…"
            className="input-base max-h-32 resize-none"
            disabled={streaming}
          />
          <Button type="submit" size="lg" disabled={streaming || !input.trim()} leftIcon={<Send className="h-4 w-4" />}>
            Send
          </Button>
        </form>
      </div>

      {/* AI consent modal */}
      <Modal open={consentOpen} onClose={() => setConsentOpen(false)} title="Before we begin" size="md" labelledBy="ai-consent-title">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-sand-50 p-4 dark:bg-sand-700/30">
            <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-sage-600 dark:text-sage-300" />
            <div>
              <h3 id="ai-consent-title" className="font-600 text-sand-900 dark:text-sand-100">Your conversations are sensitive</h3>
              <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
                To improve quality, Saheli may review flagged conversations for safety and content quality. This is separate from your general privacy settings and applies only to assistant chats.
              </p>
            </div>
          </div>
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={aiConsented}
              onChange={(e) => {
                setAiConsented(e.target.checked);
                localStorage.setItem('saheli-ai-consent', String(e.target.checked));
              }}
              className="mt-0.5 h-4 w-4 rounded accent-clay-500"
            />
            <span className="text-sm text-sand-700 dark:text-sand-200">
              I consent to my assistant conversations being logged for safety and quality review, as described above. I can change this anytime in Profile &gt; Privacy.
            </span>
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConsentOpen(false)}>Not now</Button>
            <Button onClick={() => { setConsentOpen(false); }} disabled={!aiConsented}>Continue</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function MessageBubble({ message }: { message: AssistantMessage }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easeOut }}
      className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isUser && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay-100 text-clay-600 dark:bg-clay-800/40 dark:text-clay-200">
          <Sparkles className="h-5 w-5" />
        </span>
      )}
      <div className={`max-w-xl ${isUser ? 'bg-clay-500 text-white' : 'card'} rounded-2xl p-4`}>
        <p className={`whitespace-pre-wrap text-sm ${isUser ? 'text-white' : 'text-sand-700 dark:text-sand-200'}`}>
          {message.content}
        </p>
        {!isUser && message.safetyFlag && (
          <div className="mt-3">
            <SeekCareBanner show reason="Some of what you described can sometimes need same-day care." />
          </div>
        )}
        {!isUser && message.sources && message.sources.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mt-3 flex flex-wrap gap-1.5 border-t border-sand-200/60 pt-3 dark:border-sand-700/60"
          >
            <span className="w-full text-xs font-600 text-sand-500 dark:text-sand-400">Sources:</span>
            {message.sources.map((src, i) => (
              <motion.span
                key={i}
                variants={chipReveal}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={src.articleId ? `/library/${src.articleId}` : '/library'}
                  className="inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-2.5 py-1 text-xs font-600 text-sage-700 hover:bg-sage-100 dark:bg-sage-800/30 dark:text-sage-200 dark:hover:bg-sage-800/50 transition-colors"
                >
                  <BookOpen className="h-3 w-3" />
                  {src.topic} · {src.source}
                </Link>
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-clay-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}
