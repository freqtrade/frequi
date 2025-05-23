import type { Order, PairHistory, Trade, BTOrder } from '@/types';

import type { MarkAreaComponentOption, ScatterSeriesOption } from 'echarts';

function buildTooltipCost(order: Order | BTOrder, quoteCurrency: string): string {
  return `${order.ft_order_side === 'buy' ? '+' : '-'}${formatPriceCurrency(
    'cost' in order ? order.cost : order.amount * order.safe_price,
    quoteCurrency,
  )}`;
}

function buildToolTip(
  trade: Trade,
  order: Order | BTOrder,
  side: string,
  quoteCurrency: string,
): string {
  let tooltip = `${trade.is_short ? 'Short' : 'Long'} ${side}
  ${formatPercent(trade.profit_ratio)} ${
    trade.profit_abs ? '(' + formatPriceCurrency(trade.profit_abs, quoteCurrency) + ')' : ''
  }
  ${buildTooltipCost(order, quoteCurrency)}
  Enter-tag: ${trade.enter_tag ?? ''}
  Order Price: ${formatPriceCurrency(order.safe_price, quoteCurrency)}`;
  tooltip += `${'ft_order_tag' in order && order.ft_order_tag && trade.enter_tag != order.ft_order_tag ? '\nOrder-Tag: ' + order.ft_order_tag : ''}`;
  tooltip += `${trade.exit_reason ? '\nExit-Tag: ' + trade.exit_reason : ''}`;
  return tooltip;
}

function buildAdjustmentToolTip(
  trade: Trade,
  order: Order | BTOrder,
  quoteCurrency: string,
): string {
  let tooltip = `${trade.is_short ? 'Short' : 'Long'} adjustment
  ${buildTooltipCost(order, quoteCurrency)}
  Enter-tag: ${trade.enter_tag ?? ''}`;
  tooltip += `${'ft_order_tag' in order && order.ft_order_tag ? '\nOrder-Tag: ' + order.ft_order_tag : ''}`;

  return tooltip;
}

const ADJUSTMENT_SYMBOL =
  'path://m 52.444161,104.1909 8.386653,25.34314 8.386651,25.34313 -16.731501,0.0422 -16.731501,0.0422 8.344848,-25.38539 z m 0.08656,-48.368126 8.386652,25.343139 8.386652,25.343137 -16.731501,0.0422 -16.731502,0.0422 8.344848,-25.385389 z';
const OPEN_CLOSE_SYMBOL =
  'path://m 102.20764,19.885384 h 24.1454 v 41.928829 h -24.1454 z m 12.17344,36.423813 8.38665,25.343139 8.38666,25.343134 -16.7315,0.0422 -16.731507,0.0422 8.344847,-25.385386 z';

const SHORT_COLOR = '#AD00FF';
//const SHORT_ADJUST_COLOR = '#CE3BFF';
const LONG_COLOR = '#0066FF';
//const LONG_ADJUST_COLOR = '#00A9FF';

/** Return trade entries for charting */
function getTradeEntries(dataset: PairHistory, trades: Trade[]) {
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
    const openTs = trade.open_fill_timestamp ?? trade.open_timestamp;
    if (
      // Trade is open or closed and within timerange
      roundTimeframe(dataset.timeframe_ms ?? 0, trade.open_timestamp) <= stop_ts_adjusted ||
      !trade.close_timestamp ||
      (trade.close_timestamp && trade.close_timestamp >= dataset.data_start_ts)
    ) {
      if (trade.orders) {
        for (let i = 0; i < trade.orders.length; i++) {
          const order: Order | BTOrder = trade.orders[i];
          const orderTs =
            order.order_filled_timestamp ??
            ('order_timestamp' in order ? order.order_timestamp : trade.open_timestamp);
          const { quoteCurrency } = splitTradePair(trade.quote_currency ?? trade.pair ?? '');
          if (
            orderTs &&
            roundTimeframe(dataset.timeframe_ms ?? 0, orderTs) <= stop_ts_adjusted &&
            orderTs > dataset.data_start_ts
          ) {
            // Trade entry
            if (i === 0) {
              tradeData.push([
                roundTimeframe(dataset.timeframe_ms ?? 0, openTs),
                order.safe_price,
                OPEN_CLOSE_SYMBOL,
                order.ft_order_side == 'sell' ? 180 : 0,
                trade.is_short ? SHORT_COLOR : LONG_COLOR,
                (trade.is_short ? 'Short' : 'Long') +
                  (!order.order_filled_timestamp ? ' (open)' : ''),
                buildToolTip(trade, order, 'entry', quoteCurrency),
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
                  formatPercent(trade.profit_ratio, 2),
                  buildToolTip(trade, order, 'exit', quoteCurrency),
                ]);
              }
            }
            // Position adjustment
            else {
              if (
                order.ft_order_side !== 'stoploss' ||
                ('filled' in order && (order.filled ?? 0) > 0)
              ) {
                // Don't show stoploss orders that haven't been filled
                tradeData.push([
                  roundTimeframe(dataset.timeframe_ms ?? 0, orderTs),
                  order.safe_price,
                  ADJUSTMENT_SYMBOL,
                  order.ft_order_side == 'sell' ? 180 : 0,
                  trade.is_short ? SHORT_COLOR : LONG_COLOR,
                  '',
                  buildAdjustmentToolTip(trade, order, quoteCurrency),
                ]);
              }
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

  const openTrade = trades.find((t) => t.is_open);

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
      color: (v) => (v.data ? v.data[4] : '#000'),
      opacity: 0.9,
    },
    symbol: (v) => v[2],
    symbolRotate: (v) => v[3],
    symbolSize: 13,
    data: tradeData,
  };
  // Show distance to stoploss
  if (openTrade) {
    // Ensure to import and "use" whatever feature in candleChart! (MarkLine, MarkArea, ...)
    // Offset to avoid having the line at the very end of the chart
    const offset = dataset.timeframe_ms * 10;

    tradesSeries.markLine = {
      symbol: 'none',
      label: {
        show: true,
        position: 'middle',
      },
      data: [
        [
          {
            name: 'Stoploss',
            yAxis: openTrade.stop_loss_abs,
            lineStyle: {
              color: '#ff0000AA',
              type: 'solid',
            },
            xAxis:
              dataset.data_stop_ts - offset > openTrade.open_timestamp
                ? openTrade.open_timestamp
                : dataset.data_stop_ts - offset,
          },
          {
            lineStyle: {
              color: '#ff0000AA',
              type: 'solid',
            },
            yAxis: openTrade.stop_loss_abs,
            xAxis: openTrade.close_timestamp ?? dataset.data_stop_ts + dataset.timeframe_ms,
          },
        ],
      ],
    };
  }
  return tradesSeries;
}

export function generateMarkArea(
  dataset: PairHistory,
  enabled: boolean,
): { markArea?: MarkAreaComponentOption } {
  if (!dataset.annotations || !enabled) return {};

  const markArea: MarkAreaComponentOption = {
    label: {
      position: 'insideTop',
    },
    data: dataset.annotations
      .filter((area) => area.type == 'area')
      .map((area) => {
        return [
          {
            xAxis: area.start,
            yAxis: area.y_start,
            itemStyle: {
              color: area.color,
            },
            label: {
              formatter: area.label,
            },
          },
          {
            xAxis: area.end,
            yAxis: area.y_end,
          },
        ];
      }),
  };
  return {
    markArea,
  };
}
