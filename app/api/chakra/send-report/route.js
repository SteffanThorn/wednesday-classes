import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { auth } from '@/auth';
import { getAllQuestions, interpretScore } from '@/data/chakra-questions';

const resend = new Resend(process.env.RESEND_API_KEY);

function toHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');
}

function buildChakraScores(answers = {}) {
  const allQuestions = getAllQuestions();
  const scores = {};

  allQuestions.forEach((q, index) => {
    if (!scores[q.chakraId]) {
      scores[q.chakraId] = {
        chakraId: q.chakraId,
        name: q.chakraName,
        sanskrit: q.sanskrit,
        meaning: q.meaning,
        total: 0,
        answered: 0,
      };
    }

    if (answers[index] !== undefined) {
      const numericValue = Number(answers[index]);
      if (!Number.isNaN(numericValue)) {
        scores[q.chakraId].total += numericValue;
        scores[q.chakraId].answered += 1;
      }
    }
  });

  return Object.values(scores);
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

    const isZh = language === 'zh';
    const chakraScores = buildChakraScores(answers);

    if (chakraScores.length === 0) {
      return NextResponse.json({ error: 'Unable to calculate chakra scores' }, { status: 400 });
    }

    const interpreted = chakraScores.map((chakra) => {
      const interpretation = interpretScore(chakra.total);
      const chakraName = typeof chakra.name === 'object'
        ? (isZh ? chakra.name.zh : chakra.name.en)
        : chakra.name;
      const chakraMeaning = typeof chakra.meaning === 'object'
        ? (isZh ? chakra.meaning.zh : chakra.meaning.en)
        : chakra.meaning;
      const statusLabel = isZh ? interpretation.status.zh : interpretation.status.en;
      const description = isZh ? interpretation.description.zh : interpretation.description.en;

      return {
        ...chakra,
        chakraName,
        chakraMeaning,
        statusLabel,
        description,
      };
    });

    const strongest = [...interpreted].sort((a, b) => b.total - a.total)[0];
    const weakest = [...interpreted].sort((a, b) => a.total - b.total)[0];

    const subject = isZh
      ? '你的脉轮测试报告 | INNER LIGHT'
      : 'Your Chakra Test Report | INNER LIGHT';

    const scoreRowsHtml = interpreted
      .map((item) => (
        `<li><strong>${item.chakraName}</strong> (${item.sanskrit}) - ${isZh ? '得分' : 'Score'}: ${item.total}/35, ${isZh ? '状态' : 'Status'}: ${item.statusLabel}<br/><span style="color:#6b7280;">${toHtml(item.description)}</span></li>`
      ))
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 700px; margin: 0 auto;">
        <h2 style="margin-bottom: 8px;">${isZh ? '脉轮测试报告' : 'Chakra Test Report'}</h2>
        <p style="margin-top: 0; color: #6b7280;">${new Date().toLocaleString('en-NZ')}</p>

        <div style="padding: 16px; border: 1px solid #d1d5db; border-radius: 10px; margin: 18px 0;">
          <p style="margin: 0 0 8px 0;"><strong>${isZh ? '当前优势脉轮' : 'Strongest Chakra'}:</strong> ${strongest.chakraName} (${strongest.sanskrit})</p>
          <p style="margin: 0;"><strong>${isZh ? '当前薄弱脉轮' : 'Weakest Chakra'}:</strong> ${weakest.chakraName} (${weakest.sanskrit})</p>
        </div>

        <h3 style="margin-bottom: 8px;">${isZh ? '七轮评分概览' : 'Seven-Chakra Score Summary'}</h3>
        <ul style="margin-top: 0;">${scoreRowsHtml}</ul>

        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;"/>
        <p style="font-size: 12px; color: #6b7280;">
          ${isZh
            ? '声明：本报告为站内自评结果，仅供健康参考，不构成医疗建议或诊断。若有健康问题，请咨询专业医疗人员。'
            : 'Disclaimer: This report is a website self-assessment for wellness reference only and does not constitute medical advice or diagnosis. Please consult qualified healthcare professionals for medical concerns.'}
        </p>
      </div>
    `;

    const text = [
      isZh ? '脉轮测试报告' : 'Chakra Test Report',
      '',
      `${isZh ? '当前优势脉轮' : 'Strongest Chakra'}: ${strongest.chakraName} (${strongest.sanskrit})`,
      `${isZh ? '当前薄弱脉轮' : 'Weakest Chakra'}: ${weakest.chakraName} (${weakest.sanskrit})`,
      '',
      isZh ? '七轮评分概览:' : 'Seven-Chakra Score Summary:',
      ...interpreted.map((item) => (`- ${item.chakraName} (${item.sanskrit}): ${isZh ? '得分' : 'Score'} ${item.total}/35, ${isZh ? '状态' : 'Status'} ${item.statusLabel}`)),
      '',
      isZh ? '声明：本报告仅供健康参考，不构成医疗建议。' : 'Disclaimer: This report is for wellness reference only and does not constitute medical advice.',
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
    console.error('Failed to send chakra report email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
