'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const formatMoney = (value) => `$${(Number(value) || 0).toLocaleString('en-NZ')}`;

const METHODS = [
  { value: 'cash', label: '现金 / Cash' },
  { value: 'bank', label: '转账 / Bank transfer' },
  { value: 'stripe', label: '网站 / Website' },
  { value: 'other', label: '其他 / Other' },
];

const TYPE_LABEL = { single: '单次课 / Single class', package: '5 节课包 / 5-class pack' };
const SOURCE_LABEL = { import: '会员名单导入', 'check-in': '签到', admin: '后台记录', stripe: '网站购买' };

function todayNZ() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function formatDate(payment) {
  if (payment.paidAt) {
    return new Date(payment.paidAt).toLocaleDateString('en-NZ', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' });
  }
  return payment.status === 'unpaid' ? '-' : `日期未知 / Unknown${payment.year ? ` (${payment.year})` : ''}`;
}

/**
 * Spending summary, payment list, and "record a pack payment" form for one student.
 * onCreditsChange(newCredits) is called after a pack adds class credits.
 */
export default function CustomerPayments({ userId, onCreditsChange }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ paidAt: todayNZ(), method: 'cash', status: 'paid', note: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments?userId=${userId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load payments');
      setPayments(json.payments || []);
    } catch (err) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => payments.reduce((s, p) => {
    if (p.status === 'unpaid') {
      s.owed += p.amount;
      return s;
    }
    if (p.type === 'single') {
      s.singles += 1;
      s.singleAmount += p.amount;
    } else {
      s.packs += 1;
      s.packAmount += p.amount;
    }
    s.classes += p.classes;
    s.total += p.amount;
    return s;
  }, { singles: 0, singleAmount: 0, packs: 0, packAmount: 0, classes: 0, total: 0, owed: 0 }), [payments]);

  const recordPack = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'package', ...form }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to record payment');
      setMessage(`已记录课包缴费 $65，并增加 5 节课次。/ ${json.message}`);
      setShowForm(false);
      setForm({ paidAt: todayNZ(), method: 'cash', status: 'paid', note: '' });
      onCreditsChange?.(json.classCredits);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (payment) => {
    setBusyId(payment.id);
    setError('');
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: payment.id, status: 'paid', paidAt: todayNZ() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update payment');
      setMessage('已标记为已付款。/ Marked as paid.');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to update payment');
    } finally {
      setBusyId('');
    }
  };

  const remove = async (payment) => {
    if (!window.confirm('删除这条缴费记录？剩余课次不会改变。\nDelete this payment record? Remaining classes will not change.')) return;
    setBusyId(payment.id);
    setError('');
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: payment.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete payment');
      setMessage('已删除缴费记录。/ Payment record deleted.');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to delete payment');
    } finally {
      setBusyId('');
    }
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg bg-card/60 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-sm';

  return (
    <div className="p-6 rounded-lg border border-glow-cyan/20 bg-card/60 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="font-semibold text-foreground">消费记录 / Spending</h2>
        {userId && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-glow-cyan/15 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/25 text-sm"
          >
            <Plus className="w-4 h-4" />
            记录课包缴费 / Record 5-class pack ($65)
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={recordPack} className="mb-5 p-4 rounded-lg border border-glow-cyan/20 bg-glow-cyan/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs text-muted-foreground">
            缴费日期 / Date paid
            <input type="date" required value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} className={`${inputClass} mt-1`} />
          </label>
          <label className="text-xs text-muted-foreground">
            付款方式 / Method
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className={`${inputClass} mt-1`}>
              {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            付款状态 / Status
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={`${inputClass} mt-1`}>
              <option value="paid">已付款 / Paid</option>
              <option value="unpaid">待付款 / Yet to pay</option>
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            备注 / Note
            <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={`${inputClass} mt-1`} />
          </label>
          <p className="sm:col-span-2 text-[11px] text-muted-foreground">
            保存后会给学生增加 5 节课次。/ Saving adds 5 classes to the student&apos;s remaining classes.
          </p>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30 disabled:opacity-50 text-sm">
              {saving ? '保存中... / Saving...' : '保存 / Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-glow-cyan/20 text-muted-foreground hover:text-foreground text-sm">
              取消 / Cancel
            </button>
          </div>
        </form>
      )}

      {message && <p className="mb-3 text-xs text-green-300">{message}</p>}
      {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="rounded-lg border border-glow-cyan/20 bg-glow-cyan/5 p-4">
          <p className="text-xs text-muted-foreground mb-1">单次课 / Singles</p>
          <p className="text-2xl font-light text-foreground">{formatMoney(summary.singleAmount)}</p>
          <p className="text-xs text-muted-foreground mt-1">{summary.singles} 次 / classes</p>
        </div>
        <div className="rounded-lg border border-glow-cyan/20 bg-glow-cyan/5 p-4">
          <p className="text-xs text-muted-foreground mb-1">课包 / Packs</p>
          <p className="text-2xl font-light text-foreground">{formatMoney(summary.packAmount)}</p>
          <p className="text-xs text-muted-foreground mt-1">{summary.packs} 个 / packs</p>
        </div>
        <div className="rounded-lg border border-glow-cyan/20 bg-glow-cyan/5 p-4">
          <p className="text-xs text-muted-foreground mb-1">累计购买课时 / Classes Bought</p>
          <p className="text-2xl font-light text-foreground">{summary.classes}</p>
        </div>
        <div className="rounded-lg border border-glow-cyan/40 bg-glow-cyan/10 p-4">
          <p className="text-xs text-muted-foreground mb-1">累计金额 / Total Paid</p>
          <p className="text-2xl font-light text-glow-cyan">{formatMoney(summary.total)}</p>
          {summary.owed > 0 && <p className="text-xs text-red-300 mt-1">待付 / Yet to pay: {formatMoney(summary.owed)}</p>}
        </div>
      </div>

      {!userId ? (
        <p className="text-xs text-muted-foreground">该客户还没有关联网站账号。/ This customer has no linked account yet.</p>
      ) : loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-glow-cyan animate-spin" /></div>
      ) : payments.length === 0 ? (
        <p className="text-xs text-muted-foreground">暂无缴费记录。/ No payments recorded.</p>
      ) : (
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-glow-cyan/20 text-left text-glow-cyan">
                <th className="px-2 py-2 font-medium">日期 / Date</th>
                <th className="px-2 py-2 font-medium">类型 / Type</th>
                <th className="px-2 py-2 font-medium text-right">金额 / Amount</th>
                <th className="px-2 py-2 font-medium">来源 / Source</th>
                <th className="px-2 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-glow-cyan/10">
                  <td className="px-2 py-2 whitespace-nowrap">{formatDate(p)}</td>
                  <td className="px-2 py-2">
                    {p.type === 'package' ? `${p.classes} 节课包 / ${p.classes}-class pack` : TYPE_LABEL[p.type]}
                    {p.note && <span className="block text-[11px] text-muted-foreground">{p.note}</span>}
                  </td>
                  <td className="px-2 py-2 text-right whitespace-nowrap">
                    {formatMoney(p.amount)}
                    {p.status === 'unpaid' && <span className="block text-[11px] text-red-300">待付 / Yet to pay</span>}
                  </td>
                  <td className="px-2 py-2 text-muted-foreground whitespace-nowrap">
                    {SOURCE_LABEL[p.source] || p.source}{p.method ? ` · ${p.method}` : ''}
                  </td>
                  <td className="px-2 py-2 text-right whitespace-nowrap">
                    {p.status === 'unpaid' && (
                      <button type="button" onClick={() => markPaid(p)} disabled={busyId === p.id} className="mr-2 px-2 py-1 rounded border border-green-500/40 text-green-300 hover:bg-green-500/15 disabled:opacity-50">
                        标为已付 / Mark paid
                      </button>
                    )}
                    {p.source !== 'check-in' && (
                      <button type="button" onClick={() => remove(p)} disabled={busyId === p.id} aria-label="Delete payment" className="p-1 rounded text-muted-foreground hover:text-red-400 disabled:opacity-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
