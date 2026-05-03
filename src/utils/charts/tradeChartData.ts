import type { Order, PairHistory, Trade, BTOrder } from '@/types';

import type {
  MarkAreaComponentOption,
  MarkLineComponentOption,
  MarkPointComponentOption,
  ScatterSeriesOption,
} from 'echarts';

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
  const isExit = side === 'exit';
  const actionLabel = `${trade.is_short ? 'Short' : 'Long'} ${isExit ? 'historical exit' : 'entry'}`;
  const entryTagLabel = isExit ? 'Original enter-tag' : 'Enter-tag';
  const orderTagLabel = isExit ? 'Exit order-tag' : 'Order-tag';

  let tooltip = `${actionLabel}
  ${formatPercent(trade.profit_ratio)} ${
    trade.profit_abs ? '(' + formatPriceCurrency(trade.profit_abs, quoteCurrency) + ')' : ''
  }
  ${buildTooltipCost(order, quoteCurrency)}
  ${entryTagLabel}: ${trade.enter_tag ?? ''}
  Order Price: ${formatPriceCurrency(order.safe_price, quoteCurrency)}`;
  tooltip += `${'ft_order_tag' in order && order.ft_order_tag && trade.enter_tag != order.ft_order_tag ? '\n' + orderTagLabel + ': ' + order.ft_order_tag : ''}`;
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

