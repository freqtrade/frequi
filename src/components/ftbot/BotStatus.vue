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
    <b-table
      v-if="botStore.activeBot.profit"
      small
      borderless
      :items="profitItems"
      :fields="profitFields"
    >
    </b-table>
  </div>
</template>

<script setup lang="ts">
import { formatPercent, formatPriceCurrency, timestampms } from '@/shared/formatters';
import DateTimeTZ from '@/components/general/DateTimeTZ.vue';

import { useBotStore } from '@/stores/ftbotwrapper';
import { TableField, TableItem } from 'bootstrap-vue-next';
import { computed } from 'vue';

const botStore = useBotStore();

const profitFields: TableField[] = [
  { key: 'metric', label: 'Metric' },
  { key: 'value', label: 'Value' },
];

const profitItems = computed<TableItem[]>(() => {
  return [
    {
      metric: 'Total Trade count',
      value: `${botStore.activeBot.profit.trade_count}`,
    },
    {
      metric: 'Bot started',
      value: timestampms(botStore.activeBot.profit.bot_start_timestamp ?? 0),
    },
    {
      metric: 'First trade opened',
      value: timestampms(botStore.activeBot.profit.first_trade_timestamp),
    },
    {
      metric: 'Latest trade opened',
      value: timestampms(botStore.activeBot.profit.latest_trade_timestamp),
    },
    {
      metric: 'Win / Loss',
      value: `${botStore.activeBot.profit.winning_trades} / ${botStore.activeBot.profit.losing_trades}`,
    },
    {
      metric: 'Winrate',
      value: `${
        botStore.activeBot.profit.winrate ? formatPercent(botStore.activeBot.profit.winrate) : 'N/A'
      }`,
    },
    {
      metric: 'Expectancy (ratio)',
      value: `${
        botStore.activeBot.profit.expectancy
          ? botStore.activeBot.profit.expectancy.toFixed(2)
          : 'N/A'
      } (${
        botStore.activeBot.profit.expectancy_ratio
          ? botStore.activeBot.profit.expectancy_ratio.toFixed(2)
          : 'N/A'
      })`,
    },
    {
      metric: 'Avg Duration',
      value: `${botStore.activeBot.profit.avg_duration}`,
    },
    {
      metric: 'Best performing',
      value: `${botStore.activeBot.profit.best_pair}: ${formatPercent(
        botStore.activeBot.profit.best_pair_profit_ratio,
        2,
      )}`,
    },
    {
      metric: 'Trading volume',
      value: `${formatPriceCurrency(
        botStore.activeBot.profit.trading_volume ?? 0,
        botStore.activeBot.botState.stake_currency,
        botStore.activeBot.botState.stake_currency_decimals ?? 3,
      )}`,
    },
    {
      metric: 'Profit factor',
      value: `${
        botStore.activeBot.profit.profit_factor
          ? botStore.activeBot.profit.profit_factor.toFixed(2)
          : 'N/A'
      }`,
    },
    {
      metric: 'Max Drawdown',
      value: `${
        botStore.activeBot.profit.max_drawdown
          ? formatPercent(botStore.activeBot.profit.max_drawdown, 2)
          : 'N/A'
      } (${
        botStore.activeBot.profit.max_drawdown_abs
          ? formatPriceCurrency(
              botStore.activeBot.profit.max_drawdown_abs,
              botStore.activeBot.botState.stake_currency,
              botStore.activeBot.botState.stake_currency_decimals ?? 3,
            )
          : 'N/A'
      }) ${
        botStore.activeBot.profit.max_drawdown_start_timestamp &&
        botStore.activeBot.profit.max_drawdown_end_timestamp
          ? 'from ' +
            timestampms(botStore.activeBot.profit.max_drawdown_start_timestamp) +
            ' to ' +
            timestampms(botStore.activeBot.profit.max_drawdown_end_timestamp)
          : ''
      }`,
    },
  ];
});
</script>
