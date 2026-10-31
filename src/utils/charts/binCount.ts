export interface ProfitBin {
  start: number;
  end: number;
  count: number;
  /** Bin also contains outliers beyond the clipped range */
  clipped: boolean;
}

/**
 * Conservative quantile - rounds outwards, so small datasets (< 1/q values) are never clipped
 */
function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  return q < 0.5 ? sorted[Math.floor(pos)]! : sorted[Math.ceil(pos)]!;
}

/** Round a raw step to the nearest "nice" value (1, 2, 2.5, 5 x 10^n) */
function niceStep(raw: number): number {
  const exp = 10 ** Math.floor(Math.log10(raw));
  const f = raw / exp;
  const nice = f < 1.5 ? 1 : f < 2.25 ? 2 : f < 3.75 ? 2.5 : f < 7.5 ? 5 : 10;
  return nice * exp;
}

/**
 * Bin profit ratios into a histogram with "nice" bin sizes, aligned to 0 so
 * each bin is either entirely profit or entirely loss.
 * Values outside the [clipQuantile, 1 - clipQuantile] range are accumulated in the edge bins,
 * so a few outliers don't squash the rest of the distribution.
 */
export function binData(data: number[], bins: number, clipQuantile = 0.01): ProfitBin[] {
  if (data.length === 0) {
    return [];
  }
  const sorted = [...data].sort((a, b) => a - b);
  let lower = quantile(sorted, clipQuantile);
  let upper = quantile(sorted, 1 - clipQuantile);
  if (upper <= lower) {
    lower = sorted[0]!;
    upper = sorted[sorted.length - 1]!;
  }
  const range = upper - lower || Math.abs(lower) || 0.01;
  const step = niceStep(range / bins);
  // Precision to avoid floating point artifacts in bin edges
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 2);
  const roundEdge = (v: number) => Number(v.toFixed(decimals));

  const firstEdge = Math.floor(lower / step) * step;
  // Last bin is closed on its upper edge, so the maximum doesn't get a bin of its own
  const binCount = Math.max(1, Math.ceil((upper - firstEdge) / step - 1e-9));

  const result: ProfitBin[] = Array.from({ length: binCount }, (_, i) => ({
    start: roundEdge(firstEdge + i * step),
    end: roundEdge(firstEdge + (i + 1) * step),
    count: 0,
    clipped: false,
  }));

  for (const value of sorted) {
    const idx = Math.floor((value - firstEdge) / step + 1e-9);
    if (isNaN(idx)) continue;
    const bin = result[Math.min(Math.max(idx, 0), binCount - 1)]!;
    bin.count++;
    if (value < lower || value > upper) {
      bin.clipped = true;
    }
  }
  return result;
}
