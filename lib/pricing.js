export const SINGLE_CLASS_PRICE = 15;
export const FIVE_CLASS_PACKAGE_SIZE = 5;
export const FIVE_CLASS_PACKAGE_PRICE = 65;

/**
 * Calculate booking total with package pricing.
 * Pricing rules:
 * - 1 class = $15
 * - 5 class package = $65
 *
 * Package pricing is applied repeatedly for every full set of 5 classes.
 */
export function calculateClassBookingTotal(classCount) {
  const count = Number(classCount);

  if (!Number.isFinite(count) || count <= 0) {
    return 0;
  }

  const normalizedCount = Math.floor(count);
  const packageCount = Math.floor(normalizedCount / FIVE_CLASS_PACKAGE_SIZE);
  const remainingClasses = normalizedCount % FIVE_CLASS_PACKAGE_SIZE;

  return (packageCount * FIVE_CLASS_PACKAGE_PRICE) + (remainingClasses * SINGLE_CLASS_PRICE);
}
