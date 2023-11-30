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
      Strategy <strong>{{ botStore.activeBot.botState.strategy }}</strong
      >.
    </p>
    <p v-if="'stoploss_on_exchange' in botStore.activeBot.botState">
      Stoploss on exchange is
      <strong>{{
        botStore.activeBot.botState.stoploss_on_exchange ? 'enabled' : 'disabled'
      }}</strong
      >.
    </p>
    <p>
      Currently <strong>{{ botStore.activeBot.botState.state }}</strong
      >,
      <strong>force entry: {{ botStore.activeBot.botState.force_entry_enable }}</strong>
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
      <span v-if="botStore.activeBot.profit.bot_start_timestamp" class="d-block">
        Bot start date:
        <strong>
          <DateTimeTZ :date="botStore.activeBot.profit.bot_start_timestamp" show-timezone />
        </strong>
      </span>
      <span class="d-block">
        First trade opened:
        <strong>
          <DateTimeTZ :date="botStore.activeBot.profit.first_trade_timestamp" show-timezone />
        </strong>
      </span>
      <span class="d-block">
        Last trade opened:
        <strong>
          <DateTimeTZ :date="botStore.activeBot.profit.latest_trade_timestamp" show-timezone />
        </strong>
      </span>
    </p>
    <p>
      <span v-if="botStore.activeBot.profit.profit_factor" class="d-block">
        Profit factor:
        {{ botStore.activeBot.profit.profit_factor.toFixed(2) }}
      </span>
      <span v-if="botStore.activeBot.profit.trading_volume" class="d-block">
        Trading volume:
        {{
          formatPriceCurrency(
            botStore.activeBot.profit.trading_volume,
            botStore.activeBot.botState.stake_currency,
            botStore.activeBot.botState.stake_currency_decimals ?? 3,
          )
        }}
      </span>
    </p>
    <BotProfit
      class="mx-1"
      :profit="botStore.activeBot.profit"
      :stake-currency="botStore.activeBot.botState.stake_currency ?? 'USDT'"
      :stake-currency-decimals="botStore.activeBot.botState.stake_currency_decimals ?? 3"
    />
  </div>
</template>

<script setup lang="ts">
import { formatPercent, formatPriceCurrency } from '@/shared/formatters';

import { useBotStore } from '@/stores/ftbotwrapper';

const botStore = useBotStore();
</script>
