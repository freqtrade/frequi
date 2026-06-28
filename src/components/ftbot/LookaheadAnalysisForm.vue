<script setup lang="ts">
import type { LookaheadAnalysisPayload } from '@/types';

const props = defineProps<{
  running: boolean;
}>();

const emit = defineEmits<{
  start: [payload: LookaheadAnalysisPayload];
}>();

const botStore = useBotStore();
const btStore = useBtStore();

const canStart = computed(
  () => !!btStore.strategy && !props.running && botStore.activeBot.canRunBacktest,
);

function emitStart() {
  const payload: LookaheadAnalysisPayload = {
    strategy: btStore.strategy,
    minimum_trade_amount: btStore.lookaheadMinTradeAmount,
    targeted_trade_amount: btStore.lookaheadTargetedTradeAmount,
    lookahead_allow_limit_orders: btStore.lookaheadAllowLimitOrders,
  };
  if (btStore.selectedTimeframe) {
    payload.timeframe = btStore.selectedTimeframe;
  }
  if (btStore.timerange) {
    payload.timerange = btStore.timerange;
  }
  emit('start', payload);
}

onMounted(() => {
  if (botStore.activeBot.strategyList.length === 0) {
    botStore.activeBot.getStrategyList();
  }
});
</script>

<template>
  <div>
    <UAlert
      color="info"
      class="mb-3 py-2"
      title="Lookahead analysis"
      description="Checks your strategy for lookahead bias by comparing signals generated on the
        full dataset against signals generated on progressively shorter timeranges. Indicators or
        signals that change depending on future data indicate a lookahead bias that will make
        backtest results unreliable."
    />

    <div class="flex flex-col gap-3">
      <div>
        <span class="font-bold">Strategy</span>
        <StrategySelect v-model="btStore.strategy" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        <label for="lookahead-timeframe" class="md:text-right">Timeframe:</label>
        <TimeframeSelect id="lookahead-timeframe" v-model="btStore.selectedTimeframe" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        <div class="flex items-center gap-2 md:justify-end">
          <label for="lookahead-minimum-trade-amount" class="font-bold"
            >Minimum trade amount:</label
          >
          <InfoBox
            hint="Minimum number of trades the analysis should run for before evaluating bias."
          />
        </div>
        <UInput
          id="lookahead-minimum-trade-amount"
          v-model.number="btStore.lookaheadMinTradeAmount"
          type="number"
          min="1"
          class="w-full"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        <div class="flex items-center gap-2 md:justify-end">
          <label for="lookahead-targeted-trade-amount" class="font-bold"
            >Targeted trade amount:</label
          >
          <InfoBox
            hint="Targeted number of trades the analysis tries to reach. Must be greater than or
              equal to the minimum trade amount."
          />
        </div>
        <UInput
          id="lookahead-targeted-trade-amount"
          v-model.number="btStore.lookaheadTargetedTradeAmount"
          type="number"
          min="1"
          class="w-full"
        />
      </div>

      <div class="flex items-center gap-2">
        <UCheckbox id="lookahead-allow-limit-orders" v-model="btStore.lookaheadAllowLimitOrders" />
        <label for="lookahead-allow-limit-orders">Allow limit orders</label>
        <InfoBox
          hint="Allow limit orders in lookahead analysis (could cause false positives in lookahead analysis results)."
        />
      </div>

      <TimeRangeSelect v-model="btStore.timerange" class="mx-auto mt-1" />

      <div class="flex justify-center mt-2">
        <UButton
          icon="i-mdi-play"
          variant="solid"
          :loading="running"
          :disabled="!canStart"
          @click="emitStart"
        >
          Start lookahead analysis
        </UButton>
      </div>
    </div>
  </div>
</template>
