import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import FutureCustomer from '@/lib/models/FutureCustomer';
import { escapeRegExp } from '@/lib/regex-escape';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';

    await dbConnect();

    const query = { source: 'questionnaire' };
    if (search) {
      const safeSearch = escapeRegExp(search);
      query.$or = [
        { name:  { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { phone: { $regex: safeSearch, $options: 'i' } },
        { notes: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const docs = await FutureCustomer.find(query).sort({ createdAt: -1 }).lean();

    const surveys = docs.map((d) => ({
      id:        String(d._id),
      name:      d.name,
      email:     d.email,
      phone:     d.phone,
      notes:     d.notes,
      createdAt: d.createdAt,
    }));

    return NextResponse.json({ success: true, surveys });
  } catch (err) {
    console.error('GET /api/admin/surveys error:', err);
    return NextResponse.json({ error: 'Failed to load survey submissions' }, { status: 500 });
  }
}
