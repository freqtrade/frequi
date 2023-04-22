<template>
  <div>
    <div class="mb-2">
      <label class="me-auto h3">Balance</label>
      <div class="float-end d-flex flex-row">
        <b-button
          size="sm"
          title="Hide small balances"
          @click="hideSmallBalances = !hideSmallBalances"
        >
          <HideIcon v-if="hideSmallBalances" :size="16" />
          <ShowIcon v-else :size="16" />
        </b-button>

        <b-button class="float-end" size="sm" @click="botStore.activeBot.getBalance"
          >&#x21bb;</b-button
        >
      </div>
    </div>
    <BalanceChart v-if="balanceCurrencies" :currencies="balanceCurrencies" />
    <div>
      <p v-if="botStore.activeBot.balance.note">
        <strong>{{ botStore.activeBot.balance.note }}</strong>
      </p>
      <b-table class="table-sm" :items="balanceCurrencies" :fields="tableFields">
        <template #custom-foot>
          <td><strong>Total</strong></td>
          <td>
            <span
              class="font-italic"
              :title="`Increase over initial capital of ${formatCurrency(
                botStore.activeBot.balance.starting_capital,
              )} ${botStore.activeBot.balance.stake}`"
              >{{ formatPercent(botStore.activeBot.balance.starting_capital_ratio) }}</span
            >
          </td>
          <!-- this is a computed prop that adds up all the expenses in the visible rows -->
          <td>
            <strong>{{ formatCurrency(botStore.activeBot.balance.total) }}</strong>
          </td>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import HideIcon from 'vue-material-design-icons/EyeOff.vue';
import ShowIcon from 'vue-material-design-icons/Eye.vue';
import BalanceChart from '@/components/charts/BalanceChart.vue';
import { formatPercent, formatPrice } from '@/shared/formatters';
import { computed, ref } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';

const botStore = useBotStore();
const hideSmallBalances = ref(true);

const smallBalance = computed((): number => {
  return Number((0.1 ** botStore.activeBot.stakeCurrencyDecimals).toFixed(8));
});

const balanceCurrencies = computed(() => {
  if (!hideSmallBalances.value) {
    return botStore.activeBot.balance.currencies;
  }

  return botStore.activeBot.balance.currencies?.filter((v) => v.est_stake >= smallBalance.value);
});

const formatCurrency = (value) => {
  return value ? formatPrice(value, botStore.activeBot.stakeCurrencyDecimals) : '';
};

const tableFields = computed(() => {
  return [
    { key: 'currency', label: 'Currency' },
    { key: 'free', label: 'Available', formatter: formatCurrency },
    {
      key: 'est_stake',
      label: `in ${botStore.activeBot.balance.stake}`,
      formatter: formatCurrency,
    },
  ];
});
</script>
