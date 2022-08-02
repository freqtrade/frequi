<template>
  <div class="row flex-grow-1 chart-wrapper">
    <v-chart v-if="hasData" ref="candleChart" :theme="theme" autoresize manual-update />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { Trade, PairHistory, PlotConfig, ChartSliderPosition } from '@/types';
import randomColor from '@/shared/randomColor';
import heikinashi from '@/shared/heikinashi';
import { getTradeEntries } from '@/shared/charts/tradeChartData';
import ECharts from 'vue-echarts';
import { format } from 'date-fns-tz';

import { use } from 'echarts/core';
import { EChartsOption, SeriesOption, ScatterSeriesOption } from 'echarts';
import { CanvasRenderer } from 'echarts/renderers';
import { CandlestickChart, LineChart, BarChart, ScatterChart } from 'echarts/charts';
import {
  AxisPointerComponent,
  CalendarComponent,
  DatasetComponent,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TimelineComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent,
  VisualMapPiecewiseComponent,
} from 'echarts/components';

use([
  AxisPointerComponent,
  CalendarComponent,
  DatasetComponent,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TimelineComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent,
  VisualMapPiecewiseComponent,

  CandlestickChart,
  BarChart,
  LineChart,
  ScatterChart,
  CanvasRenderer,
]);

// Chart default options
const MARGINLEFT = '5.5%';
const MARGINRIGHT = '1%';
const NAMEGAP = 55;
const SUBPLOTHEIGHT = 8; // Value in %

// Binance colors
const upColor = '#26A69A';
const upBorderColor = '#26A69A';
const downColor = '#EF5350';
const downBorderColor = '#EF5350';

const buySignalColor = '#00ff26';
const shortEntrySignalColor = '#00ff26';
const sellSignalColor = '#faba25';
const shortexitSignalColor = '#faba25';