function toTimestampMs(value: unknown): number | undefined {
  if (value == null) return undefined;

  if (typeof value === 'number' && Number.isFinite(value)) {
    // normalize seconds -> ms if needed
    return value < 1e12 ? value * 1000 : value;
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
}

function getTradeOpenTimestamp(trade: Trade): number | undefined {
  return toTimestampMs(
    trade.open_fill_timestamp ??
      trade.open_timestamp ??
      (trade as any).open_date_utc ??
      (trade as any).open_date,
  );
}

function getTradeCloseTimestamp(trade: Trade): number | undefined {
  return toTimestampMs(
    trade.close_timestamp ?? (trade as any).close_date_utc ?? (trade as any).close_date,
  );
}

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

  for (const trade of trades) {
    const openTs = getTradeOpenTimestamp(trade);
    const closeTs = getTradeCloseTimestamp(trade);
    const { quoteCurrency } = splitTradePair(trade.quote_currency ?? trade.pair ?? '');

    const tradeTouchesVisibleRange =
      (openTs !== undefined &&
        roundTimeframe(dataset.timeframe_ms ?? 0, openTs) <= stop_ts_adjusted) ||
      closeTs === undefined ||
      (closeTs !== undefined && closeTs >= dataset.data_start_ts);

    if (!tradeTouchesVisibleRange) {
      continue;
    }

    const hasOrders = Array.isArray(trade.orders) && trade.orders.length > 0;

    // ---------------------------------------------------------------------
    // Preferred path: use detailed orders if available
    // ---------------------------------------------------------------------
    if (hasOrders) {
      const orders = trade.orders!;

      for (const [j, order] of orders.entries()) {
        const orderTs = toTimestampMs(
          order.order_filled_timestamp ??
            ('order_timestamp' in order ? order.order_timestamp : undefined) ??
            openTs,
        );

        if (orderTs === undefined) {
          continue;
        }

        if (
          roundTimeframe(dataset.timeframe_ms ?? 0, orderTs) > stop_ts_adjusted ||
          orderTs <= dataset.data_start_ts
        ) {
          continue;
        }

        // Trade entry
        if (j === 0) {
          tradeData.push([
            roundTimeframe(dataset.timeframe_ms ?? 0, orderTs),
            order.safe_price ?? trade.open_rate,
            OPEN_CLOSE_SYMBOL,
            order.ft_order_side == 'sell' ? 180 : 0,
            trade.is_short ? SHORT_COLOR : LONG_COLOR,
            (trade.is_short ? 'Short' : 'Long') + (!order.order_filled_timestamp ? ' (open)' : ''),
            buildToolTip(trade, order, 'entry', quoteCurrency),
          ]);
        }
        // Trade exit
        else if (j === orders.length - 1 && closeTs !== undefined && trade.is_open === false) {
          if (
            roundTimeframe(dataset.timeframe_ms ?? 0, closeTs) <= stop_ts_adjusted &&
            closeTs > dataset.data_start_ts
          ) {
            tradeData.push([
              roundTimeframe(dataset.timeframe_ms ?? 0, closeTs),
              order.safe_price ?? trade.close_rate ?? trade.open_rate,
              OPEN_CLOSE_SYMBOL,
              trade.is_short ? 0 : 180,
              trade.is_short ? SHORT_COLOR : LONG_COLOR,
              `EXIT ${formatPercent(trade.profit_ratio, 2)}`,
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

      continue;
    }

    // ---------------------------------------------------------------------
    // Fallback path: plot from trade-level fields when orders are unavailable
    // ---------------------------------------------------------------------

    if (
      openTs !== undefined &&
      roundTimeframe(dataset.timeframe_ms ?? 0, openTs) <= stop_ts_adjusted &&
      openTs > dataset.data_start_ts
    ) {
      tradeData.push([
        roundTimeframe(dataset.timeframe_ms ?? 0, openTs),
        trade.open_rate,
        OPEN_CLOSE_SYMBOL,
        trade.is_short ? 180 : 0,
        trade.is_short ? SHORT_COLOR : LONG_COLOR,
        `${trade.is_short ? 'Short' : 'Long'}${trade.is_open ? ' (open)' : ''}`,
        `${trade.is_short ? 'Short' : 'Long'} entry
${formatPercent(trade.profit_ratio)}
${trade.profit_abs ? '(' + formatPriceCurrency(trade.profit_abs, quoteCurrency) + ')' : ''}
Enter-tag: ${trade.enter_tag ?? ''}
Order Price: ${formatPriceCurrency(trade.open_rate, quoteCurrency)}`,
      ]);
    }

    if (
      trade.is_open === false &&
      closeTs !== undefined &&
      trade.close_rate &&
      roundTimeframe(dataset.timeframe_ms ?? 0, closeTs) <= stop_ts_adjusted &&
      closeTs > dataset.data_start_ts
    ) {
      tradeData.push([
        roundTimeframe(dataset.timeframe_ms ?? 0, closeTs),
        trade.close_rate,
        OPEN_CLOSE_SYMBOL,
        trade.is_short ? 0 : 180,
        trade.is_short ? SHORT_COLOR : LONG_COLOR,
        `EXIT ${formatPercent(trade.profit_ratio, 2)}`,
        `${trade.is_short ? 'Short' : 'Long'} historical exit
${formatPercent(trade.profit_ratio)}
${trade.profit_abs ? '(' + formatPriceCurrency(trade.profit_abs, quoteCurrency) + ')' : ''}
Original enter-tag: ${trade.enter_tag ?? ''}
Exit-Tag: ${trade.exit_reason ?? ''}
Order Price: ${formatPriceCurrency(trade.close_rate, quoteCurrency)}`,
      ]);
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
  const isDarkTheme = theme === 'dark';

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
      show: false,
      fontSize: 10,
      backgroundColor: isDarkTheme ? 'rgba(3, 7, 18, 0.86)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: isDarkTheme ? 'rgba(148, 163, 184, 0.35)' : 'rgba(15, 23, 42, 0.18)',
      borderWidth: 1,
      borderRadius: 3,
      padding: [2, 4],
      color: isDarkTheme ? '#f8fafc' : '#0f172a',
      position: 'right',
      rotate: 0,
      offset: [4, 0],
      align: 'left',
      width: 56,
      overflow: 'truncate',
    },
    emphasis: {
      label: {
        show: true,
      },
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
  markAreaZIndex?: number | undefined,
): {
  markArea?: MarkAreaComponentOption;
  markLine?: MarkLineComponentOption;
  markPoint?: MarkPointComponentOption;
} {
  if (!dataset.annotations || !enabled) return {};

  const markArea: MarkAreaComponentOption = {
    label: {
      position: 'insideTop',
    },
    z: markAreaZIndex ?? 1,
    data: dataset.annotations
      .filter((area) => area.type === 'area')
      .map((area) => {
        return [
          {
            z2: area.z_index ?? 1,
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
            z2: area.z_index ?? 1,
            xAxis: area.end,
            yAxis: area.y_end,
          },
        ];
      }),
  };
  const markLine: MarkLineComponentOption = {
    label: {
      position: 'middle',
    },
    symbol: ['none', 'none'],
    z: markAreaZIndex ?? 1,
    data: dataset.annotations
      .filter((line) => line.type === 'line')
      .map((line) => {
        return [
          {
            name: line.label,
            xAxis: line.start,
            yAxis: line.y_start,
            lineStyle: {
              color: line.color,
              width: line.width ?? 1,
              type: line.line_style ?? 'solid',
            },
            z2: line.z_index ?? 1,
          },
          {
            xAxis: line.end,
            yAxis: line.y_end,
            z2: line.z_index ?? 1,
          },
        ];
      }),
  };

  const markPoint: MarkPointComponentOption = {
    label: {
      position: 'top',
      show: true,
    },
    z: markAreaZIndex ? markAreaZIndex : 5,
    data: dataset.annotations
      .filter((point) => point.type === 'point')
      .map((point) => {
        return {
          name: point.label ?? '',
          xAxis: point.x,
          yAxis: point.y,
          itemStyle: {
            color: point.color,
          },
          label: {
            formatter: '{b}',
          },
          symbolSize: point.size ?? 10,
          symbol: point.shape ?? 'circle',
          symbolRotate: point.rotate,
          z2: point.z_index ?? 1,
        };
      }),
  };
  return {
    markArea,
    markLine,
    markPoint,
  };
}

export function generateMarkAreaSeries(
  dataset: PairHistory,
  enabled: boolean,
  markAreaZIndex?: number | undefined,
): ScatterSeriesOption | undefined {
  if (!dataset.annotations || !enabled) {
    return undefined;
  }
  // Invisible series added to chart to work around marklines bug
  // TODO: https://github.com/apache/echarts/issues/21300
  return {
    // Invisible
    type: 'scatter',
    symbol: 'none',
    xAxisIndex: 0,
    ...generateMarkArea(dataset, enabled, markAreaZIndex),
  };
}
