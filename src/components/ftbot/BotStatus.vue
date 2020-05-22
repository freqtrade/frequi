<template>
  <div>
    <p v-if="profit.profit_all_coin">
      Avg Profit {{ profit.profit_all_coin.toFixed(2) }}% in {{ profit.trade_count }} Trades, with
      an average duration of {{ profit.avg_duration }}. Best pair: {{ profit.best_pair }}.
    </p>
    <p>
      Running with
      <strong>
        {{ botState.max_open_trades }}x{{ botState.stake_amount }} {{ botState.stake_currency }}
      </strong>
      on
      <strong>{{ botState.exchange }}</strong>
      , with Strategy <strong>{{ botState.strategy }}</strong>
    </p>
    <p>
      Currently <strong>{{ botState.state }}</strong
      >, <strong>forcebuy: {{ botState.forcebuy_enabled }}</strong>
    </p>
    <p>
      <strong>{{ botState.dry_run ? 'Dry-Run' : 'Live' }}</strong>
    </p>
    <!-- <p>Whitelist: {{ whitelist }}</p> -->
    <!-- <p>Blacklist: {{ blacklist }}</p> -->
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'BotStatus',
  computed: {
    ...mapState('ftbot', ['profit', 'botState', 'whitelist', 'blacklist']),
  },
};
</script>
