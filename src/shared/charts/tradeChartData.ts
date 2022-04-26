import { formatPercent } from '@/shared/formatters';
import { roundTimeframe } from '@/shared/timemath';
import { PairHistory, Trade } from '@/types';

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
      tradeData.push([
        roundTimeframe(dataset.timeframe_ms ?? 0, trade.open_timestamp),
        trade.open_rate,
        'triangle', // TODO: use better symbol
        trade.is_short ? 180 : 0,
        trade.profit_abs ?? 0 > 0 ? 'green' : 'red',
        // trade.is_short ? '#ffaf0d' : '#ff0df3',
        '',
        // trade.profit_abs,
        `${trade.is_short ? 'Short' : 'Long'} entry ${formatPercent(trade.profit_ratio)} ${
          trade.enter_tag ?? ''
        }`,
      ]);
    }
    if (
      trade.close_timestamp !== undefined &&
      trade.close_timestamp < dataset.data_stop_ts &&
      trade.close_timestamp > dataset.data_start_ts
    ) {
      if (trade.close_date !== undefined && trade.close_rate !== undefined) {
        tradeData.push([
          roundTimeframe(dataset.timeframe_ms ?? 0, trade.close_timestamp),
          trade.close_rate,
          'rect',
          trade.is_short ? 180 : 0,
          // trade.is_short ? '#ffaf0d' : '#00ff26',
          trade.profit_abs ?? 0 > 0 ? 'green' : 'red',
          formatPercent(trade.profit_ratio, 2),
          `${trade.is_short ? 'Short' : 'Long'} exit  ${formatPercent(trade.profit_ratio)}% ${
            trade.enter_tag ?? ''
          }`,
        ]);
      }
    }
  }
  return { tradeData };
}
