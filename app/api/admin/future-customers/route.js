import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import HealthIntake from '@/lib/models/HealthIntake';
import FutureCustomer from '@/lib/models/FutureCustomer';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhone(value) {
  const input = String(value || '').trim();
  if (!input) return '';
  const keepPlus = input.startsWith('+');
  const digits = input.replace(/\D/g, '');
  return keepPlus ? `+${digits}` : digits;
}

function splitCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function hasHeaderRow(firstRow) {
  const joined = firstRow.map((cell) => String(cell || '').toLowerCase()).join('|');
  return (
    joined.includes('email') ||
    joined.includes('邮箱') ||
    joined.includes('name') ||
    joined.includes('姓名') ||
    joined.includes('phone') ||
    joined.includes('电话')
  );
}

function resolveHeaderIndexes(headerRow) {
  const normalized = headerRow.map((cell) => String(cell || '').trim().toLowerCase());
  const matchIndex = (keywords, fallbackIndex) => {
    const found = normalized.findIndex((value) => keywords.some((keyword) => value.includes(keyword)));
    return found >= 0 ? found : fallbackIndex;
  };

  return {
    name: matchIndex(['name', '姓名', '名字'], 0),
    email: matchIndex(['email', '邮箱', '邮件'], 1),
    phone: matchIndex(['phone', '电话', '手机号', 'mobile'], 2),
    notes: matchIndex(['notes', 'note', '备注', '说明', 'comment'], 3),
  };
}

function parseRows(rawText) {
  const lines = String(rawText || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { rows: [], invalidRows: [] };
  }

  const parsed = lines.map((line) => splitCsvLine(line));
  const hasHeader = hasHeaderRow(parsed[0]);
  const headerIndexes = hasHeader ? resolveHeaderIndexes(parsed[0]) : null;
  const dataRows = hasHeader ? parsed.slice(1) : parsed;

  const rows = [];
  const invalidRows = [];

  dataRows.forEach((cells, index) => {
    const name = String(cells[headerIndexes?.name ?? 0] || '').trim();
    const email = normalizeEmail(cells[headerIndexes?.email ?? 1]);
    const phone = normalizePhone(cells[headerIndexes?.phone ?? 2]);
    const notes = String(cells[headerIndexes?.notes ?? 3] || '').trim();

    if (!name || (!email && !phone)) {
      invalidRows.push({
        rowNumber: hasHeader ? index + 2 : index + 1,
        raw: cells,
        reason: 'Missing required fields (name and at least one contact)',
      });
      return;
    }

    rows.push({ name, email, phone, notes });
  });

  return { rows, invalidRows };
}

function buildDedupKey(record) {
  if (record.email) return `email:${record.email}`;
  if (record.phone) return `phone:${record.phone}`;
  return `name:${record.name.toLowerCase()}`;
}

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { session };
}

async function getActiveMaps() {
  const active = await HealthIntake.find({}, { userName: 1, userEmail: 1, phone: 1 }).lean();

  const activeByEmail = new Map();
  const activeByPhone = new Map();

  active.forEach((item) => {
    const email = normalizeEmail(item.userEmail);
    const phone = normalizePhone(item.phone);

    if (email && !activeByEmail.has(email)) {
      activeByEmail.set(email, {
        name: item.userName || '',
        email,
        phone,
      });
    }

    if (phone && !activeByPhone.has(phone)) {
      activeByPhone.set(phone, {
        name: item.userName || '',
        email,
        phone,
      });
    }
  });

  return { activeByEmail, activeByPhone };
}

async function getFutureMaps() {
  const future = await FutureCustomer.find({}, { name: 1, email: 1, phone: 1 }).lean();
  const futureByEmail = new Map();
  const futureByPhone = new Map();

  future.forEach((item) => {
    const email = normalizeEmail(item.email);
    const phone = normalizePhone(item.phone);
    const base = {
      id: item._id.toString(),
      name: item.name || '',
      email,
      phone,
    };

    if (email && !futureByEmail.has(email)) {
      futureByEmail.set(email, base);
    }
    if (phone && !futureByPhone.has(phone)) {
      futureByPhone.set(phone, base);
    }
  });

  return { futureByEmail, futureByPhone };
}

function buildPreview(rows, activeMaps, futureMaps) {
  const uploadSeen = new Set();
  const duplicatesInUpload = [];
  const overlapWithActive = [];
  const overlapWithFutureList = [];
  const importCandidates = [];

  rows.forEach((row) => {
    const dedupKey = buildDedupKey(row);
    if (uploadSeen.has(dedupKey)) {
      duplicatesInUpload.push(row);
      return;
    }
    uploadSeen.add(dedupKey);

    const activeMatch = row.email
      ? activeMaps.activeByEmail.get(row.email)
      : row.phone
        ? activeMaps.activeByPhone.get(row.phone)
        : null;

    if (activeMatch) {
      overlapWithActive.push({ upload: row, active: activeMatch });
      return;
    }

    const futureMatch = row.email
      ? futureMaps.futureByEmail.get(row.email)
      : row.phone
        ? futureMaps.futureByPhone.get(row.phone)
        : null;

    if (futureMatch) {
      overlapWithFutureList.push({ upload: row, existingFuture: futureMatch });
      return;
    }

    importCandidates.push(row);
  });

  return {
    duplicatesInUpload,
    overlapWithActive,
    overlapWithFutureList,
    importCandidates,
  };
}

