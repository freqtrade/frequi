<script setup lang="ts">
const botStore = useBotStore();
</script>

<template>
  <div v-if="botStore.activeBot.botState" class="p-4">
    <p class="mb-4">
      Running Freqtrade <strong>{{ botStore.activeBot.version }}</strong>
    </p>
    <p class="mb-4">
      Running with
      <strong>
        {{ botStore.activeBot.botState.max_open_trades }}x{{
          botStore.activeBot.botState.stake_amount
        }}
        {{ botStore.activeBot.botState.stake_currency }}
      </strong>
      on
      <strong>{{ botStore.activeBot.botState.exchange }}</strong> in
      <strong
        >{{ botStore.activeBot.botState.trading_mode || 'spot' }}
        {{
          botStore.activeBot.botState.trading_mode != 'spot'
            ? (botStore.activeBot.botState.margin_mode ?? '')
            : ''
        }}</strong
      >
      markets, with Strategy <strong>{{ botStore.activeBot.botState.strategy }}</strong
      >.
    </p>
    <p v-if="'stoploss_on_exchange' in botStore.activeBot.botState" class="mb-4">
      Stoploss on exchange is
      <strong>{{
        botStore.activeBot.botState.stoploss_on_exchange ? 'enabled' : 'disabled'
      }}</strong
      >.
    </p>
    <p class="mb-4">
      Currently <strong>{{ botStore.activeBot.botState.state }}</strong
      >,
      <strong>force entry: {{ botStore.activeBot.botState.force_entry_enable }}</strong>
    </p>
    <p>
      <strong>{{ botStore.activeBot.botState.dry_run ? 'Dry-Run' : 'Live' }}</strong>
    </p>
    <Divider />
    <p class="mb-4">
      Avg Profit {{ formatPercent(botStore.activeBot.profit.profit_all_ratio_mean) }} (&sum;
      {{ formatPercent(botStore.activeBot.profit.profit_all_ratio_sum) }}) in
      {{ botStore.activeBot.profit.trade_count }} Trades, with an average duration of
      {{ botStore.activeBot.profit.avg_duration }}. Best pair:
      {{ botStore.activeBot.profit.best_pair }}.
    </p>
    <p v-if="botStore.activeBot.profit.first_trade_timestamp" class="mb-4">
      <span v-if="botStore.activeBot.profit.bot_start_timestamp" class="block">
        Bot start date:
        <strong>
          <DateTimeTZ :date="botStore.activeBot.profit.bot_start_timestamp" show-timezone />
        </strong>
      </span>
      <span class="block">
        First trade opened:
        <strong>
          <DateTimeTZ :date="botStore.activeBot.profit.first_trade_timestamp" show-timezone />
        </strong>
      </span>
      <span class="block">
        Last trade opened:
        <strong>
          <DateTimeTZ :date="botStore.activeBot.profit.latest_trade_timestamp" show-timezone />
        </strong>
      </span>
    </p>
    <p>
      <span v-if="botStore.activeBot.profit.profit_factor" class="block">
        Profit factor:
        {{ formatNumber(botStore.activeBot.profit.profit_factor, 2) }}
      </span>
      <span v-if="botStore.activeBot.profit.trading_volume" class="block mb-4">
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
    <Divider />
    <BotProfit
      class="mx-1"
      :profit-all="botStore.activeBot.profitAll"
      :stake-currency="botStore.activeBot.botState.stake_currency ?? 'USDT'"
      :stake-currency-decimals="botStore.activeBot.botState.stake_currency_decimals ?? 3"
    />
  </div>
</template>
