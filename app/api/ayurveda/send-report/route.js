import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { auth } from '@/auth';
import {
  calculateDoshaScores,
  interpretDoshaScores,
  getDoshaRecommendations,
  doshaInfo,
} from '@/data/ayurveda-test-questions';

const resend = new Resend(process.env.RESEND_API_KEY);

function toHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');
}

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 });
    }

    const body = await request.json();
    const { answers, language = 'en' } = body || {};

    if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: 'Invalid test answers' }, { status: 400 });
    }

    const scores = calculateDoshaScores(answers);
    const results = interpretDoshaScores(scores);
    const primary = results[0];
    const secondary = results[1]?.percentage >= 40 ? results[1] : null;
    const recommendations = getDoshaRecommendations(primary.dosha, secondary?.dosha || null);

    const isZh = language === 'zh';
    const primaryName = isZh ? doshaInfo[primary.dosha].zh : doshaInfo[primary.dosha].en;
    const secondaryLabel = secondary
      ? `${isZh ? (doshaInfo[secondary.dosha].zh) : (doshaInfo[secondary.dosha].en)} (${secondary.percentage}%)`
      : (isZh ? '无明显第二主导体质' : 'No strong secondary dosha');

    const scoreRowsHtml = results
      .map((item) => {
        const label = isZh ? doshaInfo[item.dosha].zh : doshaInfo[item.dosha].en;
        return `<li><strong>${label}</strong>: ${item.score} (${item.percentage}%)</li>`;
      })
      .join('');

    const dietText = isZh ? recommendations.primary.diet.zh : recommendations.primary.diet.en;
    const lifestyleText = isZh ? recommendations.primary.lifestyle.zh : recommendations.primary.lifestyle.en;
    const exerciseText = isZh ? recommendations.primary.exercise.zh : recommendations.primary.exercise.en;

    const subject = isZh
      ? '你的阿育吠陀测试报告 | INNER LIGHT'
      : 'Your Ayurveda Test Report | INNER LIGHT';

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 700px; margin: 0 auto;">
        <h2 style="margin-bottom: 8px;">${isZh ? '阿育吠陀测试报告' : 'Ayurveda Test Report'}</h2>
        <p style="margin-top: 0; color: #6b7280;">${new Date().toLocaleString('en-NZ')}</p>

        <div style="padding: 16px; border: 1px solid #d1d5db; border-radius: 10px; margin: 18px 0;">
          <p style="margin: 0 0 8px 0;"><strong>${isZh ? '主导体质' : 'Primary Dosha'}:</strong> ${primaryName} (${primary.percentage}%)</p>
          <p style="margin: 0;"><strong>${isZh ? '次要体质' : 'Secondary Dosha'}:</strong> ${secondaryLabel}</p>
        </div>

        <h3 style="margin-bottom: 8px;">${isZh ? '三体质得分' : 'Dosha Scores'}</h3>
        <ul style="margin-top: 0;">${scoreRowsHtml}</ul>

        <h3>${isZh ? '饮食建议' : 'Diet Recommendations'}</h3>
        <p>${toHtml(dietText)}</p>

        <h3>${isZh ? '生活方式建议' : 'Lifestyle Recommendations'}</h3>
        <p>${toHtml(lifestyleText)}</p>

        <h3>${isZh ? '运动建议' : 'Exercise Recommendations'}</h3>
        <p>${toHtml(exerciseText)}</p>

        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;"/>
        <p style="font-size: 12px; color: #6b7280;">
          ${isZh
            ? '声明：本报告为站内自评结果，仅供健康参考，不构成医疗建议或诊断。若有健康问题，请咨询专业医疗人员。'
            : 'Disclaimer: This report is a website self-assessment for wellness reference only and does not constitute medical advice or diagnosis. Please consult qualified healthcare professionals for medical concerns.'}
        </p>
      </div>
    `;

    const text = [
      isZh ? '阿育吠陀测试报告' : 'Ayurveda Test Report',
      '',
      `${isZh ? '主导体质' : 'Primary Dosha'}: ${primaryName} (${primary.percentage}%)`,
      `${isZh ? '次要体质' : 'Secondary Dosha'}: ${secondaryLabel}`,
      '',
      isZh ? '三体质得分:' : 'Dosha Scores:',
      ...results.map((item) => {
        const label = isZh ? doshaInfo[item.dosha].zh : doshaInfo[item.dosha].en;
        return `- ${label}: ${item.score} (${item.percentage}%)`;
      }),
      '',
      isZh ? '饮食建议:' : 'Diet Recommendations:',
      dietText,
      '',
      isZh ? '生活方式建议:' : 'Lifestyle Recommendations:',
      lifestyleText,
      '',
      isZh ? '运动建议:' : 'Exercise Recommendations:',
      exerciseText,
    ].join('\n');

    const configuredProductionSender = (process.env.EMAIL_FROM_PRODUCTION || '').trim();
    const configuredLocalSender = (process.env.EMAIL_FROM_LOCAL || '').trim();
    const hasProductionSender = Boolean(configuredProductionSender);

    const senderEmail = hasProductionSender
      ? configuredProductionSender
      : (configuredLocalSender || 'onboarding@resend.dev');

    const senderName = hasProductionSender
      ? 'INNER LIGHT Yoga'
      : 'INNER LIGHT Yoga (Test)';

    const { error } = await resend.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: [session.user.email],
      subject,
      html,
      text,
      replyTo: process.env.COMPANY_EMAIL || 'innerlightyuki@gmail.com',
    });

    if (error) {
      return NextResponse.json(
        { error: error?.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Report email sent successfully' });
  } catch (error) {
    console.error('Failed to send ayurveda report email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
