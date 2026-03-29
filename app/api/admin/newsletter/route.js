import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import NewsletterCampaign from '@/lib/models/NewsletterCampaign';
import { weeklySchedule } from '@/lib/newsletter-schedule';

/**
 * GET /api/admin/newsletter
 * Returns all 12 weeks merged with any saved campaign data from the database.
 * Accessible by admin only.
 */
export async function GET(request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const campaigns = await NewsletterCampaign.find({}).lean();

    // Build a map of weekNumber → campaign
    const campaignMap = {};
    campaigns.forEach((c) => {
      campaignMap[c.weekNumber] = c;
    });

    // Merge static schedule with dynamic DB data
    const weeks = weeklySchedule.map((s) => {
      const campaign = campaignMap[s.week] || null;
      return {
        ...s,
        campaign: campaign
          ? {
              id: campaign._id.toString(),
              subject: campaign.subject,
              mainContent: campaign.mainContent,
              practiceHighlights: campaign.practiceHighlights,
              instructorNote: campaign.instructorNote,
              status: campaign.status,
              sentAt: campaign.sentAt,
              recipientCount: campaign.recipientCount,
              updatedAt: campaign.updatedAt,
            }
          : null,
      };
    });

    return NextResponse.json({ success: true, weeks });
  } catch (error) {
    console.error('GET /api/admin/newsletter error:', error);
    return NextResponse.json({ error: 'Failed to load newsletter data' }, { status: 500 });
  }
}

/**
 * POST /api/admin/newsletter
 * Create or update (upsert) a campaign draft for a specific week.
 * Body: { weekNumber, subject, mainContent, practiceHighlights, instructorNote }
 */
export async function POST(request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const body = await request.json();
    const { weekNumber, subject, mainContent, practiceHighlights, instructorNote } = body;

    // Validate
    if (!weekNumber || weekNumber < 1 || weekNumber > 12) {
      return NextResponse.json({ error: 'weekNumber must be between 1 and 12' }, { status: 400 });
    }
    if (!subject?.trim()) {
      return NextResponse.json({ error: 'subject is required' }, { status: 400 });
    }
    if (!mainContent?.trim()) {
      return NextResponse.json({ error: 'mainContent is required' }, { status: 400 });
    }

    // Filter empty highlight strings
    const highlights = (practiceHighlights || []).map((h) => h.trim()).filter(Boolean);

    // Upsert — update existing or create new (never overwrite sentAt/recipientCount if already sent)
    const existing = await NewsletterCampaign.findOne({ weekNumber });

    if (existing) {
      existing.subject = subject.trim();
      existing.mainContent = mainContent.trim();
      existing.practiceHighlights = highlights;
      existing.instructorNote = (instructorNote || '').trim();
      // Keep status as 'draft' only if not already sent
      if (existing.status !== 'sent') {
        existing.status = 'draft';
      }
      await existing.save();

      return NextResponse.json({
        success: true,
        message: 'Draft saved',
        campaign: {
          id: existing._id.toString(),
          weekNumber: existing.weekNumber,
          subject: existing.subject,
          status: existing.status,
        },
      });
    } else {
      const campaign = await NewsletterCampaign.create({
        weekNumber,
        subject: subject.trim(),
        mainContent: mainContent.trim(),
        practiceHighlights: highlights,
        instructorNote: (instructorNote || '').trim(),
        status: 'draft',
      });

      return NextResponse.json({
        success: true,
        message: 'Draft created',
        campaign: {
          id: campaign._id.toString(),
          weekNumber: campaign.weekNumber,
          subject: campaign.subject,
          status: campaign.status,
        },
      });
    }
  } catch (error) {
    console.error('POST /api/admin/newsletter error:', error);
    return NextResponse.json({ error: 'Failed to save newsletter draft' }, { status: 500 });
  }
}
