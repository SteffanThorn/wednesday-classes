import mongoose from 'mongoose';
import ClassAttendance from '@/lib/models/ClassAttendance';
import {
  SINGLE_CLASS_PRICE,
  FIVE_CLASS_PACKAGE_SIZE,
  FIVE_CLASS_PACKAGE_PRICE,
} from '@/lib/pricing';

/**
 * Work out how much each customer has spent, from the classes recorded for them.
 *
 * - A class attended without using a package credit was bought on its own: $15.
 * - Package credits (used + still remaining) come in 5-class packs at $65.
 *   Credits are rounded up to whole packs, because older packs were often
 *   entered as a part-used balance (e.g. "0 → 3" for a pack with 2 already used).
 *
 * @param {Array<{ userId: any, remainingCredits: number }>} customers
 * @returns {Promise<Map<string, object>>} spend summary keyed by userId string
 */
export async function getSpendByUser(customers) {
  const ids = customers
    .map((c) => c.userId?.toString())
    .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

  const counts = ids.length
    ? await ClassAttendance.aggregate([
        { $match: { userId: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) } } },
        {
          $group: {
            _id: '$userId',
            // Attended without a package credit = a single class. Older records
            // have no paymentStatus and count as paid.
            singleClasses: {
              $sum: { $cond: [{ $and: [
                { $ne: ['$usedCredit', true] },
                { $eq: ['$status', 'attended'] },
                { $ne: ['$paymentStatus', 'unpaid'] },
              ] }, 1, 0] },
            },
            unpaidClasses: {
              $sum: { $cond: [{ $and: [
                { $ne: ['$usedCredit', true] },
                { $eq: ['$status', 'attended'] },
                { $eq: ['$paymentStatus', 'unpaid'] },
              ] }, 1, 0] },
            },
            packageClassesUsed: { $sum: { $cond: [{ $eq: ['$usedCredit', true] }, 1, 0] } },
          },
        },
      ])
    : [];

  const countsById = new Map(counts.map((row) => [row._id.toString(), row]));
  const result = new Map();

  for (const customer of customers) {
    const id = customer.userId?.toString();
    if (!id) continue;
    const row = countsById.get(id) || { singleClasses: 0, unpaidClasses: 0, packageClassesUsed: 0 };
    result.set(id, summarizeSpend({
      singleClasses: row.singleClasses,
      unpaidClasses: row.unpaidClasses,
      packageClassesUsed: row.packageClassesUsed,
      remainingCredits: customer.remainingCredits,
    }));
  }

  return result;
}

export function summarizeSpend({ singleClasses = 0, unpaidClasses = 0, packageClassesUsed = 0, remainingCredits = 0 }) {
  const remaining = Math.max(0, Math.floor(Number(remainingCredits) || 0));
  const packages = Math.ceil((packageClassesUsed + remaining) / FIVE_CLASS_PACKAGE_SIZE);
  const singleTotal = singleClasses * SINGLE_CLASS_PRICE;
  const packageTotal = packages * FIVE_CLASS_PACKAGE_PRICE;

  return {
    singleClasses,
    singleTotal,
    packages,
    packageTotal,
    packageClassesUsed,
    totalSpent: singleTotal + packageTotal,
    unpaidClasses,
    amountOwed: unpaidClasses * SINGLE_CLASS_PRICE,
  };
}

export const EMPTY_SPEND = summarizeSpend({});
