<template>
  <div class="container-fluid d-flex flex-column align-items-stretch d-flex">
    <div class="row flex-grow-1 chart-wrapper">
      <v-chart v-if="hasData" theme="dark" autoresize :options="chartOptions" />
    </div>
  </div>
</template>

<script>
import ECharts from 'vue-echarts';
import 'echarts';
import { mapState } from 'vuex';

export default {
  name: 'CandleChart',
  components: { 'v-chart': ECharts },

  data() {
    return {
      pair: 'XRP/USDT',
      timeframe: '5m',
    };
  },
  computed: {
    ...mapState('ftbot', ['history']),
    hasData() {
      return this.dataset !== null;
    },
    dataset() {
      return this.history[`${this.pair}__${this.timeframe}`];
    },
    chartOptions() {
      if (!this.hasData) {
        return {};
      }
      const upColor = '#00da3c';
      const upBorderColor = '#008F28';
      const downColor = '#ec0000';
      const downBorderColor = '#8A0000';
      console.log(`Available Columns: ${this.dataset.columns}`);
      const colDate = this.dataset.columns.findIndex((el) => el === 'date');
      const colOpen = this.dataset.columns.findIndex((el) => el === 'open');
      const colHigh = this.dataset.columns.findIndex((el) => el === 'high');
      const colLow = this.dataset.columns.findIndex((el) => el === 'low');
      const colClose = this.dataset.columns.findIndex((el) => el === 'close');
      const colVolume = this.dataset.columns.findIndex((el) => el === 'volume');
      const colBuy = this.dataset.columns.findIndex((el) => el === 'buy');
      const colSell = this.dataset.columns.findIndex((el) => el === 'sell');
      const buyData = [];
      const sellData = [];
      // Generate Buy and sell array (using open rate to display marker)
      for (let i = 0, len = this.dataset.data.length; i < len; i += 1) {
        if (this.dataset.data[i][colBuy] === 1) {
          console.log(this.dataset.data[i][colBuy]);
          buyData.push([this.dataset.data[i][colDate], this.dataset.data[i][colOpen]]);
        }
        if (this.dataset.data[i][colSell] === 1) {
          sellData.push([this.dataset.data[i][colDate], this.dataset.data[i][colOpen]]);
        }
      }
      console.log(this.dataset.data);
      console.log('buy');
      console.log(buyData);
      console.log('sell');
      console.log(sellData);
      return {
        title: {
          text: `${this.pair} - ${this.timeframe}`,
          show: true,
        },
        backgroundColor: '231202D',
        dataset: {
          source: this.dataset.data,
        },
        animation: false,
        legend: {
          data: ['Candles', 'Volume', 'Buy', 'Sell'],
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
        ],
        grid: [
          {
            left: '5%',
            right: '5%',
            // height: '50%',
            bottom: '150px',
          },
          {
            left: '5%',
            right: '5%',
            bottom: '50px',
            height: '80px',
          },
        ],
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1],
            start: 50,
            end: 100,
          },
          {
            show: true,
            xAxisIndex: [0, 1],
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
            data: buyData,
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
            data: sellData,
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
        ],
      };
    },
  },
};
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
