<template>
  <div>
    <div class="mb-2">
      <label class="mr-auto h3">Daily Stats</label>
      <b-button class="float-right" size="sm" @click="getDaily">&#x21bb;</b-button>
    </div>
    <div>
      <v-chart v-if="dailyStats.data" :options="dailyChart" />
    </div>
    <div>
      <b-table class="table-sm" :items="dailyStats.data" :fields="daily_fields"> </b-table>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import ECharts from 'vue-echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';

// Define Column labels here to avoid typos
const CHART_ABS_PROFIT = 'Absolute profit';
const CHART_TRADE_COUNT = 'Trade Count';

export default {
  name: 'DailyStats',
  components: {
    'v-chart': ECharts,
  },
  computed: {
    ...mapState('ftbot', ['dailyStats']),
    dailyFields() {
      return [
        { key: 'date', label: 'Day' },
        { key: 'abs_profit', label: 'Profit' },
        { key: 'fiat_value', label: `In ${this.dailyStats.fiat_display_currency}` },
        { key: 'trade_count', label: 'Trades' },
      ];
    },
    dailyChart() {
      return {
        title: {
          text: 'Daily profit',
          show: true,
        },
        dataset: {
          dimensions: ['date', 'abs_profit', 'trade_count'],
          source: this.dailyStats.data,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        legend: {
          data: [CHART_ABS_PROFIT, CHART_TRADE_COUNT],
        },
        xAxis: {
          type: 'category',
          inverse: true,
        },
        yAxis: [
          {
            type: 'value',
            name: CHART_ABS_PROFIT,
            splitLine: {
              show: false,
            },
            nameRotate: 90,
            nameLocation: 'middle',
            nameGap: 30,
          },
          {
            type: 'value',
            name: CHART_TRADE_COUNT,
            nameRotate: 90,
            nameLocation: 'middle',
            nameGap: 30,
          },
        ],
        series: [
          {
            type: 'line',
            name: CHART_ABS_PROFIT,
            color: 'black',
          },
          {
            type: 'bar',
            name: CHART_TRADE_COUNT,
            color: 'rgba(150,150,150,0.3)',
            yAxisIndex: 1,
          },
        ],
      };
    },
  },
  methods: {
    ...mapActions('ftbot', ['getDaily']),
  },
  mounted() {
    this.getDaily();
  },
};
</script>