export default defineComponent({
  name: 'CandleChart',
  components: { 'v-chart': ECharts },
  props: {
    trades: { required: false, default: () => [], type: Array as () => Trade[] },
    dataset: { required: true, type: Object as () => PairHistory },
    heikinAshi: { required: false, default: false, type: Boolean },
    useUTC: { required: false, default: true, type: Boolean },
    plotConfig: { required: true, type: Object as () => PlotConfig },
    theme: { default: 'dark', type: String },
    sliderPosition: {
      required: false,
      type: Object as () => ChartSliderPosition,
      default: () => undefined,
    },
  },
  setup(props) {
    const candleChart = ref<typeof ECharts>();
    const buyData = ref<number[][]>([]);
    const sellData = ref<number[][]>([]);
    const chartOptions = ref<EChartsOption>({});

    const strategy = computed(() => {
      return props.dataset ? props.dataset.strategy : '';
    });

    const pair = computed(() => {
      return props.dataset ? props.dataset.pair : '';
    });

    const timeframe = computed(() => {
      return props.dataset ? props.dataset.timeframe : '';
    });

    const datasetColumns = computed(() => {
      return props.dataset ? props.dataset.columns : [];
    });

    const hasData = computed(() => {
      return props.dataset !== null && typeof props.dataset === 'object';
    });

    const filteredTrades = computed(() => {
      return props.trades.filter((item: Trade) => item.pair === pair.value);
    });

    const chartTitle = computed(() => {
      return `${strategy.value} - ${pair.value} - ${timeframe.value}`;
    });

    const updateChart = (initial = false) => {
      if (!hasData.value) {
        return;
      }
      if (chartOptions.value?.title) {
        chartOptions.value.title[0].text = chartTitle.value;
      }
      const colDate = props.dataset.columns.findIndex((el) => el === '__date_ts');
      const colOpen = props.dataset.columns.findIndex((el) => el === 'open');
      const colHigh = props.dataset.columns.findIndex((el) => el === 'high');
      const colLow = props.dataset.columns.findIndex((el) => el === 'low');
      const colClose = props.dataset.columns.findIndex((el) => el === 'close');
      const colVolume = props.dataset.columns.findIndex((el) => el === 'volume');
      // TODO: Remove below *signal_open after December 2021
      const colBuyData = props.dataset.columns.findIndex(
        (el) =>
          el === '_buy_signal_open' ||
          el === '_buy_signal_close' ||
          el === '_enter_long_signal_close',
      );
      const colSellData = props.dataset.columns.findIndex(
        (el) =>
          el === '_sell_signal_open' ||
          el === '_sell_signal_close' ||
          el === '_exit_long_signal_close',
      );

      const colShortEntryData = props.dataset.columns.findIndex(
        (el) => el === '_enter_short_signal_close',
      );
      const colShortExitData = props.dataset.columns.findIndex(
        (el) => el === '_exit_short_signal_close',
      );

      const subplotCount =
        'subplots' in props.plotConfig ? Object.keys(props.plotConfig.subplots).length + 1 : 1;

      if (chartOptions.value?.dataZoom && Array.isArray(chartOptions.value?.dataZoom)) {
        // Only set zoom once ...
        if (initial) {
          const startingZoom = (1 - 250 / props.dataset.length) * 100;
          chartOptions.value.dataZoom.forEach((el, i) => {
            if (chartOptions.value && chartOptions.value.dataZoom) {
              chartOptions.value.dataZoom[i].start = startingZoom;
            }
          });
        } else {
          // Remove start/end settings after chart initialization to avoid chart resetting
          chartOptions.value.dataZoom.forEach((el, i) => {
            if (chartOptions.value && chartOptions.value.dataZoom) {
              delete chartOptions.value.dataZoom[i].start;
              delete chartOptions.value.dataZoom[i].end;
            }
          });
        }
      }
      const dataset = props.heikinAshi
        ? heikinashi(datasetColumns.value, props.dataset.data)
        : props.dataset.data.slice();
      // Add new rows to end to allow slight "scroll past"
      const newArray = Array(dataset[dataset.length - 2].length);
      newArray[colDate] = dataset[dataset.length - 1][colDate] + props.dataset.timeframe_ms * 3;
      dataset.push(newArray);
      const options: EChartsOption = {
        dataset: {
          source: dataset,
        },
        grid: [
          {
            left: MARGINLEFT,
            right: MARGINRIGHT,
            // Grid Layout from bottom to top
            bottom: `${subplotCount * SUBPLOTHEIGHT + 2}%`,
          },
          {
            // Volume
            left: MARGINLEFT,
            right: MARGINRIGHT,
            // Grid Layout from bottom to top
            bottom: `${subplotCount * SUBPLOTHEIGHT}%`,
            height: `${SUBPLOTHEIGHT}%`,
          },
        ],

        series: [
          {
            name: 'Candles',
            type: 'candlestick',
            barWidth: '80%',
            itemStyle: {
              color: upColor,
              color0: downColor,
              borderColor: upBorderColor,
              borderColor0: downBorderColor,
            },
            encode: {
              x: colDate,
              // open, close, low, high
              y: [colOpen, colClose, colLow, colHigh],
            },
          },
          {
            name: 'Volume',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            itemStyle: {
              color: '#777777',
            },
            large: true,
            encode: {
              x: colDate,
              y: colVolume,
            },
          },
          {
            name: 'Entry',
            type: 'scatter',
            symbol: 'triangle',
            symbolSize: 10,
            xAxisIndex: 0,
            yAxisIndex: 0,
            itemStyle: {
              color: buySignalColor,
            },
            encode: {
              x: colDate,
              y: colBuyData,
            },
          },
        ],
      };

      if (colSellData >= 0) {
        // if (!Array.isArray(chartOptions.value?.legend) && chartOptions.value?.legend?.data) {
        //   chartOptions.value.legend.data.push('Long exit');
        // }
        if (Array.isArray(options.series)) {
          options.series.push({
            name: 'Exit',
            type: 'scatter',
            symbol: 'diamond',
            symbolSize: 8,
            xAxisIndex: 0,
            yAxisIndex: 0,
            itemStyle: {
              color: sellSignalColor,
            },
            encode: {
              x: colDate,
              y: colSellData,
            },
          });
        }
      }

      if (Array.isArray(options.series)) {
        if (colShortEntryData >= 0) {
          options.series.push({
            // Short entry
            name: 'Entry',
            type: 'scatter',
            symbol: 'triangle',
            symbolRotate: 180,
            symbolSize: 10,
            xAxisIndex: 0,
            yAxisIndex: 0,
            itemStyle: {
              color: shortEntrySignalColor,
            },
            tooltip: {
              // Hide tooltip - it's already there for longs.
              // show: false,
            },
            encode: {
              x: colDate,
              y: colShortEntryData,
            },
          });
        }
        if (colShortExitData >= 0) {
          options.series.push({
            // Short exit
            name: 'Exit',
            type: 'scatter',
            symbol: 'pin',
            symbolSize: 8,
            xAxisIndex: 0,
            yAxisIndex: 0,
            itemStyle: {
              color: shortexitSignalColor,
            },
            tooltip: {
              // Hide tooltip - it's already there for longs.
              // show: false,
            },
            encode: {
              x: colDate,
              y: colShortExitData,
            },
          });
        }
      }

      // Merge this into original data
      Object.assign(chartOptions.value, options);

      if ('main_plot' in props.plotConfig) {
        Object.entries(props.plotConfig.main_plot).forEach(([key, value]) => {
          const col = props.dataset.columns.findIndex((el) => el === key);
          if (col > 1) {
            if (!Array.isArray(chartOptions.value?.legend) && chartOptions.value?.legend?.data) {
              chartOptions.value.legend.data.push(key);
            }
            const sp: SeriesOption = {
              name: key,
              type: value.type || 'line',
              xAxisIndex: 0,
              yAxisIndex: 0,
              itemStyle: {
                color: value.color,
              },
              encode: {
                x: colDate,
                y: col,
              },
              showSymbol: false,
            };
            if (Array.isArray(chartOptions.value?.series)) {
              chartOptions.value?.series.push(sp);
            }
          } else {
            console.log(`element ${key} for main plot not found in columns.`);
          }
        });
      }

      // START Subplots
      if ('subplots' in props.plotConfig) {
        let plotIndex = 2;
        Object.entries(props.plotConfig.subplots).forEach(([key, value]) => {
          // define yaxis

          // Subplots are added from bottom to top - only the "bottom-most" plot stays at the bottom.
          // const currGridIdx = totalSubplots - plotIndex > 1 ? totalSubplots - plotIndex : plotIndex;
          const currGridIdx = plotIndex;
          if (
            Array.isArray(chartOptions.value.yAxis) &&
            chartOptions.value.yAxis.length <= plotIndex
          ) {
            chartOptions.value.yAxis.push({
              scale: true,
              gridIndex: currGridIdx,
              name: key,
              nameLocation: 'middle',
              nameGap: NAMEGAP,
              axisLabel: { show: true },
              axisLine: { show: false },
              axisTick: { show: false },
              splitLine: { show: false },
            });
          }
          if (
            Array.isArray(chartOptions.value.xAxis) &&
            chartOptions.value.xAxis.length <= plotIndex
          ) {
            chartOptions.value.xAxis.push({
              type: 'time',
              scale: true,
              gridIndex: currGridIdx,
              boundaryGap: false,
              axisLine: { onZero: false },
              axisTick: { show: false },
              axisLabel: { show: false },
              axisPointer: {
                label: { show: false },
              },
              splitLine: { show: false },
              splitNumber: 20,
            });
          }
          if (Array.isArray(chartOptions.value.dataZoom)) {
            chartOptions.value.dataZoom.forEach((el) =>
              el.xAxisIndex && Array.isArray(el.xAxisIndex) ? el.xAxisIndex.push(plotIndex) : null,
            );
          }
          if (chartOptions.value.grid && Array.isArray(chartOptions.value.grid)) {
            chartOptions.value.grid.push({
              left: MARGINLEFT,
              right: MARGINRIGHT,
              bottom: `${(subplotCount - plotIndex + 1) * SUBPLOTHEIGHT}%`,
              height: `${SUBPLOTHEIGHT}%`,
            });
          }
          Object.entries(value).forEach(([sk, sv]) => {
            // entries per subplot
            const col = props.dataset.columns.findIndex((el) => el === sk);
            if (col > 0) {
              if (!Array.isArray(chartOptions.value.legend) && chartOptions.value.legend?.data) {
                chartOptions.value.legend.data.push(sk);
              }
              const sp: SeriesOption = {
                name: sk,
                type: sv.type || 'line',
                xAxisIndex: plotIndex,
                yAxisIndex: plotIndex,
                itemStyle: {
                  color: sv.color || randomColor(),
                },
                encode: {
                  x: colDate,
                  y: col,
                },
                showSymbol: false,
              };
              if (chartOptions.value.series && Array.isArray(chartOptions.value.series)) {
                chartOptions.value.series.push(sp);
              }
            } else {
              console.log(`element ${sk} was not found in the columns.`);
            }
          });

          plotIndex += 1;
        });
      }
      // END Subplots
      // Last subplot should show xAxis labels
      // if (options.xAxis && Array.isArray(options.xAxis)) {
      //   options.xAxis[options.xAxis.length - 1].axisLabel.show = true;
      //   options.xAxis[options.xAxis.length - 1].axisTick.show = true;
      // }
      if (chartOptions.value.grid && Array.isArray(chartOptions.value.grid)) {
        // Last subplot is bottom
        chartOptions.value.grid[chartOptions.value.grid.length - 1].bottom = '50px';
        delete chartOptions.value.grid[chartOptions.value.grid.length - 1].top;
      }
      const { tradeData } = getTradeEntries(props.dataset, filteredTrades.value);

      const nameTrades = 'Trades';
      if (!Array.isArray(chartOptions.value.legend) && chartOptions.value.legend?.data) {
        chartOptions.value.legend.data.push(nameTrades);
      }
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
          backgroundColor: props.theme !== 'dark' ? '#fff' : '#000',
          padding: 2,
          color: props.theme === 'dark' ? '#fff' : '#000',
        },
        labelLayout: { rotate: 75, align: 'left', dx: 10 },
        itemStyle: {
          // color: tradeSellColor,
          color: (v) => v.data[4],
        },
        symbol: (v) => v[2],
        symbolRotate: (v) => v[3],
        symbolSize: 13,
        data: tradeData,
      };
      if (chartOptions.value.series && Array.isArray(chartOptions.value.series)) {
        chartOptions.value.series.push(tradesSeries);
      }

      console.log('chartOptions', chartOptions.value);

      candleChart.value.setOption(chartOptions.value);
    };

    const initializeChartOptions = () => {
      chartOptions.value = {
        title: [
          {
            // text: this.chartTitle,
            show: false,
          },
        ],
        backgroundColor: 'rgba(0, 0, 0, 0)',
        useUTC: props.useUTC,
        animation: false,
        legend: {
          // Initial legend, further entries are pushed to the below list
          data: ['Candles', 'Volume', 'Entry', 'Exit'],
          right: '1%',
        },
        tooltip: {
          show: true,
          trigger: 'axis',
          renderMode: 'richText',
          backgroundColor: 'rgba(80,80,80,0.7)',
          borderWidth: 0,
          textStyle: {
            color: '#fff',
          },
          axisPointer: {
            type: 'cross',
            lineStyle: {
              color: '#cccccc',
              width: 1,
              opacity: 1,
            },
          },
          // positioning copied from https://echarts.apache.org/en/option.html#tooltip.position
          position(pos, params, dom, rect, size) {
            // tooltip will be fixed on the right if mouse hovering on the left,
            // and on the left if hovering on the right.
            const obj = { top: 60 };
            obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
            return obj;
          },
        },
        axisPointer: {
          link: [{ xAxisIndex: 'all' }],
          label: {
            backgroundColor: '#777',
          },
        },
        xAxis: [
          {
            type: 'time',
            scale: true,
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: true },
            axisLabel: { show: true },
            axisPointer: {
              label: { show: false },
            },
            position: 'top',
            splitLine: { show: false },
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax',
          },
          {
            type: 'time',
            gridIndex: 1,
            scale: true,
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            axisLabel: { show: false },
            axisPointer: {
              label: { show: false },
            },
            splitLine: { show: false },
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax',
          },
        ],
        yAxis: [
          {
            scale: true,
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            name: 'volume',
            nameLocation: 'middle',
            // position: 'right',
            nameGap: NAMEGAP,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
          },
        ],
        dataZoom: [
          // Start values are recalculated once the data is known
          {
            type: 'inside',
            xAxisIndex: [0, 1],
            start: 80,
            end: 100,
          },
          {
            show: true,
            xAxisIndex: [0, 1],
            type: 'slider',
            bottom: 10,
            start: 80,
            end: 100,
          },
        ],
        // visualMap: {
        //   //  TODO: this would allow to colorize volume bars (if we'd want this)
        //   //  Needs green / red indicator column in data.
        //   show: true,
        //   seriesIndex: 1,
        //   dimension: 5,
        //   pieces: [
        //     {
        //       max: 500000.0,
        //       color: downColor,
        //     },
        //     {
        //       min: 500000.0,
        //       color: upColor,
        //     },
        //   ],
        // },
      };

      console.log('Initialized');
      updateChart(true);
    };

    const updateSliderPosition = () => {
      if (!props.sliderPosition) return;

      const start = format(
        props.sliderPosition.startValue - props.dataset.timeframe_ms * 40,
        'yyyy-MM-dd HH:mm:ss',
      );
      const end = format(
        props.sliderPosition.endValue
          ? props.sliderPosition.endValue + props.dataset.timeframe_ms * 40
          : props.sliderPosition.startValue + props.dataset.timeframe_ms * 80,
        'yyyy-MM-dd HH:mm:ss',
      );

      candleChart.value.dispatchAction({
        type: 'dataZoom',
        dataZoomIndex: 0,
        startValue: start,
        endValue: end,
      });
    };

    // createSignalData(colDate: number, colOpen: number, colBuy: number, colSell: number): void {
    // Calculate Buy and sell Series
    // if (!this.signalsCalculated) {
    //   // Generate Buy and sell array (using open rate to display marker)
    //   for (let i = 0, len = this.dataset.data.length; i < len; i += 1) {
    //     if (this.dataset.data[i][colBuy] === 1) {
    //       this.buyData.push([this.dataset.data[i][colDate], this.dataset.data[i][colOpen]]);
    //     }
    //     if (this.dataset.data[i][colSell] === 1) {
    //       this.sellData.push([this.dataset.data[i][colDate], this.dataset.data[i][colOpen]]);
    //     }
    //   }
    //   this.signalsCalculated = true;
    // }
    // }
    onMounted(() => {
      initializeChartOptions();
    });

    watch(
      () => props.useUTC,
      () => initializeChartOptions(),
    );

    watch(
      () => props.dataset,
      () => updateChart(),
    );

    watch(
      () => props.plotConfig,
      () => initializeChartOptions(),
    );

    watch(
      () => props.heikinAshi,
      () => updateChart(),
    );

    watch(
      () => props.sliderPosition,
      () => updateSliderPosition(),
    );

    return {
      candleChart,
      buyData,
      sellData,
      chartOptions,
      strategy,
      pair,
      timeframe,
      datasetColumns,
      hasData,
      filteredTrades,
      chartTitle,
    };
  },
});
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
}
.echarts {
  width: 100%;
  min-height: 200px;
  /* TODO: height calculation is not working correctly - uses min-height for now */
  /* height: 600px; */
  height: 100%;
}
</style>
