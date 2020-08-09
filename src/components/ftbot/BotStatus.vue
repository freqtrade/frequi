<template>
  <div>
    <p>
      Running Freqtrade <strong>{{ version }}</strong>
    </p>
    <p v-if="profit.profit_all_coin">
      Avg Profit {{ profit.profit_all_coin.toFixed(2) }}% in {{ profit.trade_count }} Trades, with
      an average duration of {{ profit.avg_duration }}. Best pair: {{ profit.best_pair }}.
    </p>
    <p v-if="profit.first_trade_timestamp">
      First trade opened:
      <strong>{{ formatTimestamp(profit.first_trade_timestamp) }}</strong> <br />
      Last trade opened:
      <strong>{{ formatTimestamp(profit.latest_trade_timestamp) }}</strong>
    </p>

    <p>
      Running with
      <strong>
        {{ botState.max_open_trades }}x{{ botState.stake_amount }} {{ botState.stake_currency }}
      </strong>
      on
      <strong>{{ botState.exchange }}</strong
      >, with Strategy <strong>{{ botState.strategy }}</strong>
    </p>
    <p>
      Currently <strong>{{ botState.state }}</strong
      >, <strong>forcebuy: {{ botState.forcebuy_enabled }}</strong>
    </p>
    <p>
      <strong>{{ botState.dry_run ? 'Dry-Run' : 'Live' }}</strong>
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { BotState } from '@/store/types';

const ftbot = namespace('ftbot');

@Component({})
export default class BotStatus extends Vue {
  @ftbot.State version;

  @ftbot.State profit;

  @ftbot.State botState: BotState;

  formatTimestamp(timestamp) {
    return new Date(timestamp).toUTCString();
  }
}
</script>
