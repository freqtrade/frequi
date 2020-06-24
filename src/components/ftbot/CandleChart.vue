<template>
  <div class="container-fluid d-flex flex-column align-items-stretch d-flex">
    <div class="row flex-grow-1 chart-wrapper">
      <v-chart v-if="hasData" theme="dark" autoresize :options="chartOptions" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import ECharts from 'vue-echarts';
import { timestampms } from '../../shared/formatters';
import { PlotConfig } from '../../store/types';
import randomColor from '../../shared/randomColor';
import 'echarts';

// Chart default options
const MARGINLEFT = '5%';
const MARGINRIGHT = '4%';
const upColor = '#00da3c';
const upBorderColor = '#008F28';
const downColor = '#ec0000';
const downBorderColor = '#8A0000';

@Component({
  components: { 'v-chart': ECharts },
})
export default class CandleChart extends Vue {
  @Prop({ required: true }) readonly pair: string = '';

  @Prop({ required: true }) readonly timeframe: string = '';

  @Prop({ required: true }) readonly dataset: Record<string, any> = {};

  @Prop({ required: false }) readonly plotConfig!: PlotConfig;

  // Only recalculate buy / sell data if necessary
  signalsCalculated = false;

  buyData = [] as Array<number>[];

  sellData = [] as Array<number>[];

  get hasData() {
    return this.dataset !== null && typeof this.dataset === 'object';
  }

  get chartOptions() {
    if (!this.hasData) {
      return {};
    }

    console.log(`Available Columns: ${this.dataset.columns}`);
    // Find default columns (sequence might be different, depending on the strategy)
    const colDate = this.dataset.columns.findIndex((el) => el === 'date');
    const colOpen = this.dataset.columns.findIndex((el) => el === 'open');
    const colHigh = this.dataset.columns.findIndex((el) => el === 'high');
    const colLow = this.dataset.columns.findIndex((el) => el === 'low');
    const colClose = this.dataset.columns.findIndex((el) => el === 'close');
    const colVolume = this.dataset.columns.findIndex((el) => el === 'volume');
    const colBuy = this.dataset.columns.findIndex((el) => el === 'buy');
    const colSell = this.dataset.columns.findIndex((el) => el === 'sell');
    // Plot data

    this.createSignalData(colDate, colOpen, colBuy, colSell);

    // This will be merged into final plot config
    const subPlots = {
      legend: [] as string[],
      grid: [] as object[],
      yaxis: [] as object[],
      xaxis: [] as object[],
      xaxisIndex: [] as number[],
      series: [] as object[],
    };

    if ('main_plot' in this.plotConfig) {
      Object.entries(this.plotConfig.main_plot).forEach(([key, value]) => {
        const col = this.dataset.columns.findIndex((el) => el === key);
        subPlots.legend.push(key);
        const sp = {
          name: key,
          type: 'line',
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
        subPlots.series.push(sp);
      });
    }

    if ('subplots' in this.plotConfig) {
      let plotIndex = 2;
      Object.entries(this.plotConfig.subplots).forEach(([key, value]) => {
        // define yaxis
        subPlots.yaxis.push({
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
        subPlots.xaxis.push({
          scale: true,
          gridIndex: plotIndex,
          boundaryGap: false,
          axisLine: { onZero: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          splitNumber: 20,
        });
        subPlots.xaxisIndex.push(plotIndex);
        subPlots.grid.push({
          left: MARGINLEFT,
          right: MARGINRIGHT,
          bottom: `${(plotIndex - 1) * 50}px`,
          height: '8%',
        });
        Object.entries(value).forEach(([sk, sv]) => {
          subPlots.legend.push(sk);
          // entries per subplot
          const col = this.dataset.columns.findIndex((el) => el === sk);
          if (col) {
            const sp = {
              name: sk,
              type: 'line',
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
            subPlots.series.push(sp);
            console.log(subPlots);
          } else {
            console.log(`element ${sk} was not found in the columns.`);
          }
        });

        plotIndex += 1;
      });
    }

    // console.log(this.dataset.data);
    // TODO: Rebuilding this causes a full redraw for every new step
    return {
      title: {
        text: `${this.pair} - ${this.timeframe}`,
        show: true,
      },
      backgroundColor: '#231202D',
      dataset: {
        source: this.dataset.data,
      },
      animation: false,
      legend: {
        data: ['Candles', 'Volume', 'Buy', 'Sell', ...subPlots.legend],
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          lineStyle: {
            color: '#cccccc',
            width: 1,
            opacity: 1,
          },
        },
      },
      axisPointer: {
        link: { xAxisIndex: 'all' },
        label: {
          backgroundColor: '#777',
        },
      },
      xAxis: [
        {
          type: 'category',
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax',
          axisLabel: {
            formatter: (value) => {
              return timestampms(value);
            },
          },
        },
        {
          type: 'category',
          gridIndex: 1,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax',
        },
        ...subPlots.xaxis,
      ],
      yAxis: [
        {
          scale: true,
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
        },
        ...subPlots.yaxis,
      ],
      grid: [
        {
          left: MARGINLEFT,
          right: MARGINRIGHT,
          height: '60%',
          // top: '0px',
          // bottom: '150px',
        },
        {
          // Volume
          left: MARGINLEFT,
          right: MARGINRIGHT,
          bottom: '20%',
          height: '80px',
        },
        ...subPlots.grid,
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1, ...subPlots.xaxisIndex],
          start: 50,
          end: 100,
        },
        {
          show: true,
          xAxisIndex: [0, 1, ...subPlots.xaxisIndex],
          type: 'slider',
          bottom: 10,
          start: 10,
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
      series: [
        {
          name: 'Candles',
          type: 'candlestick',
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: upBorderColor,
            borderColor0: downBorderColor,
          },
          encode: {
            x: 0,
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
            x: 0,
            y: colVolume,
          },
        },
        {
          name: 'Buy',
          type: 'scatter',
          symbol: 'triangle',
          data: this.buyData,
          xAxisIndex: 0,
          yAxisIndex: 0,
          itemStyle: {
            color: '#00FF00',
          },
          encode: {
            x: 0,
            y: 1,
          },
        },
        {
          name: 'Sell',
          type: 'scatter',
          data: this.sellData,
          symbol: 'diamond',
          xAxisIndex: 0,
          yAxisIndex: 0,
          itemStyle: {
            color: '#FF0000',
          },
          encode: {
            x: 0,
            y: 1,
          },
        },
        ...subPlots.series,
      ],
    };
  }

  createSignalData(colDate: string, colOpen: string, colBuy: string, colSell: string): void {
    // Calculate Buy and sell Series
    if (!this.signalsCalculated) {
      // Generate Buy and sell array (using open rate to display marker)
      for (let i = 0, len = this.dataset.data.length; i < len; i += 1) {
        if (this.dataset.data[i][colBuy] === 1) {
          this.buyData.push([this.dataset.data[i][colDate], this.dataset.data[i][colOpen]]);
        }
        if (this.dataset.data[i][colSell] === 1) {
          this.sellData.push([this.dataset.data[i][colDate], this.dataset.data[i][colOpen]]);
        }
      }
      this.signalsCalculated = true;
    }
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
  min-height: 820px;
  /* TODO: height calculation is not working correctly - uses min-height for now */
  /* height: 600px; */
  height: 100%;
}
</style>
