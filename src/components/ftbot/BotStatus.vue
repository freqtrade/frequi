<template>
  <div v-if="botStore.activeBot.botState">
    <p>
      Running Freqtrade <strong>{{ botStore.activeBot.version }}</strong>
    </p>
    <p>
      Running with
      <strong>
        {{ botStore.activeBot.botState.max_open_trades }}x{{
          botStore.activeBot.botState.stake_amount
        }}
        {{ botStore.activeBot.botState.stake_currency }}
      </strong>
      on
      <strong>{{ botStore.activeBot.botState.exchange }}</strong> in
      <strong>{{ botStore.activeBot.botState.trading_mode || 'spot' }}</strong> markets, with
      Strategy
      <strong>{{ botStore.activeBot.botState.strategy }}</strong>
    </p>
    <p>
      Currently <strong>{{ botStore.activeBot.botState.state }}</strong
      >,
      <strong
        >force entry:
        {{ botStore.activeBot.botState.force_entry_enable || botState.forcebuy_enabled }}</strong
      >
    </p>
    <p>
      <strong>{{ botStore.activeBot.botState.dry_run ? 'Dry-Run' : 'Live' }}</strong>
    </p>
    <hr />
    <p>
      Avg Profit {{ formatPercent(botStore.activeBot.profit.profit_all_ratio_mean) }} (&sum;
      {{ formatPercent(botStore.activeBot.profit.profit_all_ratio_sum) }}) in
      {{ botStore.activeBot.profit.trade_count }} Trades, with an average duration of
      {{ botStore.activeBot.profit.avg_duration }}. Best pair:
      {{ botStore.activeBot.profit.best_pair }}.
    </p>
    <p v-if="botStore.activeBot.profit.first_trade_timestamp">
      First trade opened:

      <strong
        ><DateTimeTZ :date="botStore.activeBot.profit.first_trade_timestamp" show-timezone
      /></strong>
      <br />
      Last trade opened:
      <strong
        ><DateTimeTZ :date="botStore.activeBot.profit.latest_trade_timestamp" show-timezone
      /></strong>
    </p>
  </div>
</template>

<script lang="ts">
import { formatPercent } from '@/shared/formatters';
import DateTimeTZ from '@/components/general/DateTimeTZ.vue';

import { defineComponent } from '@vue/composition-api';
import { useBotStore } from '@/stores/ftbotwrapper';

export default defineComponent({
  name: 'BotStatus',
  components: { DateTimeTZ },
  setup() {
    const botStore = useBotStore();
    return {
      formatPercent,
      botStore,
    };
  },
});
</script>
