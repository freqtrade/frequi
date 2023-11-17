<template>
  <div>
    <div class="mb-2">
      <label class="me-auto h3">Balance</label>
      <div class="float-end d-flex flex-row">
        <b-button
          v-if="canUseBotBalance"
          size="sm"
          :title="!showBotOnly ? 'Showing Account balance' : 'Showing Bot balance'"
          @click="showBotOnly = !showBotOnly"
        >
          <i-mdi-robot v-if="showBotOnly" />
          <i-mdi-bank v-else />
        </b-button>
        <b-button
          size="sm"
          :title="!hideSmallBalances ? 'Hide small balances' : 'Show all balances'"
          @click="hideSmallBalances = !hideSmallBalances"
        >
          <i-mdi-eye-off v-if="hideSmallBalances" />
          <i-mdi-eye v-else />
        </b-button>

        <b-button class="float-end" size="sm" @click="refreshBalance">
          <i-mdi-refresh />
        </b-button>
      </div>
    </div>
    <BalanceChart v-if="balanceCurrencies" :currencies="chartValues" />
    <div>
      <p v-if="botStore.activeBot.balance.note">
        <strong>{{ botStore.activeBot.balance.note }}</strong>
      </p>
      <b-table class="table-sm" :items="balanceCurrencies" :fields="tableFields">
        <template #custom-foot>
          <td class="pt-1"><strong>Total</strong></td>
          <td class="pt-1">
            <span
              class="font-italic"
              :title="`Increase over initial capital of ${formatCurrency(
                botStore.activeBot.balance.starting_capital,
              )} ${botStore.activeBot.balance.stake}`"
            >
              {{ formatPercent(botStore.activeBot.balance.starting_capital_ratio) }}
            </span>
          </td>
          <!-- this is a computed prop that adds up all the expenses in the visible rows -->
          <td class="pt-1">
            <strong>
              {{
                showBotOnly && canUseBotBalance
                  ? formatCurrency(botStore.activeBot.balance.total_bot)
                  : formatCurrency(botStore.activeBot.balance.total)
              }}
            </strong>
          </td>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPercent, formatPrice } from '@/shared/formatters';
import { useBotStore } from '@/stores/ftbotwrapper';
import { BalanceValues } from '@/types';
import { TableField } from 'bootstrap-vue-next';

const botStore = useBotStore();
const hideSmallBalances = ref(true);
const showBotOnly = ref(true);

const smallBalance = computed<number>(() => {
  return Number((1.1 ** botStore.activeBot.stakeCurrencyDecimals).toFixed(8));
});

const canUseBotBalance = computed(() => {
  return botStore.activeBot.botApiVersion >= 2.26;
});

const balanceCurrencies = computed(() => {
  return botStore.activeBot.balance.currencies?.filter(
    (v) =>
      (!hideSmallBalances.value || v.est_stake >= smallBalance.value) &&
      (!canUseBotBalance.value || !showBotOnly.value || (v.is_bot_managed ?? true) === true),
  );
});

const formatCurrency = (value) => {
  return value ? formatPrice(value, botStore.activeBot.stakeCurrencyDecimals) : '';
};

const chartValues = computed<BalanceValues[]>(() => {
  return balanceCurrencies.value?.map((v) => {
    return {
      balance:
        showBotOnly.value && canUseBotBalance.value && v.bot_owned != undefined
          ? v.bot_owned
          : v.balance,
      currency: v.currency,
      est_stake:
        showBotOnly.value && canUseBotBalance.value ? v.est_stake_bot ?? v.est_stake : v.est_stake,
      free: showBotOnly.value && canUseBotBalance.value ? v.bot_owned ?? v.free : v.free,
      used: v.used,
      stake: v.stake,
    };
  });
});

const tableFields = computed<TableField[]>(() => {
  return [
    { key: 'currency', label: 'Currency' },
    {
      key: showBotOnly.value && canUseBotBalance.value ? 'bot_owned' : 'free',
      label: 'Available',
      formatter: formatCurrency,
    },
    {
      key: showBotOnly.value && canUseBotBalance.value ? 'est_stake_bot' : 'est_stake',
      label: `in ${botStore.activeBot.balance.stake}`,
      formatter: formatCurrency,
    },
  ];
});

async function refreshBalance() {
  botStore.activeBot.getBalance();
}

onMounted(() => {
  refreshBalance();
});
</script>
