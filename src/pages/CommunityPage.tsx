import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Heart, Shield, Flag, Pencil, Trash2, Check, X } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Disclaimer } from '../components/common/Disclaimer';
import { communityPosts, type CommunityPost, type CommunityPost as Post } from '../mock/community';
import { fadeUp, staggerContainer, easeOut } from '../animations/variants';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const topics = ['all', 'periods', 'pcos', 'fertility', 'pregnancy', 'menopause', 'general'] as const;
const categoryOptions = ['general', 'periods', 'pcos', 'fertility', 'pregnancy', 'menopause'] as const;

function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(communityPosts);
  const [topic, setTopic] = useState<(typeof topics)[number]>('all');
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState<{ title: string; body: string; topic: (typeof categoryOptions)[number] }>({
    title: '',
    body: '',
    topic: 'general',
  });
  const [reporting, setReporting] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const currentAuthor = user?.username
    ? user.username.replace(/^@/, '')
    : user?.name
    ? user.name.toLowerCase().replace(/\s+/g, '_')
    : 'anonymous';

  const refreshPosts = async () => {
    try {
      const res = await api.community.getPosts();
      if (res && res.posts && res.posts.length > 0) {
        setPosts(res.posts as unknown as Post[]);
      }
    } catch {}
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  const filtered = topic === 'all' ? posts : posts.filter((p) => p.topic === topic);

  const submitPost = async () => {
    if (!draft.title.trim() || !draft.body.trim()) return;
    const authorHandle = currentAuthor;
    const newPost: Post = {
      id: 'p_' + Date.now(),
      topic: draft.topic,
      author: authorHandle,
      title: draft.title.trim(),
      body: draft.body.trim(),
      replies: [],
      likes: [],
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
    setDraft({ title: '', body: '', topic: 'general' });
    setComposing(false);

    try {
      const res = await api.community.createPost({
        topic: newPost.topic,
        author: newPost.author,
        title: newPost.title,
        body: newPost.body,
      });
      if (res && res.posts && Array.isArray(res.posts) && res.posts.length > 0) {
        setPosts(res.posts as unknown as Post[]);
      }
    } catch (err) {
      console.error('Error posting to community DB:', err);
    }
  };

  const handleEditPost = async (postId: string, title: string, body: string, topicVal: Post['topic']) => {
    if (!title.trim() || !body.trim()) return;
    const nowIso = new Date().toISOString();

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, title: title.trim(), body: body.trim(), topic: topicVal, updatedAt: nowIso } : p
      )
    );

    try {
      const res = await api.community.editPost(postId, currentAuthor, title.trim(), body.trim(), topicVal);
      if (res && res.posts && Array.isArray(res.posts) && res.posts.length > 0) {
        setPosts(res.posts as unknown as Post[]);
      }
    } catch (err) {
      console.error('Error editing post in DB:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    try {
      const res = await api.community.deletePost(postId, currentAuthor);
      if (res && res.posts && Array.isArray(res.posts)) {
        setPosts(res.posts as unknown as Post[]);
      }
    } catch (err) {
      console.error('Error deleting post from DB:', err);
    }
  };

  const handleReply = async (postId: string, replyBody: string) => {
    if (!replyBody.trim()) return;
    const authorHandle = currentAuthor;
    const newReply = { id: 'r_' + Date.now(), author: authorHandle, body: replyBody.trim() };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, replies: [...(p.replies || []), newReply] } : p,
      ),
    );

    try {
      const res = await api.community.addReply(postId, authorHandle, replyBody.trim());
      if (res && res.posts && Array.isArray(res.posts) && res.posts.length > 0) {
        setPosts(res.posts as unknown as Post[]);
      }
    } catch (err) {
      console.error('Error adding reply to community DB:', err);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentAuthor) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const currentLikes = Array.isArray(p.likes) ? [...p.likes] : [];
        const isLiked = currentLikes.includes(currentAuthor);
        const updatedLikes = isLiked
          ? currentLikes.filter((h) => h !== currentAuthor)
          : [...currentLikes, currentAuthor];
        return { ...p, likes: updatedLikes };
      })
    );

    try {
      const res = await api.community.likePost(postId, currentAuthor);
      if (res && res.posts && Array.isArray(res.posts) && res.posts.length > 0) {
        setPosts(res.posts as unknown as Post[]);
      }
    } catch (err) {
      console.error('Error liking post in community DB:', err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.h1 variants={fadeUp} className="font-display text-3xl font-600 text-sand-900 dark:text-sand-100 sm:text-4xl">
          Community
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sand-600 dark:text-sand-300">
          Peer support for everyone — post, reply, and connect as <span className="font-600 text-clay-600 dark:text-clay-300">@{currentAuthor}</span>.
        </motion.p>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-4 flex items-center gap-3 rounded-2xl border border-sage-200/80 bg-sage-50/80 px-4 py-3 dark:border-sage-800/60 dark:bg-sage-900/30">
        <Shield className="h-5 w-5 shrink-0 text-sage-600 dark:text-sage-300" />
        <p className="text-sm text-sage-800 dark:text-sage-200">
          This community is moderated for safety. Posts and replies are visible to all members.
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
            <Card className="mt-4 border-clay-200/80 dark:border-clay-700/60 shadow-md">
              <div className="mb-3">
                <label className="mb-1.5 block text-xs font-600 uppercase tracking-wide text-sand-600 dark:text-sand-300">
                  Select Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, topic: cat }))}
                      className={`chip capitalize text-xs ${draft.topic === cat ? 'chip-active' : ''}`}
                      aria-pressed={draft.topic === cat}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="Post Title"
                className="input-base mb-3 text-sm bg-white dark:bg-sand-900 border-sand-200 dark:border-sand-700"
              />
              <textarea
                value={draft.body}
                onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                rows={4}
                placeholder="Share your experience with the community…"
                className="input-base resize-none text-sm bg-white dark:bg-sand-900 border-sand-200 dark:border-sand-700"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-sand-500">Posting as <strong className="text-clay-600 dark:text-clay-300">@{currentAuthor}</strong></span>
                <Button size="sm" onClick={submitPost} leftIcon={<Send className="h-4 w-4" />}>
                  Post to Community
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-6 space-y-4">
        <AnimatePresence>
          {filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onReply={(body) => handleReply(post.id, body)}
              onLike={() => handleLike(post.id)}
              onReport={() => setReporting(post.id)}
              onEdit={(title, body, topicVal) => handleEditPost(post.id, title, body, topicVal)}
              onDeleteRequest={() => setDeletingPostId(post.id)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deletingPostId} onClose={() => setDeletingPostId(null)} title="Delete post?" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-sand-600 dark:text-sand-300">
            Are you sure you want to delete this post? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDeletingPostId(null)}>Cancel</Button>
            <Button
              size="sm"
              className="bg-danger text-white hover:bg-danger/90"
              onClick={() => {
                if (deletingPostId) {
                  handleDeletePost(deletingPostId);
                  setDeletingPostId(null);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal open={!!reporting} onClose={() => { setReporting(null); setReportReason(''); }} title="Report this post" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-sand-600 dark:text-sand-400">
            Help us keep the community kind and safe. Reports are reviewed by our moderation team. You will not be identified to the poster.
          </p>
          <div>
            <p className="mb-2 text-sm font-600 text-sand-800 dark:text-sand-200">Reason</p>
            <div className="flex flex-wrap gap-2">
              {['Medical misinformation', 'Harassment or unkindness', 'Spam', 'Something else'].map((r) => (
                <button key={r} onClick={() => setReportReason(r)} className={`chip text-sm ${reportReason === r ? 'chip-active' : ''}`} aria-pressed={reportReason === r}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setReporting(null); setReportReason(''); }}>Cancel</Button>
            <Button size="sm" onClick={() => { setReporting(null); setReportReason(''); }} disabled={!reportReason}>Submit report</Button>
          </div>
        </div>
      </Modal>

      <div className="mt-8">
        <Disclaimer variant="inline" />
      </div>
    </div>
  );
}

function PostCard({
  post,
  onReply,
  onLike,
  onReport,
  onEdit,
  onDeleteRequest,
}: {
  post: CommunityPost;
  onReply: (body: string) => void;
  onLike: () => void;
  onReport: () => void;
  onEdit: (title: string, body: string, topic: Post['topic']) => void;
  onDeleteRequest: () => void;
}) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [replyBody, setReplyBody] = useState('');

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editBody, setEditBody] = useState(post.body);
  const [editTopic, setEditTopic] = useState<Post['topic']>(post.topic);

  const authorDisplay = post.author ? post.author.replace(/^@/, '') : 'anonymous';
  const currentAuthor = user?.username
    ? user.username.replace(/^@/, '')
    : user?.name
    ? user.name.toLowerCase().replace(/\s+/g, '_')
    : 'anonymous';

  const isAuthor = currentAuthor.toLowerCase() === authorDisplay.toLowerCase();
  const likesList = Array.isArray(post.likes) ? post.likes : [];
  const isLiked = currentAuthor && likesList.includes(currentAuthor);

  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editBody.trim()) return;
    onEdit(editTitle.trim(), editBody.trim(), editTopic);
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditTopic(post.topic);
    setEditing(false);
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} layout>
      <Card className="hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clay-100 text-xs font-700 text-clay-700 dark:bg-clay-800/60 dark:text-clay-200">
              {authorDisplay.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-600 text-clay-600 dark:text-clay-300">@{authorDisplay}</span>
          </div>

          <div className="flex items-center gap-2">
            {!editing && (
              <span className="rounded-full bg-sand-100/90 px-3 py-1 text-xs font-600 capitalize text-sand-700 dark:bg-sand-700/60 dark:text-sand-200">
                {post.topic}
              </span>
            )}
            {isAuthor && !editing && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-lg p-1.5 text-sand-500 hover:bg-sand-100 hover:text-clay-600 dark:text-sand-400 dark:hover:bg-sand-800 dark:hover:text-clay-300 transition-colors"
                  title="Edit post"
                  aria-label="Edit post"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={onDeleteRequest}
                  className="rounded-lg p-1.5 text-sand-500 hover:bg-danger/10 hover:text-danger dark:text-sand-400 transition-colors"
                  title="Delete post"
                  aria-label="Delete post"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form Mode */}
        {editing ? (
          <div className="mt-3 space-y-3 rounded-2xl border border-clay-200/80 bg-sand-50/50 p-4 dark:border-clay-700/60 dark:bg-sand-800/40">
            <div>
              <label className="mb-1 block text-xs font-600 uppercase tracking-wide text-sand-600 dark:text-sand-300">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setEditTopic(cat)}
                    className={`chip capitalize text-xs ${editTopic === cat ? 'chip-active' : ''}`}
                    aria-pressed={editTopic === cat}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Post Title"
              className="input-base text-sm bg-white dark:bg-sand-900 border-sand-200 dark:border-sand-700"
            />
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={3}
              placeholder="Edit your post content…"
              className="input-base resize-none text-sm bg-white dark:bg-sand-900 border-sand-200 dark:border-sand-700"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" leftIcon={<X className="h-4 w-4" />} onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" leftIcon={<Check className="h-4 w-4" />} onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="mt-3 font-display text-lg font-600 text-sand-900 dark:text-sand-100">{post.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-sand-600 dark:text-sand-300">{post.body}</p>
          </>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-sand-500 border-t border-sand-200/50 pt-3 dark:border-sand-700/50">
          <div className="flex items-center gap-1.5 text-sand-400 dark:text-sand-400">
            <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            {post.updatedAt && (
              <span className="italic text-sand-500 dark:text-sand-400">
                • (edited {formatTimeAgo(post.updatedAt)})
              </span>
            )}
          </div>
          <button
            onClick={onLike}
            className={`flex items-center gap-1.5 font-600 transition-colors ${
              isLiked ? 'text-rose-600 dark:text-rose-400' : 'text-sand-500 hover:text-rose-500'
            }`}
            aria-label="Like post"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{likesList.length} {likesList.length === 1 ? 'like' : 'likes'}</span>
          </button>
          <button
            onClick={() => setReplying((r) => !r)}
            className="flex items-center gap-1.5 font-600 text-clay-600 hover:text-clay-700 dark:text-clay-300 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.replies?.length || 0} {post.replies?.length === 1 ? 'reply' : 'replies'}</span>
          </button>
          {!isAuthor && (
            <button onClick={onReport} className="ml-auto flex items-center gap-1 hover:text-danger text-sand-400 transition-colors" aria-label="Report post" >
              <Flag className="h-3.5 w-3.5" /> Report
            </button>
          )}
        </div>

        {/* Replies List */}
        <AnimatePresence>
          {post.replies && post.replies.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2.5 rounded-2xl bg-sand-100/40 p-4 dark:bg-sand-800/30 border border-sand-200/60 dark:border-sand-700/50">
              <p className="text-xs font-600 uppercase tracking-wider text-sand-500 dark:text-sand-400">Replies ({post.replies.length})</p>
              {post.replies.map((r) => (
                <div key={r.id} className="rounded-xl bg-white/80 p-3 dark:bg-sand-800/90 shadow-xs border border-sand-100 dark:border-sand-700/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-600 text-clay-600 dark:text-clay-300">@{r.author ? r.author.replace(/^@/, '') : 'anonymous'}</span>
                  </div>
                  <p className="mt-1 text-sm text-sand-700 dark:text-sand-200">{r.body}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reply Composer Toggle */}
        {!replying && (
          <div className="mt-4 flex justify-end">
            <Button size="sm" variant="outline" leftIcon={<MessageSquare className="h-4 w-4" />} onClick={() => setReplying(true)}>
              Write a reply
            </Button>
          </div>
        )}

        {/* Reply Box */}
        <AnimatePresence>
          {replying && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-4 rounded-2xl border border-clay-200/80 bg-sand-50/70 p-4 dark:border-clay-700/60 dark:bg-sand-800/50 shadow-sm">
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={3}
                  placeholder={`Write a thoughtful reply to @${authorDisplay}…`}
                  className="input-base resize-none text-sm bg-white dark:bg-sand-900 border-sand-200 dark:border-sand-700"
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-sand-600 dark:text-sand-300">Replying as <strong className="text-clay-600 dark:text-clay-300">@{currentAuthor}</strong></span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setReplying(false)}>Cancel</Button>
                    <Button size="sm" variant="primary" leftIcon={<Send className="h-4 w-4" />} onClick={() => { if (replyBody.trim()) { onReply(replyBody); setReplyBody(''); setReplying(false); } }}>
                      Post Reply
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
