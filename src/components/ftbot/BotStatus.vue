<template>
  <div v-if="botState">
    <p>
      Running Freqtrade <strong>{{ version }}</strong>
    </p>
    <p>
      Avg Profit {{ formatPercent(profit.profit_all_ratio_mean) }} (&sum;
      {{ formatPercent(profit.profit_all_ratio_sum) }}) in {{ profit.trade_count }} Trades, with an
      average duration of {{ profit.avg_duration }}. Best pair: {{ profit.best_pair }}.
    </p>
    <p v-if="profit.first_trade_timestamp">
      First trade opened:

      <strong><DateTimeTZ :date="profit.first_trade_timestamp" show-timezone /></strong>
      <br />
      Last trade opened:
      <strong><DateTimeTZ :date="profit.latest_trade_timestamp" show-timezone /></strong>
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
import { BotState } from '@/types';

import { formatPercent } from '@/shared/formatters';
import DateTimeTZ from '@/components/general/DateTimeTZ.vue';

const ftbot = namespace('ftbot');

@Component({ components: { DateTimeTZ } })
export default class BotStatus extends Vue {
  @ftbot.State version;

  @ftbot.State profit;

  @ftbot.State botState?: BotState;

  formatPercent = formatPercent;
}
</script>
