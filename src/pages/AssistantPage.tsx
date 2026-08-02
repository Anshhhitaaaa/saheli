import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, BookOpen, AlertTriangle, ShieldCheck, Plus, MessageSquare, Trash2, History, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
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
import { api } from '../services/api';
import { fadeUp, staggerContainer, chipReveal, easeOut } from '../animations/variants';
import { useReducedMotionPref } from '../hooks/useReducedMotionPref';

interface ConversationItem {
  id: string;
  title: string;
  createdAt: string;
  lastActivity?: string;
  msgCount?: number;
}

export function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>(() => {
    return localStorage.getItem('saheli_active_conv_id') || ('c_' + Date.now());
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftSources, setDraftSources] = useState<AssistantSource[]>([]);
  const [draftSafety, setDraftSafety] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [aiConsented, setAiConsented] = useState(() => localStorage.getItem('saheli-ai-consent') === 'true');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPref();

  const suggestions = suggestedQuestionsByFocus[user?.focus ?? 'general'] ?? suggestedQuestionsByFocus.general;

  // Persist active conversation ID
  useEffect(() => {
    localStorage.setItem('saheli_active_conv_id', activeConvId);
  }, [activeConvId]);

  // Load Conversation History & Restore Messages
  useEffect(() => {
    let active = true;
    (async () => {
      if (!user?.email) return;

      // 1. Fetch Conversations List
      try {
        const res = await api.assistant.getHistory(user.email);
        if (active && res && Array.isArray(res.conversations)) {
          setConversations(res.conversations);
        }
      } catch {
        // Fallback local history
      }

      // 2. Fetch Messages for activeConvId
      try {
        const localKey = `saheli_conv_${activeConvId}`;
        const storedLocal = localStorage.getItem(localKey);
        if (storedLocal) {
          try {
            const parsed = JSON.parse(storedLocal);
            if (active && Array.isArray(parsed) && parsed.length > 0) {
              setMessages(parsed);
            }
          } catch {}
        }

        const msgRes = await api.assistant.getMessages(user.email, activeConvId);
        if (active && msgRes && Array.isArray(msgRes.messages) && msgRes.messages.length > 0) {
          setMessages(msgRes.messages);
          localStorage.setItem(`saheli_conv_${activeConvId}`, JSON.stringify(msgRes.messages));
        }
      } catch {
        // use local
      }
    })();
    return () => { active = false; };
  }, [user, activeConvId]);

  // Auto-scroll chat window
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  }, [messages, draft, streaming, reduced]);

  // Save active messages to LocalStorage
  const saveLocalMessages = (convId: string, msgs: AssistantMessage[]) => {
    localStorage.setItem(`saheli_conv_${convId}`, JSON.stringify(msgs));
  };

  // Start New Chat
  const startNewChat = () => {
    const newId = 'c_' + Date.now();
    setActiveConvId(newId);
    setMessages([]);
    setDraft('');
    setStreaming(false);
  };

  // Switch Conversation
  const switchConversation = (id: string) => {
    if (id === activeConvId || streaming) return;
    setActiveConvId(id);
    setMessages([]);
    setDraft('');
    setStreaming(false);
  };

  // Delete Conversation
  const deleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (user?.email) {
      api.assistant.deleteChat(user.email, id).catch(() => {});
    }
    localStorage.removeItem(`saheli_conv_${id}`);
    setConversations((prev) => prev.filter((c) => c.id !== id));

    if (id === activeConvId) {
      startNewChat();
    }
  };

  // Send Message
  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    if (!aiConsented) {
      setConsentOpen(true);
      return;
    }
    const userMsg: AssistantMessage = {
      id: 'm_' + Date.now(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    
    const updatedUserMsgs = [...messages, userMsg];
    setMessages(updatedUserMsgs);
    saveLocalMessages(activeConvId, updatedUserMsgs);

    setInput('');
    setStreaming(true);
    setDraft('');
    setDraftSources([]);
    setDraftSafety(false);

    // Update conversation title list locally
    setConversations((prev) => {
      const exists = prev.find((c) => c.id === activeConvId);
      if (exists) {
        return prev.map((c) => (c.id === activeConvId ? { ...c, lastActivity: new Date().toISOString() } : c));
      }
      return [
        {
          id: activeConvId,
          title: text.length > 30 ? text.slice(0, 30) + '...' : text,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });

    await streamAssistantMessage(
      activeConvId,
      text,
      {
        onToken: (tok) => setDraft((prev) => prev + tok),
        onSources: (srcs) => setDraftSources(srcs),
        onSafetyFlag: () => setDraftSafety(true),
        onDone: () => {
          const botMsg: AssistantMessage = {
            id: 'm_' + (Date.now() + 1),
            role: 'assistant',
            content: draftRef.current,
            sources: draftSourcesRef.current,
            safetyFlag: draftSafetyRef.current,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => {
            const finalMsgs = [...prev, botMsg];
            saveLocalMessages(activeConvId, finalMsgs);
            return finalMsgs;
          });
          setDraft('');
          setDraftSources([]);
          setDraftSafety(false);
          setStreaming(false);
        },
      },
      user?.email,
    );
  };

  // Refs for callback closures
  const draftRef = useRef('');
  const draftSourcesRef = useRef<AssistantSource[]>([]);
  const draftSafetyRef = useRef(false);
  useEffect(() => { draftRef.current = draft; }, [draft]);
  useEffect(() => { draftSourcesRef.current = draftSources; }, [draftSources]);
  useEffect(() => { draftSafetyRef.current = draftSafety; }, [draftSafety]);

  return (
    <div className="mx-auto flex h-[calc(100vh-8.5rem)] max-w-6xl gap-4 md:h-[calc(100vh-6.5rem)]">
      {/* Sidebar: Chat History */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden shrink-0 flex-col rounded-2xl border border-sand-200 bg-sand-50/70 p-3 shadow-sm dark:border-sand-700/60 dark:bg-sand-900/50 lg:flex"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-sand-200/80 dark:border-sand-700/80">
              <button
                onClick={startNewChat}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-clay-500 px-3.5 py-2 text-xs font-600 text-white shadow-sm hover:bg-clay-600 active:scale-[0.98] transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>New Chat</span>
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-sand-200 text-sand-500 hover:bg-sand-200/60 dark:border-sand-700 dark:text-sand-300 dark:hover:bg-sand-800/60 transition-colors"
                title="Hide Recent Chats"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs font-600 text-sand-500 dark:text-sand-400 px-1">
              <span className="flex items-center gap-1">
                <History className="h-3.5 w-3.5" /> Recent Chats
              </span>
              <span>{conversations.length}</span>
            </div>

            <div className="mt-2 flex-1 space-y-1 overflow-y-auto pr-1">
              {conversations.length === 0 ? (
                <p className="mt-4 text-center text-xs text-sand-400">No previous chats yet.</p>
              ) : (
                conversations.map((conv) => {
                  const isActive = conv.id === activeConvId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => switchConversation(conv.id)}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-500 cursor-pointer transition-all ${
                        isActive
                          ? 'bg-clay-500 text-white shadow-sm'
                          : 'text-sand-700 hover:bg-sand-200/60 dark:text-sand-200 dark:hover:bg-sand-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-1">
                        <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-clay-500'}`} />
                        <span className="truncate">{conv.title}</span>
                      </div>
                      <button
                        onClick={(e) => deleteConversation(e, conv.id)}
                        className={`opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity ${
                          isActive ? 'text-white/80 hover:text-white' : 'text-sand-400'
                        }`}
                        title="Delete Chat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-sand-200 bg-sand-50/40 p-4 dark:border-sand-700/50 dark:bg-sand-900/30">
        <div className="flex items-center justify-between shrink-0 pb-3 border-b border-sand-200/70 dark:border-sand-700/70">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-sand-200 bg-white/80 px-2.5 py-1.5 text-xs font-500 text-sand-700 shadow-2xs hover:bg-sand-100 dark:border-sand-700 dark:bg-sand-800/80 dark:text-sand-200 dark:hover:bg-sand-800 transition-all"
              title={sidebarOpen ? 'Hide Chat History' : 'Show Chat History'}
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4 text-clay-500" /> : <PanelLeftOpen className="h-4 w-4 text-clay-500" />}
              <span className="hidden sm:inline font-500 text-sand-600 dark:text-sand-300">{sidebarOpen ? 'Hide History' : 'History'}</span>
            </button>
            <h1 className="font-display text-xl font-600 text-sand-900 dark:text-sand-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-clay-500" /> Ask Saheli
            </h1>
          </div>

          <button
            onClick={startNewChat}
            className="flex items-center gap-1.5 rounded-xl bg-clay-500 px-3.5 py-1.5 text-xs font-600 text-white shadow-sm hover:bg-clay-600 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="mt-2 shrink-0">
          <Disclaimer />
        </div>

        {/* Messages Container */}
        <div ref={scrollRef} className="mt-3 flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.length === 0 && !streaming && (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4 pt-2">
              <motion.div variants={fadeUp} className="flex items-start gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay-100 text-clay-600 dark:bg-clay-800/40 dark:text-clay-200">
                  <Sparkles className="h-5 w-5" />
                </span>
                <Card className="max-w-xl">
                  <p className="text-sm text-sand-700 dark:text-sand-200">
                    Hi {user?.name.split(' ')[0] ?? 'there'}. I am Saheli. Ask me anything about your cycle,
                    symptoms, PCOS, fertility, pregnancy, or menopause — I will calculate your dates directly from your database and citate reliable health sources.
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

        {/* Input Form */}
        <div className="mt-3 shrink-0">
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
              placeholder="Ask a question..."
              className="input-base max-h-32 resize-none"
              disabled={streaming}
            />
            <Button type="submit" size="lg" disabled={streaming || !input.trim()} leftIcon={<Send className="h-4 w-4" />}>
              Send
            </Button>
          </form>
        </div>
      </div>

      {/* AI Consent Modal */}
      <Modal open={consentOpen} onClose={() => setConsentOpen(false)} title="Before we begin" size="md" labelledBy="ai-consent-title">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-sand-50 p-4 dark:bg-sand-700/30">
            <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-sage-600 dark:text-sage-300" />
            <div>
              <h3 id="ai-consent-title" className="font-600 text-sand-900 dark:text-sand-100">Your conversations are sensitive</h3>
              <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
                To improve quality, Saheli logs conversations for safety and quality review. This is stored securely in your database.
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
              I consent to my assistant conversations being logged securely in my account.
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
