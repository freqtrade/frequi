<template>
  <div class="container-fluid">
    <div class="row ml-1">
      <div class="col-mb-12">
        <TimeRangeSelect v-model="timerange"></TimeRangeSelect>
      </div>
      <div class="col-mb-12">
        <b-form-group
          label="Strategy"
          label-for="strategyName"
          invalid-feedback="Strategy is required"
        >
          <b-form-input id="strategyName" v-model="strategy"></b-form-input>
        </b-form-group>
      </div>
    </div>
    <div class="row">
      <b-button variant="primary" :disabled="backtestRunning" @click="clickBacktest">
        Start backtest
      </b-button>
      <b-button variant="primary" :disabled="backtestRunning" @click="pollBacktest">
        Load backtest result
      </b-button>
    </div>
    <div v-if="hasBacktestResult" class="text-center w-100 mt-5">
      <BacktestResultView
        :strategy="strategy"
        :backtest-result="backtestResult.strategy ? backtestResult.strategy[strategy] : {}"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import TimeRangeSelect from '@/components/ftbot/TimeRangeSelect.vue';
import BacktestResultView from '@/components/ftbot/BacktestResultView.vue';

import { BacktestPayload, BacktestResult } from '@/types';

const ftbot = namespace('ftbot');
@Component({
  components: { BacktestResultView, TimeRangeSelect },
})
export default class Backtesting extends Vue {
  pair = 'XRP/USDT';

  pollInterval: number | null = null;

  timeframe = '5m';

  strategy = 'BinHV45';

  timeframems = 300000;

  @ftbot.State backtestRunning!: boolean;

  @ftbot.State backtestResult!: BacktestResult;

  timerange = '';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action startBacktest!: (payload: BacktestPayload) => void;

  @ftbot.Action pollBacktest!: () => void;

  get hasBacktestResult() {
    return Object.keys(this.backtestResult).length !== 0;
  }

  clickBacktest() {
    console.log('Backtesting');
    const btPayload: BacktestPayload = {
      strategy: this.strategy,
      timerange: this.timerange,
    };
    this.startBacktest(btPayload);
  }

  @Watch('backtestRunning')
  backtestRunningChanged() {
    if (this.backtestRunning === true) {
      this.pollInterval = window.setInterval(this.pollBacktest, 1000);
    } else if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
</script>

<style scoped></style>
