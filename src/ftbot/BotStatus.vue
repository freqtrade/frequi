<template>
  <div>
    <p v-if="profit">
      Avg Profit {{ profit.profit_all_coin.toFixed(2) }}% in {{ profit.trade_count }} Trades, with
      an average duration of {{ profit.avg_duration }}. Best pair: {{ profit.best_pair }}.
    </p>
    <p>
      Running with
      <b>
        {{ botState.max_open_trades }}x{{ botState.stake_amount }}
        {{ botState.stake_currency }}
      </b>
      on
      <b>{{ botState.exchange }}</b
      >, with Strategy <b>{{ botState.strategy }}</b
      >.
    </p>
    <p>
      Currently <b>{{ botState.state }}</b>
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'BotStatus',
  computed: {
    ...mapState('ftbot', ['profit', 'botState']),
  },
};
</script>
