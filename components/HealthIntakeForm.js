'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, Pen, RotateCcw, Check, ShieldCheck } from 'lucide-react';

export default function HealthIntakeForm({ onComplete, userName = '', userEmail = '' }) {
  const [formData, setFormData] = useState({
    phone: '',
    healthNotes: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    waiverAccepted: null, // null = not answered, true = yes, false = no
    comments: '',
  });
  const [hasSignature, setHasSignature] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const signedAt = useRef(new Date());

  // Canvas refs & drawing state
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Resize canvas to fit its container while keeping it crisp
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = true;
    const canvas = canvasRef.current;
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);

    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPos.current = pos;
    setHasSignature(true);
  }, []);

  const endDraw = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = false;
  }, []);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasSignature(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValid =
    formData.healthNotes.trim() &&
    formData.emergencyContactName.trim() &&
    formData.emergencyContactPhone.trim() &&
    formData.waiverAccepted === true &&
    hasSignature;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);
    setError('');

    try {
      const signatureDataUrl = canvasRef.current.toDataURL('image/png');

      const res = await fetch('/api/health-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          signatureDataUrl,
          signedAt: signedAt.current.toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit form');

      onComplete?.();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formattedDate = signedAt.current.toLocaleDateString('en-NZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-xl">

        {/* Branded Header */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] text-glow-cyan/70 uppercase mb-2">Inner Light Yoga</p>
          <h1 className="font-display text-3xl md:text-4xl text-glow-subtle mb-2">
            Student Health &amp; Waiver Form
          </h1>
          <p className="text-sm text-muted-foreground">
            Please complete before your first class. All information is held as private and confidential.
          </p>
          <div className="mt-3 text-xs text-muted-foreground/60">{formattedDate}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Pre-filled read-only name & email */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Name</label>
              <input
                type="text"
                value={userName}
                readOnly
                className="w-full px-3 py-2 rounded-xl bg-card/40 border border-glow-cyan/20 text-foreground opacity-70 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Email</label>
              <input
                type="email"
                value={userEmail}
                readOnly
                className="w-full px-3 py-2 rounded-xl bg-card/40 border border-glow-cyan/20 text-foreground opacity-70 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Phone Number
              <span className="ml-2 text-xs text-muted-foreground/50">(optional)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+64 XX XXX XXXX"
              className="w-full px-3 py-2 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
            />
          </div>

          {/* Health / Injuries */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              General Health / Injuries / Surgeries / Anything we need to know to keep you safe?
              <span className="text-glow-cyan ml-1">*</span>
            </label>
            <textarea
              name="healthNotes"
              value={formData.healthNotes}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Please share any current or past injuries, surgeries, medical conditions, or physical limitations..."
              className="w-full px-3 py-2 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none resize-none"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Emergency Contact
              <span className="text-glow-cyan ml-1">*</span>
              <span className="ml-2 text-xs text-muted-foreground/50">e.g. Parent / Spouse / Friend</span>
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                required
                placeholder="Contact name"
                className="w-full px-3 py-2 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
              />
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                required
                placeholder="Contact phone number"
                className="w-full px-3 py-2 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Waiver */}
          <div className="p-5 rounded-2xl border border-glow-cyan/20 bg-card/40 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-glow-cyan flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Waiver</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  I acknowledge that participating in physical activity can carry a risk and I accept
                  responsibility for that risk.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, waiverAccepted: true }))}
                className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                  formData.waiverAccepted === true
                    ? 'bg-glow-cyan/20 border-glow-cyan text-glow-cyan'
                    : 'bg-card/50 border-glow-cyan/20 text-muted-foreground hover:border-glow-cyan/40'
                }`}
              >
                Yes, I agree
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, waiverAccepted: false }))}
                className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                  formData.waiverAccepted === false
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-card/50 border-glow-cyan/20 text-muted-foreground hover:border-glow-cyan/40'
                }`}
              >
                No
              </button>
            </div>
            {formData.waiverAccepted === false && (
              <p className="text-xs text-red-400">
                You must accept the waiver to participate in classes.
              </p>
            )}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Comments</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows={3}
              placeholder="Anything else you'd like us to know..."
              className="w-full px-3 py-2 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none resize-none"
            />
          </div>

          {/* Signature */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Pen className="w-4 h-4" />
                Signature
                <span className="text-glow-cyan">*</span>
                <span className="text-xs text-muted-foreground/50 ml-1">— please draw your signature below</span>
              </label>
              {hasSignature && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
            <div
              className={`relative rounded-2xl border-2 overflow-hidden transition-all ${
                hasSignature ? 'border-glow-cyan/50' : 'border-glow-cyan/20'
              }`}
              style={{ height: '130px', touchAction: 'none' }}
            >
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  <p className="text-muted-foreground/30 text-sm">Draw your signature here</p>
                </div>
              )}
              <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground/50">Signed: {formattedDate}</p>
          </div>

          {/* Privacy note */}
          <p className="text-xs text-muted-foreground/50 text-center">
            All information is held as private and confidential.
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full py-3 rounded-2xl bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan font-medium
                       hover:bg-glow-cyan/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Submit &amp; Continue
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
