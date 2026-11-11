'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Loader2, PackagePlus } from 'lucide-react';
import { CLASS_PACKAGE_PRICES } from '@/lib/pricing';

const PACKAGES = Object.entries(CLASS_PACKAGE_PRICES).map(([size, price]) => ({
  size: Number(size),
  price,
  label: `${size}次课包 / ${size}-class pack`,
}));

const METHODS = [
  { value: 'cash', label: '现金支付 / Cash' },
  { value: 'bank', label: '银行转账 / Bank transfer' },
  { value: 'stripe', label: '网站预订课程 / Website booking' },
  { value: 'other', label: '其他 / Other' },
];

const PANEL_WIDTH = 288;

function todayNZ() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * "购买新课包" button for one customer row. Hovering (or tapping, on a phone)
 * opens a panel: pick a pack, then a payment method and an optional date
 * (blank = today), then confirm. Records the payment and adds the classes.
 */
// intakeId: health-form id. If the customer has no website account yet, the
// server creates one from the form when the pack is recorded.
export default function BuyPackageMenu({ userId, intakeId, customerName, onPurchased }) {
  const [open, setOpen] = useState(false);
  const [pack, setPack] = useState(null);
  const [method, setMethod] = useState('');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const closeTimer = useRef(null);

  // Once a pack is picked the panel stays open until confirm/cancel, so it
  // doesn't vanish while using the date picker.
  const pinned = Boolean(pack) || saving || Boolean(done);

  const reset = () => {
    setPack(null);
    setMethod('');
    setDate('');
    setError('');
    setDone('');
  };

  const close = useCallback(() => {
    setOpen(false);
    reset();
  }, []);

  // The table scrolls sideways, so the panel is fixed to the screen next to the button.
  const place = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.max(8, Math.min(rect.right - PANEL_WIDTH, window.innerWidth - PANEL_WIDTH - 8));
    const panelHeight = panelRef.current?.offsetHeight || 320;
    const below = rect.bottom + 6;
    const top = below + panelHeight > window.innerHeight - 8 ? Math.max(8, rect.top - panelHeight - 6) : below;
    setPos({ top, left });
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    place();
    const onScroll = () => place();
    const onPointerDown = (e) => {
      if (panelRef.current?.contains(e.target) || buttonRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, place, close]);

  // Re-place after the panel grows (step 2 is taller than step 1).
  useEffect(() => {
    if (open) place();
  }, [open, pack, method, error, done, place]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const hoverOpen = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hoverClose = () => {
    if (pinned) return;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  const confirm = async () => {
    if (!pack || !method) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || undefined,
          intakeId: userId ? undefined : intakeId,
          type: 'package',
          packageSize: pack.size,
          method,
          paidAt: date || todayNZ(),
          status: 'paid',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to record the pack');
      setDone(`已为 ${customerName || '该客户'} 添加 ${pack.size} 节课（$${pack.price}）。现在剩余 ${json.classCredits} 节。`);
      onPurchased?.();
      setTimeout(close, 2500);
    } catch (err) {
      setError(err.message || 'Failed to record the pack');
    } finally {
      setSaving(false);
    }
  };

  const choiceClass = (active) =>
    `w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
      active
        ? 'bg-glow-cyan/20 border-glow-cyan text-glow-cyan'
        : 'bg-card/60 border-glow-cyan/20 text-foreground hover:border-glow-cyan/50'
    }`;

  const panel = open && (
    <div
      ref={panelRef}
      onMouseEnter={hoverOpen}
      onMouseLeave={hoverClose}
      style={{ position: 'fixed', top: pos.top, left: pos.left, width: PANEL_WIDTH, zIndex: 60 }}
      className="rounded-xl border border-glow-cyan/30 bg-background/95 backdrop-blur-md shadow-xl p-3 text-left space-y-3"
    >
      {done ? (
        <p className="flex items-start gap-2 text-xs text-green-300">
          <Check className="w-4 h-4 flex-shrink-0" />
          {done}
        </p>
      ) : (
        <>
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground">选择课包 / Choose a pack</p>
            {PACKAGES.map((p) => (
              <button key={p.size} type="button" onClick={() => setPack(p)} className={choiceClass(pack?.size === p.size)}>
                <span className="font-medium">{p.label}</span>
                <span className="float-right">${p.price}</span>
              </button>
            ))}
          </div>

          {pack && (
            <>
              <div className="space-y-1.5">
                <p className="text-[11px] text-muted-foreground">付款方式 / Payment method</p>
                {METHODS.map((m) => (
                  <button key={m.value} type="button" onClick={() => setMethod(m.value)} className={choiceClass(method === m.value)}>
                    {m.label}
                  </button>
                ))}
              </div>

              <label className="block text-[11px] text-muted-foreground">
                日期 / Date（不选则默认今天 / blank = today）
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full px-2 py-1.5 rounded-lg bg-card/70 border border-glow-cyan/20 focus:outline-none focus:border-glow-cyan/50 text-xs text-foreground"
                />
              </label>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={confirm}
                  disabled={!method || saving}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-glow-cyan/20 border border-glow-cyan/40 text-glow-cyan hover:bg-glow-cyan/30 disabled:opacity-50 text-xs"
                >
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                  {saving ? '保存中...' : `确认购买 / Confirm ($${pack.price})`}
                </button>
                <button
                  type="button"
                  onClick={close}
                  disabled={saving}
                  className="px-3 py-2 rounded-lg border border-glow-cyan/20 text-muted-foreground hover:text-foreground text-xs"
                >
                  取消
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={hoverOpen}
        onMouseLeave={hoverClose}
        // A phone tap fires mouseenter then click, so click only opens (never toggles shut).
        // Tapping outside, Esc, or 取消 closes it.
        onClick={hoverOpen}
        aria-expanded={open}
        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-colors text-xs whitespace-nowrap"
      >
        <PackagePlus className="w-3 h-3" />
        购买新课包
      </button>
      {panel && createPortal(panel, document.body)}
    </>
  );
}
