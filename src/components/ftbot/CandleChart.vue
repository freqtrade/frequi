<template>
  <div class="container-fluid d-flex flex-column align-items-stretch d-flex">
    <div class="row flex-grow-1">
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
      const upColor = '#ec0000';
      const upBorderColor = '#8A0000';
      const downColor = '#00da3c';
      const downBorderColor = '#008F28';
      console.log(this.dataset.data);
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
          data: ['Candles', 'Volume'],
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            lineStyle: {
              color: '#376df4',
              width: 2,
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
            // inverse: true,
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
            height: '50%',
          },
          {
            left: '5%',
            right: '5%',
            top: '63%',
            height: '16%',
          },
        ],
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1],
            start: 10,
            end: 100,
          },
          {
            show: true,
            xAxisIndex: [0, 1],
            type: 'slider',
            bottom: 10,
            start: 10,
            end: 100,
            handleIcon:
              'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '105%',
          },
        ],
        // visualMap: {
        //   show: true,
        //   seriesIndex: 2,
        //   dimension: 1,
        //   pieces: [
        //     {
        //       value: 1,
        //       color: downColor,
        //     },
        //     {
        //       value: -1,
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
              y: [1, 4, 3, 2],
            },
          },
          {
            name: 'Volume',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            // itemStyle: {
            //   color: '#7fbe9e',
            // },
            large: true,
            encode: {
              x: 0,
              y: 5,
            },
          },
        ],
      };
    },
  },
};
</script>

<style scoped>
.echarts {
  width: 100%;
  min-height: 640px;
  /* TODO: height calculation is not working correctly - uses min-height for now */
  /* height: 600px; */
  height: 100%;
}
</style>
