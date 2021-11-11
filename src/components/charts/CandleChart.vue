<template>
  <div class="row flex-grow-1 chart-wrapper">
    <v-chart v-if="hasData" ref="candleChart" :theme="theme" autoresize manual-update />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Trade, PairHistory, PlotConfig } from '@/types';
import randomColor from '@/shared/randomColor';
import { roundTimeframe } from '@/shared/timemath';
import ECharts from 'vue-echarts';

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
const MARGINLEFT = '4%';
const MARGINRIGHT = '1%';

// Binance colors
const upColor = '#26A69A';
const upBorderColor = '#26A69A';
const downColor = '#EF5350';
const downBorderColor = '#EF5350';

const buySignalColor = '#00ff26';
const sellSignalColor = '#faba25';
const tradeBuyColor = 'cyan';
const tradeSellColor = 'pink';

@Component({
  components: { 'v-chart': ECharts },
})
export default class CandleChart extends Vue {
  $refs!: {
    candleChart: typeof ECharts;
  };

  @Prop({ required: false, default: [] }) readonly trades!: Array<Trade>;

  @Prop({ required: true }) readonly dataset!: PairHistory;

  @Prop({ default: true }) readonly useUTC!: boolean;

  @Prop({ required: true }) plotConfig!: PlotConfig;

  @Prop({ default: 'dark' }) theme!: string;

  buyData = [] as Array<number>[];

  sellData = [] as Array<number>[];

  chartOptions: EChartsOption = {};

  @Watch('dataset')
  datasetChanged() {
    this.updateChart();
  }

  @Watch('plotConfig')
  plotConfigChanged() {
    this.initializeChartOptions();
  }

  get strategy() {
    return this.dataset ? this.dataset.strategy : '';
  }

  get pair() {
    return this.dataset ? this.dataset.pair : '';
  }

  get timeframe() {
    return this.dataset ? this.dataset.timeframe : '';
  }

  get timeframems() {
    return this.dataset ? this.dataset.timeframe_ms : 0;
  }

  get datasetColumns() {
    return this.dataset ? this.dataset.columns : [];
  }

  get hasData() {
    return this.dataset !== null && typeof this.dataset === 'object';
  }

  get filteredTrades() {
    return this.trades.filter((item: Trade) => item.pair === this.pair);
  }

  mounted() {
    this.initializeChartOptions();
  }

  get chartTitle() {
    return `${this.strategy} - ${this.pair} - ${this.timeframe}`;
  }

