import { formatPercent, formatPriceCurrency } from '@/shared/formatters';
import { roundTimeframe } from '@/shared/timemath';
import { Order, PairHistory, Trade, BTOrder } from '@/types';
import { ScatterSeriesOption } from 'echarts';

function buildTooltipCost(trade: Trade, order: Order | BTOrder): string {
  return `${order.ft_order_side === 'buy' ? '+' : '-'}${formatPriceCurrency(
    'cost' in order ? order.cost : order.amount * order.safe_price,
    trade.quote_currency ?? '<stake_currency>',
  )}`;
}

function buildToolTip(trade: Trade, order: Order | BTOrder, side: string): string {
  return `${trade.is_short ? 'Short' : 'Long'} ${side}
  ${formatPercent(trade.profit_ratio)} ${
    trade.profit_abs
      ? '(' +
        formatPriceCurrency(trade.profit_abs, trade.quote_currency ?? '<stake_currency>') +
        ')'
      : ''
  }
  ${buildTooltipCost(trade, order)}
  Enter-tag: ${trade.enter_tag ?? ''}
  Exit-Tag: ${trade.exit_reason ?? ''}`;
}

function buildAdjustmentToolTip(trade: Trade, order: Order | BTOrder): string {
  return `${trade.is_short ? 'Short' : 'Long'} adjustment
  ${buildTooltipCost(trade, order)}
  Enter-tag: ${trade.enter_tag ?? ''}`;
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
export function getTradeEntries(dataset: PairHistory, trades: Trade[]) {
  const tradeData: (number | string)[][] = [];
  // Return schema:
  // 0: Timeframe
  // 1: rate
  // 2: symbol
  // 3: symbol rotate
  // 4: color
  // 5: label
  // 6: tooltip
  const stop_ts_adjusted = dataset.data_stop_ts + dataset.timeframe_ms;
  for (let i = 0, len = trades.length; i < len; i += 1) {
    const trade: Trade = trades[i];
    if (
      // Trade is open or closed and within timerange
      roundTimeframe(dataset.timeframe_ms ?? 0, trade.open_timestamp) <= stop_ts_adjusted ||
      !trade.close_timestamp ||
      (trade.close_timestamp && trade.close_timestamp >= dataset.data_start_ts)
    ) {
      if (trade.orders) {
        for (let i = 0; i < trade.orders.length; i++) {
          const order: Order | BTOrder = trade.orders[i];
          if (
            order.order_filled_timestamp &&
            roundTimeframe(dataset.timeframe_ms ?? 0, order.order_filled_timestamp) <=
              stop_ts_adjusted &&
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
                buildToolTip(trade, order, 'entry'),
              ]);
              // Trade exit
            } else if (i === trade.orders.length - 1 && trade.close_timestamp) {
              if (
                roundTimeframe(dataset.timeframe_ms ?? 0, trade.close_timestamp) <=
                  stop_ts_adjusted &&
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
                  buildToolTip(trade, order, 'exit'),
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

/**
 *  Generate Series displaying trades
 *  This may include trades, orders, and eventually other things related to the trade.
 */
export function generateTradeSeries(
  nameTrades: string,
  theme: string,
  dataset: PairHistory,
  trades: Trade[],
): ScatterSeriesOption {
  const { tradeData } = getTradeEntries(dataset, trades);

  const openTrades = trades.filter((t) => t.is_open);

  const tradesSeries: ScatterSeriesOption = {
    name: nameTrades,
    type: 'scatter',
    xAxisIndex: 0,
    yAxisIndex: 0,
    encode: {
      x: 0,
      y: 1,
      label: 5,
      tooltip: 6,
    },
    label: {
      show: true,
      fontSize: 12,
      backgroundColor: theme !== 'dark' ? '#fff' : '#000',
      padding: 2,
      color: theme === 'dark' ? '#fff' : '#000',
      rotate: 75,
      offset: [10, 0],
      align: 'left',
    },
    itemStyle: {
      // color: tradeSellColor,
      color: (v) => v.data[4],
      opacity: 0.9,
    },
    symbol: (v) => v[2],
    symbolRotate: (v) => v[3],
    symbolSize: 13,
    data: tradeData,
  };
  // Show distance to stoploss
  if (openTrades.length > 0) {
    // Ensure to import and "use" whatever feature in candleChart! (MarkLine, MarkArea, ...)
    // Offset to avoid having the line at the very end of the chart
    const offset = dataset.timeframe_ms * 10;

    tradesSeries.markLine = {
      symbol: 'none',
      itemStyle: {
        color: '#ff0000AA',
      },
      label: {
        show: true,
        position: 'middle',
      },
      lineStyle: {
        type: 'solid',
      },
      data: openTrades.map((t) => {
        return [
          {
            name: 'Stoploss',
            yAxis: t.stop_loss_abs,
            xAxis:
              dataset.data_stop_ts - offset > t.open_timestamp
                ? t.open_timestamp
                : dataset.data_stop_ts - offset,
          },
          {
            yAxis: t.stop_loss_abs,
            xAxis: t.close_timestamp ?? dataset.data_stop_ts + dataset.timeframe_ms,
          },
        ];
      }),
    };
  }
  return tradesSeries;
}
