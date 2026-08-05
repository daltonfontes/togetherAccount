// Mirrors backend/src/common/constants.ts — comfortably below the
// `decimal(14,2)` column limit shared by every monetary column, so a
// mistyped/huge value gets a friendly inline error instead of a failed
// request.
export const MAX_MONETARY_VALUE = 999_999_999.99;