  initializeChartOptions() {
    this.chartOptions = {
      title: [
        {
          // text: this.chartTitle,
          show: false,
        },
      ],
      backgroundColor: 'rgba(0, 0, 0, 0)',
      useUTC: this.useUTC,
      animation: false,
      legend: {
        // Initial legend, further entries are pushed to the below list
        data: ['Candles', 'Volume', 'Buy', 'Sell'],
        right: '1%',
      },
      tooltip: {
        show: true,
        trigger: 'axis',
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
          position: 'right',
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
    this.updateChart(true);
  }

  updateChart(initial = false) {
    if (!this.hasData) {
      return;
    }
    if (this.chartOptions?.title) {
      this.chartOptions.title[0].text = this.chartTitle;
    }
    const colDate = this.dataset.columns.findIndex((el) => el === '__date_ts');
    const colOpen = this.dataset.columns.findIndex((el) => el === 'open');
    const colHigh = this.dataset.columns.findIndex((el) => el === 'high');
    const colLow = this.dataset.columns.findIndex((el) => el === 'low');
    const colClose = this.dataset.columns.findIndex((el) => el === 'close');
    const colVolume = this.dataset.columns.findIndex((el) => el === 'volume');
    const colBuyData = this.dataset.columns.findIndex((el) => el === '_buy_signal_open');
    const colSellData = this.dataset.columns.findIndex((el) => el === '_sell_signal_open');
    const subplotCount =
      'subplots' in this.plotConfig ? Object.keys(this.plotConfig.subplots).length : 0;

    if (this.chartOptions?.dataZoom && Array.isArray(this.chartOptions?.dataZoom)) {
      // Only set zoom once ...
      if (initial) {
        const startingZoom = (1 - 250 / this.dataset.length) * 100;
        this.chartOptions.dataZoom.forEach((el, i) => {
          if (this.chartOptions && this.chartOptions.dataZoom) {
            this.chartOptions.dataZoom[i].start = startingZoom;
          }
        });
      } else {
        // Remove start/end settings after chart initialization to avoid chart resetting
        this.chartOptions.dataZoom.forEach((el, i) => {
          if (this.chartOptions && this.chartOptions.dataZoom) {
            delete this.chartOptions.dataZoom[i].start;
            delete this.chartOptions.dataZoom[i].end;
          }
        });
      }
    }

    const options: EChartsOption = {
      dataset: {
        source: this.dataset.data,
      },
      grid: [
        {
          left: MARGINLEFT,
          right: MARGINRIGHT,
          // Grid Layout from bottom to top
          bottom: `${subplotCount * 10 + 10}%`,
        },
        {
          // Volume
          left: MARGINLEFT,
          right: MARGINRIGHT,
          // Grid Layout from bottom to top
          bottom: `${subplotCount * 10 + 5}%`,
          height: '10%',
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
          name: 'Buy',
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
        {
          name: 'Sell',
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
        },
      ],
    };

    // Merge this into original data
    Object.assign(this.chartOptions, options);

    if ('main_plot' in this.plotConfig) {
      Object.entries(this.plotConfig.main_plot).forEach(([key, value]) => {
        const col = this.dataset.columns.findIndex((el) => el === key);
        if (col > 1) {
          if (!Array.isArray(this.chartOptions.legend) && this.chartOptions.legend?.data) {
            this.chartOptions.legend.data.push(key);
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
          if (Array.isArray(this.chartOptions.series)) {
            this.chartOptions.series.push(sp);
          }
        } else {
          console.log(`element ${key} for main plot not found in columns.`);
        }
      });
    }

    // START Subplots
    if ('subplots' in this.plotConfig) {
      let plotIndex = 2;
      Object.entries(this.plotConfig.subplots).forEach(([key, value]) => {
        // define yaxis
        console.log('subplot', key);
        if (Array.isArray(this.chartOptions.yAxis)) {
          this.chartOptions.yAxis.push({
            scale: true,
            gridIndex: plotIndex,
            name: key,
            nameLocation: 'middle',
            nameGap: 60,
            axisLabel: { show: true },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
          });
        }
        if (Array.isArray(this.chartOptions.xAxis)) {
          this.chartOptions.xAxis.push({
            type: 'time',
            scale: true,
            gridIndex: plotIndex,
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
        if (Array.isArray(this.chartOptions.dataZoom)) {
          this.chartOptions.dataZoom.forEach((el) =>
            el.xAxisIndex && Array.isArray(el.xAxisIndex) ? el.xAxisIndex.push(plotIndex) : null,
          );
        }
        if (this.chartOptions.grid && Array.isArray(this.chartOptions.grid)) {
          this.chartOptions.grid.push({
            left: MARGINLEFT,
            right: MARGINRIGHT,
            bottom: `${plotIndex * 8}%`,
            height: '8%',
          });
        }
        Object.entries(value).forEach(([sk, sv]) => {
          // entries per subplot
          const col = this.dataset.columns.findIndex((el) => el === sk);
          if (col > 0) {
            if (!Array.isArray(this.chartOptions.legend) && this.chartOptions.legend?.data) {
              this.chartOptions.legend.data.push(sk);
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
            if (this.chartOptions.series && Array.isArray(this.chartOptions.series)) {
              this.chartOptions.series.push(sp);
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
    if (this.chartOptions.grid && Array.isArray(this.chartOptions.grid)) {
      // Last subplot is bottom
      this.chartOptions.grid[this.chartOptions.grid.length - 1].bottom = '50px';
      delete this.chartOptions.grid[this.chartOptions.grid.length - 1].top;
    }
    const { trades, tradesClose } = this.getTradeEntries();

    const name = 'Trades';
    const nameClose = 'Trades Close';
    if (!Array.isArray(this.chartOptions.legend) && this.chartOptions.legend?.data) {
      this.chartOptions.legend.data.push(name);
    }
    const sp: ScatterSeriesOption = {
      name,
      type: 'scatter',
      xAxisIndex: 0,
      yAxisIndex: 0,
      itemStyle: {
        color: tradeBuyColor,
      },
      data: trades,
    };
    if (Array.isArray(this.chartOptions?.series)) {
      this.chartOptions.series.push(sp);
    }
    if (!Array.isArray(this.chartOptions.legend) && this.chartOptions.legend?.data) {
      this.chartOptions.legend.data.push(nameClose);
    }
    const closeSeries: ScatterSeriesOption = {
      name: nameClose,
      type: 'scatter',
      xAxisIndex: 0,
      yAxisIndex: 0,
      itemStyle: {
        color: tradeSellColor,
      },
      data: tradesClose,
    };
    if (this.chartOptions.series && Array.isArray(this.chartOptions.series)) {
      this.chartOptions.series.push(closeSeries);
    }

    console.log('chartOptions', this.chartOptions);

    this.$refs.candleChart.setOption(this.chartOptions);
  }

  /** Return trade entries for charting */
  getTradeEntries() {
    const trades: (string | number)[][] = [];
    const tradesClose: (string | number)[][] = [];
    for (let i = 0, len = this.filteredTrades.length; i < len; i += 1) {
      const trade: Trade = this.filteredTrades[i];
      if (
        trade.open_timestamp >= this.dataset.data_start_ts &&
        trade.open_timestamp <= this.dataset.data_stop_ts
      ) {
        trades.push([roundTimeframe(this.timeframems, trade.open_timestamp), trade.open_rate]);
      }
      if (
        trade.close_timestamp !== undefined &&
        trade.close_timestamp < this.dataset.data_stop_ts &&
        trade.close_timestamp > this.dataset.data_start_ts
      ) {
        if (trade.close_date !== undefined && trade.close_rate !== undefined) {
          tradesClose.push([
            roundTimeframe(this.timeframems, trade.close_timestamp),
            trade.close_rate,
          ]);
        }
      }
    }
    return { trades, tradesClose };
  }

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

  @Watch('useUTC')
  useUTCChanged() {
    this.initializeChartOptions();
  }
}
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
