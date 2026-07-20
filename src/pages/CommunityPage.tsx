import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Heart, Shield } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Disclaimer } from '../components/common/Disclaimer';
import { communityPosts, type CommunityPost, type CommunityPost as Post } from '../mock/community';
import { fadeUp, staggerContainer, easeOut } from '../animations/variants';

const topics = ['all', 'periods', 'pcos', 'fertility', 'pregnancy', 'menopause', 'general'] as const;

export function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(communityPosts);
  const [topic, setTopic] = useState<(typeof topics)[number]>('all');
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ title: '', body: '' });

  const filtered = topic === 'all' ? posts : posts.filter((p) => p.topic === topic);

  const submit = () => {
    if (!draft.title.trim() || !draft.body.trim()) return;
    const newPost: Post = {
      id: 'p' + Date.now(),
      topic: 'general',
      author: 'you_' + Math.floor(Math.random() * 99),
      title: draft.title,
      body: draft.body,
      replies: [],
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
    setDraft({ title: '', body: '' });
    setComposing(false);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Community
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sand-600 dark:text-sand-300">
          Anonymous, pseudonymous, peer support. You are not alone in this.
        </motion.p>
      </motion.div>

      {/* Guidelines banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3, ease: easeOut }}
        className="mt-6 flex items-start gap-3 rounded-2xl border border-sage-200/70 bg-sage-50/70 px-4 py-3 dark:border-sage-700/50 dark:bg-sage-800/20"
      >
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-sage-600 dark:text-sage-300" />
        <p className="text-sm text-sage-700 dark:text-sage-200">
          This is peer support, not medical guidance. Be kind, share experiences, and remember that
          nothing here replaces your doctor.
        </p>
      </motion.div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <button key={t} onClick={() => setTopic(t)} className={`chip capitalize ${topic === t ? 'chip-active' : ''}`} aria-pressed={topic === t}>
              {t}
            </button>
          ))}
        </div>
        <Button size="sm" variant="outline" leftIcon={<MessageSquare className="h-4 w-4" />} onClick={() => setComposing((c) => !c)}>
          {composing ? 'Cancel' : 'New post'}
        </Button>
      </div>

      <AnimatePresence>
        {composing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="overflow-hidden"
          >
            <Card className="mt-4">
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="Title"
                className="input-base mb-3"
              />
              <textarea
                value={draft.body}
                onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                rows={4}
                placeholder="Share your experience…"
                className="input-base resize-none"
              />
              <div className="mt-3 flex justify-end">
                <Button size="sm" onClick={submit} leftIcon={<Send className="h-4 w-4" />}>
                  Post
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-6 space-y-4">
        <AnimatePresence>
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} onReply={(body) => addReply(setPosts, post.id, body)} />
          ))}
        </AnimatePresence>
      </motion.div>

      <div className="mt-8">
        <Disclaimer variant="inline" />
      </div>
    </div>
  );
}

function PostCard({ post, onReply }: { post: CommunityPost; onReply: (body: string) => void }) {
  const [replying, setReplying] = useState(false);
  const [body, setBody] = useState('');
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} layout>
      <Card>
        <div className="flex items-center justify-between">
          <span className="text-sm font-600 text-clay-600 dark:text-clay-300">@{post.author}</span>
          <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs capitalize text-sand-500 dark:bg-sand-700/50 dark:text-sand-300">
            {post.topic}
          </span>
        </div>
        <h3 className="mt-2 font-display text-lg font-600 text-sand-900 dark:text-sand-100">{post.title}</h3>
        <p className="mt-1.5 text-sm text-sand-600 dark:text-sand-400">{post.body}</p>
        <div className="mt-3 flex items-center gap-4 text-xs text-sand-400">
          <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <button className="flex items-center gap-1 hover:text-clay-500" aria-label="Like">
            <Heart className="h-3.5 w-3.5" /> {Math.floor(Math.random() * 12)}
          </button>
          <button onClick={() => setReplying((r) => !r)} className="flex items-center gap-1 hover:text-clay-500">
            <MessageSquare className="h-3.5 w-3.5" /> {post.replies.length}
          </button>
        </div>

        <AnimatePresence>
          {post.replies.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2 border-l-2 border-sand-200 pl-4 dark:border-sand-700">
              {post.replies.map((r) => (
                <div key={r.id}>
                  <p className="text-xs font-600 text-clay-500">@{r.author}</p>
                  <p className="text-sm text-sand-600 dark:text-sand-400">{r.body}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {replying && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-4">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={2}
                  placeholder="Reply kindly…"
                  className="input-base resize-none text-sm"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setReplying(false)}>Cancel</Button>
                  <Button size="sm" onClick={() => { if (body.trim()) { onReply(body); setBody(''); setReplying(false); } }}>
                    Reply
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function addReply(setPosts: React.Dispatch<React.SetStateAction<Post[]>>, postId: string, body: string) {
  setPosts((prev) =>
    prev.map((p) =>
      p.id === postId
        ? { ...p, replies: [...p.replies, { id: 'r' + Date.now(), author: 'you_' + Math.floor(Math.random() * 99), body }] }
        : p,
    ),
  );
}
