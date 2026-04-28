// src/lib/format/index.ts — Dutch-locale number/currency/percent helpers.
// All Intl.NumberFormat instances are constructed per call rather than memoised:
// V8 caches instances internally, and Phase 2 callsites are rare enough that
// the cleaner shape wins over the optimisation.

export function fmtEUR(n: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtNum(n: number): string {
  return new Intl.NumberFormat("nl-NL").format(n);
}

export function fmtPercent(n: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(n);
}

export function fmtCompact(n: number): string {
  if (n >= 1_000_000) {
    return `€${(n / 1_000_000).toLocaleString("nl-NL", { maximumFractionDigits: 1 })}M`;
  }
  if (n >= 1_000) {
    return `€${Math.round(n / 1_000)}K`;
  }
  return fmtEUR(n);
}
