import mongoose from 'mongoose';
import Payment from '@/lib/models/Payment';

/**
 * Each customer's spending, added up from their payment records.
 * Customers with no payments (e.g. students transferred from Rebecca) show $0.
 *
 * @param {Array<{ userId: any }>} customers
 * @returns {Promise<Map<string, object>>} spend summary keyed by userId string
 */
export async function getSpendByUser(customers) {
  const ids = [...new Set(
    customers
      .map((c) => c.userId?.toString())
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
  )];

  const rows = ids.length
    ? await Payment.aggregate([
        { $match: { userId: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) } } },
        {
          $group: {
            _id: { userId: '$userId', type: '$type', status: '$status' },
            count: { $sum: 1 },
            classes: { $sum: '$classes' },
            amount: { $sum: '$amount' },
          },
        },
      ])
    : [];

  const result = new Map(ids.map((id) => [id, emptySpend()]));

  for (const row of rows) {
    const spend = result.get(row._id.userId.toString());
    if (!spend) continue;

    if (row._id.status === 'unpaid') {
      spend.amountOwed += row.amount;
      spend.unpaidCount += row.count;
      continue;
    }

    if (row._id.type === 'single') {
      spend.singleClasses += row.count;
      spend.singleTotal += row.amount;
    } else {
      spend.packages += row.count;
      spend.packageTotal += row.amount;
    }
    spend.classesBought += row.classes;
    spend.totalSpent += row.amount;
  }

  return result;
}

function emptySpend() {
  return {
    singleClasses: 0,
    singleTotal: 0,
    packages: 0,
    packageTotal: 0,
    classesBought: 0,
    totalSpent: 0,
    unpaidCount: 0,
    amountOwed: 0,
  };
}

export const EMPTY_SPEND = Object.freeze(emptySpend());
