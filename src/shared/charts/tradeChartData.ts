import { formatPercent } from '@/shared/formatters';
import { roundTimeframe } from '@/shared/timemath';
import { PairHistory, Trade } from '@/types';

function buildToolTip(trade: Trade, side: string): string {
  return `${trade.is_short ? 'Short' : 'Long'} ${side}  ${formatPercent(
    trade.profit_ratio,
  )} \nEnter-tag: ${trade.enter_tag ?? ''} \nExit-Tag: ${trade.exit_reason ?? ''}`;
}
const ENTRY_SYMB = 'circle';
const EXIT_SYMB = 'rect';


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
        (trade.profit_abs ?? 0) > 0 ? '#31e04b' : '#ed1511',
        // trade.is_short ? '#ffaf0d' : '#ff0df3',
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
          // trade.is_short ? '#ffaf0d' : '#00ff26',
          (trade.profit_abs ?? 0) > 0 ? '#31e04b' : '#ed1511',
          formatPercent(trade.profit_ratio, 2),
          buildToolTip(trade, 'exit'),
        ]);
      }
    }
  }
  return { tradeData };
}
