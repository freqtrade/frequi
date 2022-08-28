import { formatPercent } from '@/shared/formatters';
import { roundTimeframe } from '@/shared/timemath';
import { PairHistory, Trade } from '@/types';

function buildToolTip(trade: Trade, side: string): string {
  return `${trade.is_short ? 'Short' : 'Long'} ${side}  ${formatPercent(
    trade.profit_ratio,
  )} \nEnter-tag: ${trade.enter_tag ?? ''} \nExit-Tag: ${trade.exit_reason ?? ''}`;
}
// const ENTRY_SYMB = 'circle';
// const EXIT_SYMB = 'rect';

const ENTRY_SYMB =
  'path://m 52.444161,104.1909 8.386653,25.34314 8.386651,25.34313 -16.731501,0.0422 -16.731501,0.0422 8.344848,-25.38539 z m 0.08656,-48.368126 8.386652,25.343139 8.386652,25.343137 -16.731501,0.0422 -16.731502,0.0422 8.344848,-25.385389 z';
const EXIT_SYMB =
  'path://m 102.20764,19.885384 h 24.1454 v 41.928829 h -24.1454 z m 12.17344,36.423813 8.38665,25.343139 8.38666,25.343134 -16.7315,0.0422 -16.731507,0.0422 8.344847,-25.385386 z';

/** Return trade entries for charting */
export function getTradeEntries(dataset: PairHistory, filteredTrades: Trade[]) {
  const tradeData: (number | string)[][] = [];
  // Return schema:
  // 0: Timeframe
  // 1: rate
  // 2: symbol
  // 3: symbol rotate
  // 4: color
  // 5: label
  // 6: tooltip

  for (let i = 0, len = filteredTrades.length; i < len; i += 1) {
    const trade: Trade = filteredTrades[i];
    if (
      trade.open_timestamp >= dataset.data_start_ts &&
      trade.open_timestamp <= dataset.data_stop_ts
    ) {
      // Trade entry
      tradeData.push([
        roundTimeframe(dataset.timeframe_ms ?? 0, trade.open_timestamp),
        trade.open_rate,
        ENTRY_SYMB,
        trade.is_short ? 180 : 0,
        // (trade.profit_abs ?? 0) > 0 ? '#31e04b' : '#fc0505',
        trade.is_short ? '#AD00FF' : '#0066FF',
        '',
        // trade.profit_abs,
        buildToolTip(trade, 'entry'),
      ]);
    }
    if (
      trade.close_timestamp !== undefined &&
      trade.close_timestamp <= dataset.data_stop_ts &&
      trade.close_timestamp > dataset.data_start_ts
    ) {
      if (trade.close_date !== undefined && trade.close_rate !== undefined) {
        // Trade exit
        tradeData.push([
          roundTimeframe(dataset.timeframe_ms ?? 0, trade.close_timestamp),
          trade.close_rate,
          EXIT_SYMB,
          trade.is_short ? 180 : 0,
          trade.is_short ? '#AD00FF' : '#0066FF',
          // (trade.profit_abs ?? 0) > 0 ? '#31e04b' : '#fc0505',
          formatPercent(trade.profit_ratio, 2),
          buildToolTip(trade, 'exit'),
        ]);
      }
    }
  }
  return { tradeData };
}
