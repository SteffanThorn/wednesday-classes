'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/hooks/useLanguage';
import { Loader2, Send, MessageCircle } from 'lucide-react';

const MAX_MESSAGE_LENGTH = 800;
const AVATAR_GRADIENTS = [
  'from-glow-cyan to-glow-teal',
  'from-glow-purple to-glow-cyan',
  'from-glow-teal to-glow-purple',
];

function formatDate(dateString, isZh) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(isZh ? 'zh-CN' : 'en-NZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Homepage student guestbook: shows admin-approved messages, and — for anyone
 * signed in with a student account — a small composer to submit a new one.
 * New submissions are held as 'pending' until an admin approves them in
 * /admin/guestbook, so nothing here appears the instant it's posted.
 */
export default function GuestbookSection() {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const { data: session } = useSession();
  const isStudent = session?.user?.role === 'student';

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', text }

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/guestbook');
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch {
      /* silently keep the section empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDraft('');
        setFeedback({
          type: 'success',
          text: isZh ? '已提交，审核通过后会显示在这里，谢谢分享！' : 'Submitted — it will appear here once approved. Thank you for sharing!',
        });
      } else {
        setFeedback({ type: 'error', text: data.error || (isZh ? '提交失败，请重试' : 'Failed to submit, please try again') });
      }
    } catch {
      setFeedback({ type: 'error', text: isZh ? '网络错误，请重试' : 'Network error, please try again' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="px-6 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-4 animate-fade-in-up">
            {isZh ? '同学留言板' : 'Student Guestbook'}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto animate-fade-in-up">
            {isZh ? '真实同学们的练习感受与心得。' : 'Real reflections and feedback from our community.'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 animate-fade-in-up">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-glow-purple/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-glow-purple animate-pulse-glow" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-glow-purple/50" />
          </div>
        </div>

        {/* Composer — only for logged-in students */}
        {isStudent ? (
          <form
            onSubmit={handleSubmit}
            className="mb-10 p-5 rounded-2xl border border-glow-cyan/20 bg-card/50 backdrop-blur-sm animate-fade-in-up"
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={3}
              placeholder={isZh ? '分享一下你的练习感受……' : 'Share how your practice has been going…'}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-card/50
                text-foreground placeholder:text-muted-foreground/40 text-sm leading-relaxed
                focus:outline-none focus:border-glow-cyan/40 resize-none"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {draft.length}/{MAX_MESSAGE_LENGTH} · {isZh ? '审核通过后会显示在这里' : 'Shown here once approved'}
              </span>
              <button
                type="submit"
                disabled={submitting || !draft.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                  bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isZh ? '发布留言' : 'Post'}
              </button>
            </div>
            {feedback && (
              <p className={`mt-2 text-xs ${feedback.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {feedback.text}
              </p>
            )}
          </form>
        ) : (
          <div className="mb-10 text-center text-sm text-muted-foreground animate-fade-in-up">
            {isZh ? (
              <>
                <Link href="/auth/signin" className="text-glow-cyan hover:underline">登录你的学生账号</Link>
                {' '}后即可留言，分享你的练习感受。
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-glow-cyan hover:underline">Sign in with your student account</Link>
                {' '}to share your own reflection here.
              </>
            )}
          </div>
        )}

        {/* Approved messages — continuous auto-scrolling row, pauses on hover so
            visitors can read. Falls back to a static list when reduced motion
            is preferred, or when there are too few cards to loop smoothly. */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-glow-cyan animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm flex flex-col items-center gap-2">
            <MessageCircle className="w-6 h-6 opacity-40" />
            {isZh ? '还没有留言，成为第一个分享的人吧。' : 'No messages yet — be the first to share.'}
          </div>
        ) : (
          <div className="relative overflow-hidden animate-fade-in-up">
            {/* Edge fade so cards don't hard-cut at the container border */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 md:w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 md:w-20 bg-gradient-to-l from-background to-transparent z-10" />

            <div
              className={`flex w-max gap-5 py-1 ${messages.length > 2 ? 'animate-marquee' : ''}`}
              style={{ '--marquee-duration': `${Math.max(20, messages.length * 7)}s` }}
            >
              {(messages.length > 2 ? [...messages, ...messages] : messages).map((m, i) => (
                <div
                  key={`${m.id}-${i}`}
                  className="w-72 sm:w-80 shrink-0 p-5 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm
                    hover:border-glow-cyan/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]}
                        flex items-center justify-center text-white font-display text-sm shrink-0`}
                    >
                      {(m.name || '?').trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(m.createdAt, isZh)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-5">
                    {m.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
