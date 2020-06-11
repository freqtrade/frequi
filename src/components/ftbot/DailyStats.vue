<template>
  <div>
    <div class="mb-2">
      <label class="mr-auto h3">Daily Stats</label>
      <b-button class="float-right" size="sm" @click="getDaily">&#x21bb;</b-button>
    </div>
    <div>
      <v-chart :options="dailyChart" />
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
        xAxis: {
          type: 'category',
          inverse: true,
        },
        yAxis: [
          {
            type: 'value',
            name: 'Absolute Profit',
            splitLine: {
              show: false,
            },
            nameRotate: 90,
            nameLocation: 'middle',
            nameGap: 30,
          },
          {
            type: 'value',
            name: 'Trade count',
            nameRotate: 90,
            nameLocation: 'middle',
            nameGap: 30,
          },
        ],
        series: [
          {
            type: 'line',
            name: 'Absolute profit',
          },
          {
            type: 'bar',
            name: 'trade_count',
            yAxisIndex: 1,
          },
        ],
      };
    },
  },
  methods: {
    ...mapActions('ftbot', ['getDaily']),
    dailyChartData() {
      const arr = this.dailyStats.data.map((itm) => {
        return { name: itm.date, value: Number(itm.abs_profit) + 2 };
      });
      console.log(arr);
      return arr;
    },
  },
  mounted() {
    this.getDaily();
  },
};
</script>
