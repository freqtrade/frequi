import type { TimeSummaryRecord } from '@/types';

/**
 * Combine time summaries of multiple bots into one series, merged by date.
 * Profits, starting balances and trade counts are summed.
 * Relative profit is recalculated from the combined values - relative profits of bots
 * with different balances can't be summed up.
 * @param summaries Time summary records, one list per bot
 * @returns Combined records, sorted by date (ascending)
 */
export function combineTimeSummaries(summaries: TimeSummaryRecord[][]): TimeSummaryRecord[] {
  const resp: Record<string, TimeSummaryRecord> = {};
  summaries.forEach((records) => {
    records.forEach((record) => {
      const existing = resp[record.date];
      if (!existing) {
        resp[record.date] = { ...record };
      } else {
        existing.abs_profit += record.abs_profit;
        existing.fiat_value += record.fiat_value;
        existing.starting_balance += record.starting_balance;
        existing.trade_count += record.trade_count;
      }
    });
  });

  return Object.values(resp)
    .map((record) => ({
      ...record,
      rel_profit: record.starting_balance > 0 ? record.abs_profit / record.starting_balance : 0,
    }))
    .sort((a, b) => (a.date > b.date ? 1 : -1));
}
