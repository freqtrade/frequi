import { formatPercent, formatPriceCurrency } from '@/shared/formatters';
import { roundTimeframe } from '@/shared/timemath';
import { Order, PairHistory, Trade } from '@/types';

function buildToolTip(trade: Trade, side: string): string {
  return `${trade.is_short ? 'Short' : 'Long'} ${side}  ${formatPercent(
    trade.profit_ratio,
  )} \nEnter-tag: ${trade.enter_tag ?? ''} \nExit-Tag: ${trade.exit_reason ?? ''}`;
}

function buildAdjustmentToolTip(trade: Trade, order: Order): string {
  return `${trade.is_short ? 'Short' : 'Long'} adjustment
    ${order.ft_order_side === 'buy' ? '+' : '-'}${formatPriceCurrency(
    order.cost,
    trade.quote_currency ?? '',
  )}\nEnter-tag: ${trade.enter_tag ?? ''}`;
}

// const ENTRY_SYMB = 'circle';
// const EXIT_SYMB = 'rect';

const ADJUSTMENT_SYMBOL =
  'path://m 52.444161,104.1909 8.386653,25.34314 8.386651,25.34313 -16.731501,0.0422 -16.731501,0.0422 8.344848,-25.38539 z m 0.08656,-48.368126 8.386652,25.343139 8.386652,25.343137 -16.731501,0.0422 -16.731502,0.0422 8.344848,-25.385389 z';
const OPEN_CLOSE_SYMBOL =
  'path://m 102.20764,19.885384 h 24.1454 v 41.928829 h -24.1454 z m 12.17344,36.423813 8.38665,25.343139 8.38666,25.343134 -16.7315,0.0422 -16.731507,0.0422 8.344847,-25.385386 z';

const SHORT_COLOR = '#AD00FF';
//const SHORT_ADJUST_COLOR = '#CE3BFF';
const LONG_COLOR = '#0066FF';
//const LONG_ADJUST_COLOR = '#00A9FF';

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
      // Trade is open or closed and within timerange
      roundTimeframe(dataset.timeframe_ms ?? 0, trade.open_timestamp) <= dataset.data_stop_ts ||
      !trade.close_timestamp ||
      (trade.close_timestamp && trade.close_timestamp >= dataset.data_start_ts)
    ) {
      if (trade.orders) {
        for (let i = 0; i < trade.orders.length; i++) {
          const order: Order = trade.orders[i];
          if (
            order.order_filled_timestamp &&
            roundTimeframe(dataset.timeframe_ms ?? 0, order.order_filled_timestamp) <=
              dataset.data_stop_ts &&
            order.order_filled_timestamp > dataset.data_start_ts
          ) {
            // Trade entry
            if (i === 0) {
              tradeData.push([
                roundTimeframe(dataset.timeframe_ms ?? 0, trade.open_timestamp),
                order.safe_price,
                OPEN_CLOSE_SYMBOL,
                order.ft_order_side == 'sell' ? 180 : 0,
                trade.is_short ? SHORT_COLOR : LONG_COLOR,
                trade.is_short ? 'Short' : 'Long',
                buildToolTip(trade, 'entry'),
              ]);
              // Trade exit
            } else if (i === trade.orders.length - 1 && trade.close_timestamp) {
              if (
                roundTimeframe(dataset.timeframe_ms ?? 0, trade.close_timestamp) <=
                  dataset.data_stop_ts &&
                trade.close_timestamp > dataset.data_start_ts &&
                trade.is_open === false
              ) {
                tradeData.push([
                  roundTimeframe(dataset.timeframe_ms ?? 0, trade.close_timestamp),
                  order.safe_price,
                  OPEN_CLOSE_SYMBOL,
                  trade.is_short ? 0 : 180,
                  trade.is_short ? SHORT_COLOR : LONG_COLOR,
                  // (trade.profit_abs ?? 0) > 0 ? '#31e04b' : '#fc0505',
                  formatPercent(trade.profit_ratio, 2),
                  buildToolTip(trade, 'exit'),
                ]);
              }
            }
            // Position adjustment
            else {
              tradeData.push([
                roundTimeframe(dataset.timeframe_ms ?? 0, order.order_filled_timestamp),
                order.safe_price,
                ADJUSTMENT_SYMBOL,
                order.ft_order_side == 'sell' ? 180 : 0,
                trade.is_short ? SHORT_COLOR : LONG_COLOR,
                '',
                buildAdjustmentToolTip(trade, order),
              ]);
            }
          }
        }
      }
    }
  }
  return { tradeData };
}
