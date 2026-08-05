// Comfortably below the `decimal(14,2)` column limit (~10^12) shared by every
// monetary column in the schema, so a mistyped/huge value gets a clean 400
// validation error instead of a raw Postgres "numeric field overflow" 500.
export const MAX_MONETARY_VALUE = 999_999_999.99;