export async function GET() {
  const { session, error } = await ensureAdmin();
  if (error) return error;

  await dbConnect();

  try {
    const list = await FutureCustomer.find({})
      .sort({ createdAt: -1 })
      .lean();

    const customers = list.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      email: item.email || '',
      phone: item.phone || '',
      notes: item.notes || '',
      source: item.source || 'manual-import',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers,
      adminEmail: session.user.email || '',
    });
  } catch (apiError) {
    console.error('GET /api/admin/future-customers error:', apiError);
    return NextResponse.json({ error: 'Failed to load future customers' }, { status: 500 });
  }
}

export async function POST(request) {
  const { session, error } = await ensureAdmin();
  if (error) return error;

  await dbConnect();

  try {
    const body = await request.json();
    const rawText = body?.rawText;
    const source = String(body?.source || 'manual-import').trim() || 'manual-import';
    const confirmOverlap = Boolean(body?.confirmOverlap);

    if (!rawText || !String(rawText).trim()) {
      return NextResponse.json({ error: 'rawText is required' }, { status: 400 });
    }

    const { rows, invalidRows } = parseRows(rawText);
    if (!rows.length) {
      return NextResponse.json(
        {
          error: 'No valid rows found. Provide CSV rows: name,email,phone,notes',
          invalidRows,
        },
        { status: 400 }
      );
    }

    const activeMaps = await getActiveMaps();
    const futureMaps = await getFutureMaps();
    const preview = buildPreview(rows, activeMaps, futureMaps);

    if (preview.overlapWithActive.length > 0 && !confirmOverlap) {
      return NextResponse.json(
        {
          success: false,
          needsConfirmation: true,
          message: 'Overlap with active customers detected. Confirm to auto-clean duplicates and continue.',
          summary: {
            totalValidRows: rows.length,
            invalidRows: invalidRows.length,
            duplicatesInUpload: preview.duplicatesInUpload.length,
            overlapWithActive: preview.overlapWithActive.length,
            overlapWithFutureList: preview.overlapWithFutureList.length,
            readyToImport: preview.importCandidates.length,
          },
          overlapWithActive: preview.overlapWithActive,
          overlapWithFutureList: preview.overlapWithFutureList,
          duplicatesInUpload: preview.duplicatesInUpload,
          invalidRows,
        },
        { status: 409 }
      );
    }

    const insertDocs = preview.importCandidates.map((row) => ({
      name: row.name,
      email: row.email,
      phone: row.phone,
      notes: row.notes,
      source,
      addedByAdminId: session.user.id,
      addedByAdminEmail: session.user.email || '',
    }));

    let createdCount = 0;
    if (insertDocs.length > 0) {
      const created = await FutureCustomer.insertMany(insertDocs, { ordered: false });
      createdCount = created.length;
    }

    let cleanedFutureDuplicates = 0;
    if (confirmOverlap && preview.overlapWithActive.length > 0) {
      const activeEmails = [...new Set(preview.overlapWithActive.map((item) => item.upload.email).filter(Boolean))];
      const activePhones = [...new Set(preview.overlapWithActive.map((item) => item.upload.phone).filter(Boolean))];

      const deleteFilter = {
        $or: [
          ...(activeEmails.length ? [{ email: { $in: activeEmails } }] : []),
          ...(activePhones.length ? [{ phone: { $in: activePhones } }] : []),
        ],
      };

      if (deleteFilter.$or.length > 0) {
        const deleteResult = await FutureCustomer.deleteMany(deleteFilter);
        cleanedFutureDuplicates = deleteResult.deletedCount || 0;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Import finished',
      summary: {
        totalValidRows: rows.length,
        invalidRows: invalidRows.length,
        duplicatesInUpload: preview.duplicatesInUpload.length,
        overlapWithActive: preview.overlapWithActive.length,
        overlapWithFutureList: preview.overlapWithFutureList.length,
        imported: createdCount,
        cleanedFutureDuplicates,
      },
      overlapWithActive: preview.overlapWithActive,
      overlapWithFutureList: preview.overlapWithFutureList,
      duplicatesInUpload: preview.duplicatesInUpload,
      invalidRows,
    });
  } catch (apiError) {
    console.error('POST /api/admin/future-customers error:', apiError);
    return NextResponse.json({ error: 'Failed to import future customers' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { error } = await ensureAdmin();
  if (error) return error;

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const id = String(searchParams.get('id') || '').trim();

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const removed = await FutureCustomer.findByIdAndDelete(id);
    if (!removed) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Removed' });
  } catch (apiError) {
    console.error('DELETE /api/admin/future-customers error:', apiError);
    return NextResponse.json({ error: 'Failed to delete future customer' }, { status: 500 });
  }
}
