export function fmtCurrency(n: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: n >= 1000 ? 0 : 2,
  }).format(n);
}

export function fmtCompact(n: number): string {
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(
    n
  );
}
