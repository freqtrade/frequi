<template>
  <div class="container-fluid">
    <div class="row mb-2">
      <TimeRangeSelect v-model="timerange"></TimeRangeSelect>
    </div>
    <b-button variant="primary" :disabled="backtestRunning" @click="clickBacktest">
      Start backtest
    </b-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import CandleChart from '@/components/charts/CandleChart.vue';
import PlotConfigurator from '@/components/charts/PlotConfigurator.vue';
import TimeRangeSelect from '@/components/ftbot/TimeRangeSelect.vue';
import { BacktestPayload } from '@/types';

const ftbot = namespace('ftbot');
@Component({
  components: { CandleChart, PlotConfigurator, TimeRangeSelect },
})
export default class Graphs extends Vue {
  pair = 'XRP/USDT';

  pollInterval: NodeJS.Timer | null = null;

  timeframe = '5m';

  timeframems = 300000;

  @ftbot.State backtestRunning!: boolean;

  timerange = '';

  @ftbot.Action
  startBacktest!: (payload: BacktestPayload) => void;

  @ftbot.Action pollBacktest!: () => void;

  clickBacktest() {
    console.log('Backtesting');
    const btPayload: BacktestPayload = {
      strategy: 'BinHV45',
      timerange: this.timerange,
    };
    this.startBacktest(btPayload);
  }

  @Watch('backtestRunning')
  backtestRunningChanged() {
    if (this.backtestRunning === true) {
      this.pollInterval = setInterval(this.pollBacktest, 5000);
    } else if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
</script>

<style scoped></style>
