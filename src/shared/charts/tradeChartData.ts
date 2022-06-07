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

// const ENTRY_SYMB =
//   'path://M 96.920023,248.24792 C 74.409147,245.6096 54.972446,237.00293 39.415102,222.78438 27.525775,211.91824 17.571276,195.77742 12.449526,179.06095 9.8121373,170.45294 9.5963048,168.418 9.5963048,152.15844 c 0,-16.27249 0.2143074,-18.28761 2.8589302,-26.90246 9.631709,-31.373646 33.948984,-55.690923 65.322643,-65.322638 8.614883,-2.644775 10.629958,-2.858926 26.902492,-2.858926 16.27301,0 18.28734,0.213919 26.90246,2.859131 55.56596,17.060115 83.67714,76.370143 61.58713,129.938923 -9.0577,21.96514 -29.56621,42.33489 -51.66325,51.31375 -12.56874,5.10712 -33.27802,8.38709 -44.586687,7.0617 z m 31.923157,-26.7653 c 14.88505,-5.04558 28.19186,-15.31305 36.80193,-28.39624 17.22581,-26.17514 16.05632,-60.5473 -2.9131,-85.61732 C 140.19216,77.680338 95.838827,70.239217 64.562505,90.999277 45.003439,103.9818 33.274217,124.54541 32.014615,148.06193 30.11819,183.46789 52.023609,213.96148 85.932,223.11808 c 11.386095,3.07468 31.24887,2.31764 42.91118,-1.63546 z M 76.743219,164.05771 48.820339,136.12044 h 17.603356 17.603316 l 9.788879,9.82975 c 5.383886,5.40637 10.25539,9.82974 10.82553,9.82974 0.57015,0 5.48842,-4.43507 10.92948,-9.85572 l 9.89287,-9.85574 17.2959,0.2847 17.29584,0.28469 -27.69468,27.67857 -27.69473,27.67862 z';
// const EXIT_SYMB =
//   'path://M 96.920023,248.24792 C 74.409147,245.6096 54.972446,237.00293 39.415102,222.78438 27.525775,211.91824 17.571276,195.77742 12.449526,179.06095 9.8121373,170.45294 9.5963048,168.418 9.5963048,152.15844 c 0,-16.27249 0.2143074,-18.28761 2.8589302,-26.90246 9.631709,-31.373646 33.948984,-55.690923 65.322643,-65.322638 8.614883,-2.644775 10.629958,-2.858926 26.902492,-2.858926 16.27301,0 18.28734,0.213919 26.90246,2.859131 55.56596,17.060115 83.67714,76.370143 61.58713,129.938923 -9.0577,21.96514 -29.56621,42.33489 -51.66325,51.31375 -12.56874,5.10712 -33.27802,8.38709 -44.586687,7.0617 z m 31.923157,-26.7653 c 14.88505,-5.04558 28.19186,-15.31305 36.80193,-28.39624 17.22581,-26.17514 16.05632,-60.5473 -2.9131,-85.61732 C 140.19216,77.680338 95.838827,70.239217 64.562505,90.999277 45.003439,103.9818 33.274217,124.54541 32.014615,148.06193 30.11819,183.46789 52.023609,213.96148 85.932,223.11808 c 11.386095,3.07468 31.24887,2.31764 42.91118,-1.63546 z M 76.743219,164.05771 48.820339,136.12044 h 17.603356 17.603316 l 9.788879,9.82975 c 5.383886,5.40637 10.25539,9.82974 10.82553,9.82974 0.57015,0 5.48842,-4.43507 10.92948,-9.85572 l 9.89287,-9.85574 17.2959,0.2847 17.29584,0.28469 -27.69468,27.67857 -27.69473,27.67862 z';

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
