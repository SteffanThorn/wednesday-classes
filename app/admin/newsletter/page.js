'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import {
  Loader2,
  Mail,
  Send,
  Save,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Circle,
  Plus,
  Trash2,
  FlaskConical,
  AlertCircle,
  X,
  Pencil,
  Paperclip,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB

// ─── Status helpers ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  if (status === 'sent') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
        bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-medium">
        <CheckCircle2 className="w-3 h-3" />
        已发送
      </span>
    );
  }
  if (status === 'draft') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
        bg-amber-500/15 text-amber-400 border border-amber-500/25 font-medium">
        <Clock className="w-3 h-3" />
        草稿
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
      bg-white/5 text-muted-foreground border border-white/10">
      <Circle className="w-3 h-3" />
      未开始
    </span>
  );
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-NZ', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewsletterAdminPage() {
  const COMPANY_TEST_EMAILS = ['innerlightyuki@gmail.com', 'nzsteffan@gmail.com'];
  const { data: session, status } = useSession();
  const router = useRouter();

  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(null);

  // Form state
  const [form, setForm] = useState({
    subject: '',
    mainContent: '',
    practiceHighlights: [''],
    instructorNote: '',
  });

  // UI state
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customSendingTest, setCustomSendingTest] = useState(false);
  const [customSendingAll, setCustomSendingAll] = useState(false);
  const [customSendingSelected, setCustomSendingSelected] = useState(false);
  const [customConfirmSendType, setCustomConfirmSendType] = useState(null); // 'all' | 'selected' | null
  const [customRecipientsLoading, setCustomRecipientsLoading] = useState(false);
  const [customRecipients, setCustomRecipients] = useState([]);
  const [customSelectedEmails, setCustomSelectedEmails] = useState([]);
  const [customRecipientSearch, setCustomRecipientSearch] = useState('');
  const [customForm, setCustomForm] = useState({
    subject: '',
    content: '',
    attachments: [],
  });
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }
  const [confirmSend, setConfirmSend] = useState(false);
  const formRef = useRef(null);
  const customFileInputRef = useRef(null);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/dashboard');
  }, [status, session, router]);

  // ── Load weeks data ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchWeeks();
  }, []);

  async function fetchWeeks() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/newsletter');
      const data = await res.json();
      if (data.success) setWeeks(data.weeks);
    } catch (err) {
      showToast('error', '加载失败，请刷新页面');
    } finally {
      setLoading(false);
    }
  }

  // ── Week selection ─────────────────────────────────────────────────────────
  function handleSelectWeek(week) {
    setSelectedWeek(week);
    setConfirmSend(false);
    if (week.campaign) {
      setForm({
        subject: week.campaign.subject || '',
        mainContent: week.campaign.mainContent || '',
        practiceHighlights:
          week.campaign.practiceHighlights?.length > 0
            ? week.campaign.practiceHighlights
            : [''],
        instructorNote: week.campaign.instructorNote || '',
      });
    } else {
      setForm({
        subject: `Week ${week.week} · ${week.title} — INNER LIGHT Yoga`,
        mainContent: '',
        practiceHighlights: [''],
        instructorNote: '',
      });
    }
    // Scroll to form
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function handleBack() {
    setSelectedWeek(null);
    setConfirmSend(false);
  }

  // ── Practice highlights helpers ────────────────────────────────────────────
  function updateHighlight(index, value) {
    setForm((prev) => {
      const updated = [...prev.practiceHighlights];
      updated[index] = value;
      return { ...prev, practiceHighlights: updated };
    });
  }

  function addHighlight() {
    if (form.practiceHighlights.length >= 6) return;
    setForm((prev) => ({ ...prev, practiceHighlights: [...prev.practiceHighlights, ''] }));
  }

  function removeHighlight(index) {
    setForm((prev) => {
      const updated = prev.practiceHighlights.filter((_, i) => i !== index);
      return { ...prev, practiceHighlights: updated.length > 0 ? updated : [''] };
    });
  }

  // ── Toast ──────────────────────────────────────────────────────────────────
  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  }

  function openCustomComposer() {
    setCustomForm({
      subject: '',
      content: '',
      attachments: [],
    });
    setCustomConfirmSendType(null);
    setCustomSelectedEmails([]);
    setCustomRecipientSearch('');
    setCustomModalOpen(true);
    fetchCustomRecipients();
  }

  function closeCustomComposer() {
    setCustomModalOpen(false);
    setCustomConfirmSendType(null);
  }

  async function fetchCustomRecipients() {
    setCustomRecipientsLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to load customers');
      }

      const map = new Map();
      (data.customers || []).forEach((customer) => {
        const email = String(customer?.userEmail || '').trim().toLowerCase();
        if (!email) return;
        if (!map.has(email)) {
          map.set(email, {
            email,
            name: String(customer?.userName || 'Student').trim() || 'Student',
          });
        }
      });

      const sorted = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'en'));
      setCustomRecipients(sorted);
    } catch (err) {
      showToast('error', '客户列表加载失败，请稍后重试');
      setCustomRecipients([]);
    } finally {
      setCustomRecipientsLoading(false);
    }
  }

  function toggleCustomRecipient(email) {
    setCustomSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((item) => item !== email) : [...prev, email]
    );
  }

  function toggleSelectAllFilteredRecipients(filteredRecipients) {
    const filteredEmails = filteredRecipients.map((item) => item.email);
    const allSelected = filteredEmails.length > 0 && filteredEmails.every((email) => customSelectedEmails.includes(email));

    if (allSelected) {
      setCustomSelectedEmails((prev) => prev.filter((email) => !filteredEmails.includes(email)));
      return;
    }

    setCustomSelectedEmails((prev) => [...new Set([...prev, ...filteredEmails])]);
  }

  function formatBytes(bytes) {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('文件读取失败'));
          return;
        }
        const base64 = result.split(',')[1];
        if (!base64) {
          reject(new Error('文件编码失败'));
          return;
        }
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  }

  async function handleCustomAddFiles(event) {
    const fileList = Array.from(event.target.files || []);
    if (fileList.length === 0) return;

    const remainingSlots = MAX_ATTACHMENTS - customForm.attachments.length;
    if (remainingSlots <= 0) {
      showToast('error', `最多只能添加 ${MAX_ATTACHMENTS} 个文件`);
      event.target.value = '';
      return;
    }

    const selectedFiles = fileList.slice(0, remainingSlots);
    const oversized = selectedFiles.find((file) => file.size > MAX_ATTACHMENT_SIZE);
    if (oversized) {
      showToast('error', `文件 ${oversized.name} 超过 5MB 限制`);
      event.target.value = '';
      return;
    }

    try {
      const prepared = await Promise.all(
        selectedFiles.map(async (file) => ({
          filename: file.name,
          content: await readFileAsBase64(file),
          type: file.type || 'application/octet-stream',
          size: file.size,
        }))
      );

      setCustomForm((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...prepared],
      }));
    } catch (err) {
      showToast('error', '读取文件失败，请重试');
    } finally {
      event.target.value = '';
    }
  }

  function removeCustomAttachment(index) {
    setCustomForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  }

  async function handleCustomSendTest() {
    if (!customForm.subject.trim() || !customForm.content.trim()) {
      showToast('error', '请先填写主题和正文');
      return;
    }

    setCustomSendingTest(true);
    try {
      const res = await fetch('/api/admin/newsletter/custom-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: customForm.subject,
          content: customForm.content,
          testEmail: COMPANY_TEST_EMAILS,
          attachments: customForm.attachments,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `测试邮件已发送到 ${COMPANY_TEST_EMAILS.join('、')} ✓`);
      } else {
        showToast('error', data.error || '测试发送失败');
      }
    } catch (err) {
      showToast('error', '网络错误，请重试');
    } finally {
      setCustomSendingTest(false);
    }
  }

  async function handleCustomSendAll() {
    if (!customForm.subject.trim() || !customForm.content.trim()) {
      showToast('error', '请先填写主题和正文');
      return;
    }

    setCustomSendingAll(true);
    setCustomConfirmSendType(null);

    try {
      const res = await fetch('/api/admin/newsletter/custom-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: customForm.subject,
          content: customForm.content,
          attachments: customForm.attachments,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `自定义邮件已发送给 ${data.sent} 位学生 ✓`);
        setCustomModalOpen(false);
      } else if (res.ok && data.partialSuccess) {
        showToast('error', `部分发送成功：${data.sent}/${data.total}`);
      } else {
        showToast('error', data.error || '发送失败，请重试');
      }
    } catch (err) {
      showToast('error', '网络错误，请重试');
    } finally {
      setCustomSendingAll(false);
    }
  }

  async function handleCustomSendSelected() {
    if (!customForm.subject.trim() || !customForm.content.trim()) {
      showToast('error', '请先填写主题和正文');
      return;
    }

    if (customSelectedEmails.length === 0) {
      showToast('error', '请先选择至少 1 位客户');
      return;
    }

    setCustomSendingSelected(true);
    setCustomConfirmSendType(null);

    try {
      const res = await fetch('/api/admin/newsletter/custom-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: customForm.subject,
          content: customForm.content,
          attachments: customForm.attachments,
          selectedRecipients: customSelectedEmails,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `自定义邮件已发送给已选择客户（${data.sent} 位）✓`);
        setCustomModalOpen(false);
      } else if (res.ok && data.partialSuccess) {
        showToast('error', `部分发送成功：${data.sent}/${data.total}`);
      } else {
        showToast('error', data.error || '发送失败，请重试');
      }
    } catch (err) {
      showToast('error', '网络错误，请重试');
    } finally {
      setCustomSendingSelected(false);
    }
  }

  function promptCustomSendSelected() {
    if (!customForm.subject.trim() || !customForm.content.trim()) {
      showToast('error', '请先填写主题和正文');
      return;
    }
    if (customSelectedEmails.length === 0) {
      showToast('error', '请先选择至少 1 位客户');
      return;
    }
    setCustomConfirmSendType('selected');
  }

  function promptCustomSendAll() {
    if (!customForm.subject.trim() || !customForm.content.trim()) {
      showToast('error', '请先填写主题和正文');
      return;
    }
    setCustomConfirmSendType('all');
  }

  // ── Save draft ─────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!form.subject.trim() || !form.mainContent.trim()) {
      showToast('error', '主题和正文内容为必填项');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekNumber: selectedWeek.week,
          subject: form.subject,
          mainContent: form.mainContent,
          practiceHighlights: form.practiceHighlights.filter((h) => h.trim()),
          instructorNote: form.instructorNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', '草稿已保存 ✓');
        fetchWeeks(); // refresh status
      } else {
        showToast('error', data.error || '保存失败');
      }
    } catch (err) {
      showToast('error', '网络错误，请重试');
    } finally {
      setSaving(false);
    }
  }

  // ── Send test email ────────────────────────────────────────────────────────
  async function handleSendTest() {
    if (!form.subject.trim() || !form.mainContent.trim()) {
      showToast('error', '请先保存草稿再发送测试邮件');
      return;
    }
    // Save first, then send test
    setSendingTest(true);
    try {
      // Save draft first
      await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekNumber: selectedWeek.week,
          subject: form.subject,
          mainContent: form.mainContent,
          practiceHighlights: form.practiceHighlights.filter((h) => h.trim()),
          instructorNote: form.instructorNote,
        }),
      });

      // Send test email to admin
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekNumber: selectedWeek.week,
          testEmail: COMPANY_TEST_EMAILS,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `测试邮件已发送到 ${COMPANY_TEST_EMAILS.join('、')} ✓`);
      } else {
        showToast('error', data.error || '测试发送失败，请检查发件邮箱域名配置');
      }
    } catch (err) {
      showToast('error', '网络错误，请重试');
    } finally {
      setSendingTest(false);
    }
  }

  // ── Send to all students ───────────────────────────────────────────────────
  async function handleSendAll() {
    setSending(true);
    setConfirmSend(false);
    try {
      // Save draft first
      await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekNumber: selectedWeek.week,
          subject: form.subject,
          mainContent: form.mainContent,
          practiceHighlights: form.practiceHighlights.filter((h) => h.trim()),
          instructorNote: form.instructorNote,
        }),
      });

      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekNumber: selectedWeek.week }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `✓ 已成功发送给 ${data.sent} 位学生！`);
        fetchWeeks();
        setSelectedWeek((prev) => ({ ...prev, campaign: { ...prev.campaign, status: 'sent' } }));
      } else if (res.ok && data.partialSuccess) {
        showToast('error', `部分发送成功：${data.sent}/${data.total}。请检查邮箱配置。`);
        fetchWeeks();
      } else {
        showToast('error', data.error || '发送失败，请重试');
      }
    } catch (err) {
      showToast('error', '网络错误，请重试');
    } finally {
      setSending(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 text-glow-cyan animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'admin') return null;

  const isSent = selectedWeek?.campaign?.status === 'sent';
  const filteredCustomRecipients = customRecipients.filter((item) => {
    if (!customRecipientSearch.trim()) return true;
    const keyword = customRecipientSearch.trim().toLowerCase();
    return item.name.toLowerCase().includes(keyword) || item.email.toLowerCase().includes(keyword);
  });

  const allFilteredSelected =
    filteredCustomRecipients.length > 0 &&
    filteredCustomRecipients.every((item) => customSelectedEmails.includes(item.email));

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5
          rounded-2xl shadow-lg border text-sm font-medium transition-all duration-300
          ${toast.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
            : 'bg-red-950/90 border-red-500/30 text-red-300'}`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-1 hover:opacity-70">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="relative z-10">
        <Header />

        <section className="px-6 pt-8 pb-16">
          <div className="max-w-5xl mx-auto">

            {/* Page header */}
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {selectedWeek && (
                  <button
                    onClick={handleBack}
                    className="p-2 rounded-xl border border-white/10 hover:border-glow-cyan/30
                      text-muted-foreground hover:text-glow-cyan transition-all">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-5 h-5 text-glow-cyan" />
                    <h1 className="font-display text-3xl md:text-4xl font-light text-glow-subtle">
                      Newsletter
                    </h1>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {selectedWeek
                      ? `编辑 Week ${selectedWeek.week} · ${selectedWeek.bodyFocus}`
                      : '12周课程邮件系统 — 四月开始发送'}
                  </p>
                </div>
              </div>

              <button
                onClick={openCustomComposer}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                  border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/10 transition-all"
              >
                <Pencil className="w-4 h-4" />
                写邮件
              </button>
            </div>

            {customModalOpen && (
              <div className="fixed inset-0 z-40 overflow-y-auto p-4 bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-2xl my-6 mx-auto rounded-2xl border border-white/10 bg-card/95 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div>
                      <h2 className="text-lg font-medium text-foreground">自定义邮件</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        节假日通知 / 放假提醒 / 庆祝邮件（可发送给已选择客户或全部客户）
                      </p>
                    </div>
                    <button
                      onClick={closeCustomComposer}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 space-y-4 overflow-y-auto min-h-0">
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">
                        邮件主题 <span className="text-red-400">*</span>
                      </label>
                      <p className="text-xs text-muted-foreground mb-2">
                        可用变量：/name/（全名）或 /firstName/（名字）
                      </p>
                      <input
                        type="text"
                        value={customForm.subject}
                        onChange={(e) => setCustomForm((p) => ({ ...p, subject: e.target.value }))}
                        placeholder="例如：Easter Holiday Schedule Update 🌸"
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-card/50
                          text-foreground placeholder:text-muted-foreground/50 text-sm
                          focus:outline-none focus:border-glow-cyan/40"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">
                        邮件正文 <span className="text-red-400">*</span>
                      </label>
                      <p className="text-xs text-muted-foreground mb-2">
                        支持个性化变量：/name/、/firstName/、/first name/。也可直接写 "Hi Yuki,"，发送时会自动替换为每位客户的名字。
                      </p>
                      <textarea
                        value={customForm.content}
                        onChange={(e) => setCustomForm((p) => ({ ...p, content: e.target.value }))}
                        rows={10}
                        placeholder="输入你要发给客户的内容。空行会自动分段。"
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-card/50
                          text-foreground placeholder:text-muted-foreground/40 text-sm leading-relaxed
                          focus:outline-none focus:border-glow-cyan/40 resize-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-xl border border-white/10 bg-black/15 p-3 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm text-foreground/90">
                            选择客户发送（可选）
                            <span className="text-xs text-muted-foreground ml-2">
                              已选 {customSelectedEmails.length} 位
                            </span>
                          </p>
                          <button
                            type="button"
                            onClick={() => toggleSelectAllFilteredRecipients(filteredCustomRecipients)}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-white/15 text-muted-foreground hover:text-foreground hover:border-glow-cyan/40"
                          >
                            {allFilteredSelected ? '取消全选(当前筛选)' : '全选(当前筛选)'}
                          </button>
                        </div>

                        <input
                          type="text"
                          value={customRecipientSearch}
                          onChange={(e) => setCustomRecipientSearch(e.target.value)}
                          placeholder="搜索客户姓名或邮箱"
                          className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-card/50 text-sm focus:outline-none focus:border-glow-cyan/40"
                        />

                        <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                          {customRecipientsLoading ? (
                            <p className="text-xs text-muted-foreground">加载客户列表中...</p>
                          ) : filteredCustomRecipients.length === 0 ? (
                            <p className="text-xs text-muted-foreground">没有匹配的客户</p>
                          ) : (
                            filteredCustomRecipients.map((item) => (
                              <label
                                key={item.email}
                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={customSelectedEmails.includes(item.email)}
                                  onChange={() => toggleCustomRecipient(item.email)}
                                  className="w-4 h-4"
                                />
                                <span className="text-xs text-foreground/90 truncate">
                                  {item.name} · {item.email}
                                </span>
                              </label>
                            ))
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={promptCustomSendSelected}
                          disabled={customSendingAll || customSendingTest || customSendingSelected || customSelectedEmails.length === 0}
                          className={`w-full mt-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${
                            customSelectedEmails.length > 0
                              ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]'
                              : 'bg-white/10 text-muted-foreground'
                          }`}
                        >
                          {customSendingSelected ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          {customSendingSelected
                            ? '发送中...'
                            : customSelectedEmails.length > 0
                            ? `发送给已选择客户（${customSelectedEmails.length}）`
                            : '请先选择客户'}
                        </button>
                      </div>

                      <input
                        ref={customFileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
                        className="hidden"
                        onChange={handleCustomAddFiles}
                      />

                      <button
                        type="button"
                        onClick={() => customFileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium
                          border border-white/15 text-foreground hover:border-glow-cyan/40 hover:bg-white/5 transition-all"
                      >
                        <Paperclip className="w-4 h-4" />
                        添加图文、文件
                      </button>

                      {customForm.attachments.length > 0 && (
                        <div className="rounded-xl border border-white/10 bg-black/15 p-3 space-y-2">
                          <p className="text-xs text-muted-foreground">
                            已添加 {customForm.attachments.length}/{MAX_ATTACHMENTS} 个文件（单个文件 ≤ 5MB）
                          </p>
                          <div className="space-y-1.5">
                            {customForm.attachments.map((file, index) => (
                              <div
                                key={`${file.filename}-${index}`}
                                className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 bg-white/5"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm text-foreground truncate">{file.filename}</p>
                                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeCustomAttachment(index)}
                                  className="p-1.5 rounded-md text-muted-foreground hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {customConfirmSendType && (
                      <div className="p-4 rounded-xl border border-red-500/25 bg-red-950/15">
                        <p className="text-sm text-red-300 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {customConfirmSendType === 'selected'
                            ? `确认发送这封自定义邮件给已选择的 ${customSelectedEmails.length} 位客户吗？`
                            : '确认发送这封自定义邮件给所有客户吗？'}
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={customConfirmSendType === 'selected' ? handleCustomSendSelected : handleCustomSendAll}
                            disabled={customSendingAll || customSendingSelected}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                              bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
                          >
                            {customSendingAll || customSendingSelected ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            {customSendingAll || customSendingSelected ? '发送中...' : '确认发送'}
                          </button>
                          <button
                            onClick={() => setCustomConfirmSendType(null)}
                            className="px-4 py-2 rounded-xl text-sm text-muted-foreground
                              border border-white/10 hover:border-white/20"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-4 border-t border-white/10 flex flex-wrap items-center gap-3 justify-end bg-card/95 shrink-0">
                    <button
                      onClick={handleCustomSendTest}
                      disabled={customSendingTest || customSendingAll || customSendingSelected}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                        border border-violet-400/30 text-violet-400 hover:bg-violet-400/10
                        disabled:opacity-50"
                    >
                      {customSendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
                      {customSendingTest ? '发送中...' : '发测试邮件给我'}
                    </button>

                    <button
                      onClick={promptCustomSendSelected}
                      disabled={customSendingAll || customSendingTest || customSendingSelected}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                        border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10
                        disabled:opacity-50"
                    >
                      {customSendingSelected ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {customSendingSelected ? '发送中...' : '发送给已选择客户'}
                    </button>

                    <button
                      onClick={promptCustomSendAll}
                      disabled={customSendingAll || customSendingTest || customSendingSelected}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                        bg-gradient-to-r from-sky-600 to-violet-600 hover:from-sky-500 hover:to-violet-500
                        text-white disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      发送给所有客户
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── 12-Week Grid ── */}
            {!selectedWeek && (
              <>
                {/* Course info card */}
                <div className="mb-6 p-5 rounded-2xl border border-glow-cyan/20
                  bg-gradient-to-r from-sky-950/40 to-violet-950/40 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">课程开始：</span>
                      <span className="text-foreground font-medium ml-1">2026年4月6日</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">总周数：</span>
                      <span className="text-foreground font-medium ml-1">12 Weeks</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">主题：</span>
                      <span className="text-foreground font-medium ml-1">身体各部位专注练习</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {weeks.map((week) => {
                    const campaignStatus = week.campaign?.status || null;
                    return (
                      <button
                        key={week.week}
                        onClick={() => handleSelectWeek(week)}
                        className={`relative p-4 rounded-2xl border text-left transition-all duration-300
                          hover:scale-[1.02] active:scale-[0.98] group
                          ${campaignStatus === 'sent'
                            ? 'border-emerald-500/25 bg-emerald-950/20 hover:border-emerald-500/40'
                            : campaignStatus === 'draft'
                            ? 'border-amber-500/25 bg-amber-950/15 hover:border-amber-500/40'
                            : 'border-white/8 bg-card/40 hover:border-glow-cyan/30 hover:bg-card/60'
                          } backdrop-blur-sm`}>

                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="text-2xl">{week.emoji}</span>
                          <StatusBadge status={campaignStatus} />
                        </div>

                        <p className="text-xs text-muted-foreground mb-0.5">Week {week.week}</p>
                        <p className="text-sm font-medium text-foreground leading-tight mb-1">
                          {week.title}
                        </p>
                        <p className="text-xs text-muted-foreground/70">{week.bodyFocus}</p>

                        {campaignStatus === 'sent' && week.campaign?.sentAt && (
                          <p className="mt-2 text-xs text-emerald-400/70">
                            {formatDate(week.campaign.sentAt)} · {week.campaign.recipientCount} 人
                          </p>
                        )}
                        {campaignStatus === 'draft' && (
                          <p className="mt-2 text-xs text-amber-400/70">
                            已保存草稿
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                    已发送
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                    草稿已保存
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    未开始
                  </div>
                </div>
              </>
            )}

            {/* ── Edit Form ── */}
            {selectedWeek && (
              <div ref={formRef} className="space-y-6">

                {/* Week info header */}
                <div className="p-5 rounded-2xl border border-white/10 bg-gradient-to-r
                  from-sky-950/30 to-violet-950/30 backdrop-blur-sm flex items-center gap-4">
                  <span className="text-4xl">{selectedWeek.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-muted-foreground text-sm">Week {selectedWeek.week} of 12</span>
                      <StatusBadge status={selectedWeek.campaign?.status} />
                    </div>
                    <p className="text-xl font-light text-foreground mt-0.5">
                      {selectedWeek.title}
                      <span className="ml-2 text-muted-foreground text-base">
                        {selectedWeek.titleZh}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Body Focus: <strong className="text-foreground/80">{selectedWeek.bodyFocus}</strong>
                      {' '}· {selectedWeek.bodyFocusZh}
                    </p>
                  </div>
                  {selectedWeek.campaign?.sentAt && (
                    <div className="text-right text-xs text-emerald-400">
                      <p>已发送</p>
                      <p>{formatDate(selectedWeek.campaign.sentAt)}</p>
                      <p>{selectedWeek.campaign.recipientCount} 位学生</p>
                    </div>
                  )}
                </div>

                {isSent && (
                  <div className="flex items-center gap-3 p-4 rounded-xl border
                    border-amber-500/25 bg-amber-950/15 text-amber-300 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    这封邮件已发送。你仍可修改内容保存草稿，但不会重新发送。
                  </div>
                )}

                {/* ── Email Subject ── */}
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    邮件主题 <span className="text-red-400">*</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    可用变量：/name/（全名）或 /firstName/（名字）
                  </p>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    placeholder={`Week ${selectedWeek.week} · ${selectedWeek.title} — INNER LIGHT Yoga`}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-card/50
                      text-foreground placeholder:text-muted-foreground/50 text-sm
                      focus:outline-none focus:border-glow-cyan/40 focus:bg-card/70 transition-all"
                  />
                </div>

                {/* ── Main Content ── */}
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    邮件正文 <span className="text-red-400">*</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    用来介绍这周的课程主题。每段文字之间用空行分隔（新段落）。支持 /name/、/firstName/ 个性化。
                  </p>
                  <textarea
                    value={form.mainContent}
                    onChange={(e) => setForm((p) => ({ ...p, mainContent: e.target.value }))}
                    rows={8}
                    placeholder={`Hi everyone,\n\nThis week we focus on ${selectedWeek.bodyFocus}...\n\n${selectedWeek.description}`}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-card/50
                      text-foreground placeholder:text-muted-foreground/40 text-sm leading-relaxed
                      focus:outline-none focus:border-glow-cyan/40 focus:bg-card/70
                      transition-all resize-none font-sans"
                  />
                </div>

                {/* ── Practice Highlights ── */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-foreground/80">
                      本周亮点 <span className="text-muted-foreground font-normal">(可选，最多6条)</span>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    每行一个要点，显示在邮件中间的蓝色卡片里。
                  </p>
                  <div className="space-y-2">
                    {form.practiceHighlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-violet-400 text-sm w-3 flex-shrink-0">◆</span>
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => updateHighlight(i, e.target.value)}
                          placeholder={`亮点 ${i + 1}，例如：Hip flexor stretches · 髋屈肌伸展`}
                          className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-card/50
                            text-foreground placeholder:text-muted-foreground/40 text-sm
                            focus:outline-none focus:border-glow-cyan/40 transition-all"
                        />
                        {form.practiceHighlights.length > 1 && (
                          <button
                            onClick={() => removeHighlight(i)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400
                              hover:bg-red-950/30 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {form.practiceHighlights.length < 6 && (
                      <button
                        onClick={addHighlight}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground
                          hover:text-glow-cyan transition-colors mt-1 pl-5">
                        <Plus className="w-3.5 h-3.5" />
                        添加亮点
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Instructor Note ── */}
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Yuki 的私人留言 <span className="text-muted-foreground font-normal">(可选)</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    显示在邮件底部，以斜体引用的形式呈现，很适合分享一段感悟或鼓励的话。
                  </p>
                  <textarea
                    value={form.instructorNote}
                    onChange={(e) => setForm((p) => ({ ...p, instructorNote: e.target.value }))}
                    rows={3}
                    placeholder="例如：Remember, yoga is not about touching your toes — it's about what you learn on the way down..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-card/50
                      text-foreground placeholder:text-muted-foreground/40 text-sm leading-relaxed
                      focus:outline-none focus:border-glow-cyan/40 focus:bg-card/70
                      transition-all resize-none font-sans italic"
                  />
                </div>

                {/* ── Action Buttons ── */}
                <div className="pt-2">

                  {/* Confirm send dialog */}
                  {confirmSend && (
                    <div className="mb-4 p-4 rounded-xl border border-red-500/25 bg-red-950/15">
                      <p className="text-sm text-red-300 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        确认要将 Week {selectedWeek.week} 的邮件发送给所有学生吗？此操作无法撤回。
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSendAll}
                          disabled={sending}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                            bg-red-600 hover:bg-red-500 text-white transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed">
                          {sending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          {sending ? '发送中...' : '确认发送'}
                        </button>
                        <button
                          onClick={() => setConfirmSend(false)}
                          className="px-4 py-2 rounded-xl text-sm text-muted-foreground
                            hover:text-foreground border border-white/10 hover:border-white/20
                            transition-all">
                          取消
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Save Draft */}
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                        border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/10
                        transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving ? '保存中...' : '保存草稿'}
                    </button>

                    {/* Send Test */}
                    <button
                      onClick={handleSendTest}
                      disabled={sendingTest || saving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                        border border-violet-400/30 text-violet-400 hover:bg-violet-400/10
                        transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {sendingTest ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FlaskConical className="w-4 h-4" />
                      )}
                      {sendingTest ? '发送中...' : '发测试邮件给我'}
                    </button>

                    {/* Send All */}
                    {!isSent && (
                      <button
                        onClick={() => {
                          if (!form.subject.trim() || !form.mainContent.trim()) {
                            showToast('error', '请先填写邮件主题和正文内容');
                            return;
                          }
                          setConfirmSend(true);
                        }}
                        disabled={sending}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                          bg-gradient-to-r from-sky-600 to-violet-600 hover:from-sky-500 hover:to-violet-500
                          text-white shadow-sm transition-all
                          disabled:opacity-50 disabled:cursor-not-allowed">
                        <Send className="w-4 h-4" />
                        发送给所有学生
                      </button>
                    )}

                    {isSent && (
                      <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        已发送给 {selectedWeek.campaign.recipientCount} 位学生
                      </span>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        </section>
      </div>
    </div>
  );
}
