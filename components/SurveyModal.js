'use client';

import { useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  howFound: '',
  gender: '',
  hasBirthExperience: '',
  numberOfChildren: '',
  hasPostpartumRecovery: '',
  hasPelvicFloorIssues: '',
  experience: '',
  goals: '',
  healthNotes: '',
};

export default function SurveyModal({ isOpen, onClose, language = 'en' }) {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const zh = language === 'zh';
  const isFemale = form.gender === 'Female';
  const hasBirth = form.hasBirthExperience === 'yes';

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Reset dependent fields when gender changes away from female
      if (name === 'gender' && value !== 'Female') {
        next.hasBirthExperience = '';
        next.numberOfChildren = '';
        next.hasPostpartumRecovery = '';
        next.hasPelvicFloorIssues = '';
      }
      // Reset birth-dependent fields when birth experience changes to no
      if (name === 'hasBirthExperience' && value !== 'yes') {
        next.numberOfChildren = '';
        next.hasPostpartumRecovery = '';
        next.hasPelvicFloorIssues = '';
      }
      return next;
    });
  };

  const setField = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setDone(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL);
    setError('');
    setDone(false);
    onClose();
  };

  const t = (en, cn) => (zh ? cn : en);

  // Reusable pill-button row
  const PillGroup = ({ fieldName, options }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, en, cn }) => (
        <button
          key={value}
          type="button"
          onClick={() => setField(fieldName, form[fieldName] === value ? '' : value)}
          className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
            form[fieldName] === value
              ? 'bg-glow-cyan/20 border-glow-cyan text-glow-cyan'
              : 'bg-card/50 border-glow-cyan/20 text-muted-foreground hover:border-glow-cyan/40'
          }`}
        >
          {t(en, cn)}
        </button>
      ))}
    </div>
  );

  // Yes / No pill pair
  const YesNo = ({ fieldName }) => (
    <PillGroup
      fieldName={fieldName}
      options={[
        { value: 'yes', en: 'Yes', cn: '是' },
        { value: 'no', en: 'No', cn: '否' },
      ]}
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-background border border-glow-cyan/20 shadow-2xl shadow-glow-cyan/10">

        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm px-6 pt-6 pb-4 border-b border-glow-cyan/10">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-glow-cyan/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-xs tracking-[0.3em] text-glow-cyan/70 uppercase mb-1">Inner Light Yoga</p>
          <h2 className="font-display text-2xl text-glow-subtle">
            {t('New Student Survey', '新学员问卷')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t(
              'Help us get to know you before your first class.',
              '在第一次上课之前，让我们先了解一下你。'
            )}
          </p>
        </div>

        {done ? (
          <div className="px-6 py-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="text-xl font-display text-glow-subtle">{t('Thank you!', '谢谢你！')}</h3>
            <p className="text-sm text-muted-foreground">
              {t(
                "We've received your response and will be in touch soon.",
                '我们已收到你的回复，会尽快联系你。'
              )}
            </p>
            <button
              onClick={handleClose}
              className="mt-2 px-6 py-2 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 transition-all"
            >
              {t('Close', '关闭')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

            {/* ── Basic info ── */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  {t('Full Name', '姓名')}<span className="text-glow-cyan ml-1">*</span>
                </label>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  required placeholder={t('Your name', '你的姓名')}
                  className="w-full px-3 py-2 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  {t('Email', '邮箱')}<span className="text-glow-cyan ml-1">*</span>
                </label>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  required placeholder="you@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                {t('Phone', '电话')}
                <span className="ml-2 text-xs text-muted-foreground/50">{t('(optional)', '（选填）')}</span>
              </label>
              <input
                type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="+64 XX XXX XXXX"
                className="w-full px-3 py-2 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-sm"
              />
            </div>

            {/* ── How found us ── */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                {t('How did you find us?', '你是怎么找到我们的？')}
                <span className="ml-2 text-xs text-muted-foreground/50">{t('(optional)', '（选填）')}</span>
              </label>
              <select
                name="howFound" value={form.howFound} onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none text-sm appearance-none"
              >
                <option value="">{t('Select…', '请选择…')}</option>
                <option value="Instagram / Social Media">{t('Instagram / Social Media', 'Instagram / 社交媒体')}</option>
                <option value="Friend / Word of Mouth">{t('Friend / Word of Mouth', '朋友介绍')}</option>
                <option value="Google">{t('Google Search', 'Google 搜索')}</option>
                <option value="Flyer / Poster">{t('Flyer / Poster', '传单 / 海报')}</option>
                <option value="Other">{t('Other', '其他')}</option>
              </select>
            </div>

            {/* ── Gender ── */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                {t('Gender', '性别')}
                <span className="ml-2 text-xs text-muted-foreground/50">{t('(optional)', '（选填）')}</span>
              </label>
              <PillGroup
                fieldName="gender"
                options={[
                  { value: 'Male', en: 'Male', cn: '男性' },
                  { value: 'Female', en: 'Female', cn: '女性' },
                  { value: 'Prefer not to say', en: 'Prefer not to say', cn: '不愿透露' },
                ]}
              />
            </div>

            {/* ── Female-only questions ── */}
            {isFemale && (
              <div className="space-y-5 pl-4 border-l-2 border-glow-cyan/20">

                {/* Birth experience */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    {t('Do you have any birthing experience?', '是否有生产经验？')}
                  </label>
                  <YesNo fieldName="hasBirthExperience" />
                </div>

                {/* Birth-dependent questions */}
                {hasBirth && (
                  <div className="space-y-5">

                    {/* Number of children */}
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        {t('How many children do you have?', '你是几胎妈妈？')}
                      </label>
                      <PillGroup
                        fieldName="numberOfChildren"
                        options={[
                          { value: '1', en: '1 child', cn: '一胎' },
                          { value: '2', en: '2 children', cn: '二胎' },
                          { value: '3+', en: '3 or more', cn: '三胎及以上' },
                        ]}
                      />
                    </div>

                    {/* Postpartum recovery */}
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        {t('Have you done any postpartum recovery?', '是否有产后修复经验？')}
                      </label>
                      <YesNo fieldName="hasPostpartumRecovery" />
                    </div>

                    {/* Pelvic floor */}
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        {t(
                          'Do you still experience any pelvic floor laxity or weakness?',
                          '是否盆底肌还有松弛或无力的现象？'
                        )}
                      </label>
                      <PillGroup
                        fieldName="hasPelvicFloorIssues"
                        options={[
                          { value: 'yes', en: 'Yes', cn: '是' },
                          { value: 'no', en: 'No', cn: '否' },
                          { value: 'not sure', en: 'Not sure', cn: '不确定' },
                        ]}
                      />
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* ── Yoga experience ── */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                {t('Yoga experience', '瑜伽经验')}
                <span className="ml-2 text-xs text-muted-foreground/50">{t('(optional)', '（选填）')}</span>
              </label>
              <PillGroup
                fieldName="experience"
                options={[
                  { value: 'Beginner', en: 'Beginner', cn: '新手' },
                  { value: 'Some experience', en: 'Some experience', cn: '有一些经验' },
                  { value: 'Experienced', en: 'Experienced', cn: '有经验' },
                ]}
              />
            </div>

            {/* ── Goals ── */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                {t('What are you hoping to get from classes?', '你希望从课程中获得什么？')}
                <span className="ml-2 text-xs text-muted-foreground/50">{t('(optional)', '（选填）')}</span>
              </label>
              <textarea
                name="goals" value={form.goals} onChange={handleChange} rows={3}
                placeholder={t(
                  'e.g. flexibility, stress relief, strength, mindfulness…',
                  '例如：柔韧性、减压、力量、正念…'
                )}
                className="w-full px-3 py-2 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none resize-none text-sm"
              />
            </div>

            {/* ── Health notes ── */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                {t('Any injuries or health conditions we should know?', '有没有需要我们了解的伤病或健康状况？')}
                <span className="ml-2 text-xs text-muted-foreground/50">{t('(optional)', '（选填）')}</span>
              </label>
              <textarea
                name="healthNotes" value={form.healthNotes} onChange={handleChange} rows={3}
                placeholder={t(
                  'e.g. lower back issues, knee surgery, pregnancy…',
                  '例如：腰背问题、膝盖手术、怀孕…'
                )}
                className="w-full px-3 py-2 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none resize-none text-sm"
              />
            </div>

            <p className="text-xs text-muted-foreground/50">
              {t('All information is held as private and confidential.', '所有信息将被保密处理。')}
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan font-medium
                         hover:bg-glow-cyan/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{t('Submitting…', '提交中…')}</>
              ) : (
                t('Submit', '提交问卷')
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
