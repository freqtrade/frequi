<script setup lang="ts">
import type { BacktestPayload, StrategyParameterValue, StrategyResult } from '@/types';

withDefaults(
  defineProps<{
    /** Show a cancel button (e.g. when there are results to return to) */
    canCancel?: boolean;
  }>(),
  { canCancel: false },
);
defineEmits<{
  cancel: [];
}>();

const botStore = useBotStore();
const btStore = useBtStore();

function clickBacktest() {
  const btPayload: BacktestPayload = {
    strategy: btStore.strategy,
    timerange: btStore.timerange,
    enable_protections: btStore.enableProtections,
  };
  if (btStore.maxOpenTrades) {
    btPayload.max_open_trades = btStore.maxOpenTrades;
  }
  if (btStore.stakeAmountUnlimited) {
    btPayload.stake_amount = 'unlimited';
  } else {
    const stakeAmountLoc = Number(btStore.stakeAmount);
    if (stakeAmountLoc) {
      btPayload.stake_amount = stakeAmountLoc.toString();
    }
  }

  const startingCapitalLoc = Number(btStore.startingCapital);
  if (startingCapitalLoc) {
    btPayload.dry_run_wallet = startingCapitalLoc;
  }

  if (btStore.selectedTimeframe) {
    btPayload.timeframe = btStore.selectedTimeframe;
  }
  if (btStore.selectedDetailTimeframe) {
    btPayload.timeframe_detail = btStore.selectedDetailTimeframe;
  }
  if (!btStore.allowCache) {
    btPayload.backtest_cache = 'none';
  }
  if (btStore.freqAI.enabled) {
    btPayload.freqaimodel = btStore.freqAI.model;
    if (btStore.freqAI.identifier !== '') {
      btPayload.freqai = { identifier: btStore.freqAI.identifier };
    }
  }
  if (botStore.activeBot.botFeatures.strategyParametersModify) {
    const strategyParamsPayload = buildStrategyParamsPayload(
      selectedStrategyDetails.value,
      strategyParams.value,
    );
    if (strategyParamsPayload) {
      btPayload.strategy_params = strategyParamsPayload;
    }
  }

  botStore.activeBot.startBacktest(btPayload);
}

const strategyParams = ref<Record<string, StrategyParameterValue>>({});
const selectedStrategyDetails = ref<StrategyResult>();
const strategyParamsModified = computed(() =>
  hasModifiedStrategyParams(selectedStrategyDetails.value, strategyParams.value),
);
</script>

<template>
  <div class="flex flex-col gap-3 text-start">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
      <!-- "contents" on mobile so cards can be reordered: strategy, timerange, wallet, advanced -->
      <div class="contents lg:flex lg:flex-col lg:gap-3">
        <UCard class="order-1" :ui="{ header: 'py-2 sm:px-4', body: 'flex flex-col gap-3 sm:p-4' }">
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon name="i-mdi-strategy" />Strategy
            </h4>
          </template>
          <UFormField label="Strategy">
            <StrategySelect v-model="btStore.strategy" v-model:details="selectedStrategyDetails" />
          </UFormField>
          <div class="grid grid-cols-2 gap-2">
            <UFormField label="Timeframe">
              <TimeframeSelect
                id="timeframe-select"
                v-model="btStore.selectedTimeframe"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Detail timeframe"
              help="Simulates intra-candle results. Leave empty to disable."
            >
              <TimeframeSelect
                id="timeframe-detail-select"
                v-model="btStore.selectedDetailTimeframe"
                :below-timeframe="btStore.selectedTimeframe"
                class="w-full"
              />
            </UFormField>
          </div>
          <UFormField
            v-if="botStore.activeBot.botFeatures.strategyParametersModify"
            label="Strategy parameters"
          >
            <BaseCollapsible
              v-if="selectedStrategyDetails && selectedStrategyDetails?.params.length > 0"
              size="md"
              :unmount-on-hide="false"
            >
              <template #title>
                Open to modify strategy parameters
                <UBadge v-if="strategyParamsModified" color="warning" variant="subtle" size="sm">
                  modified
                </UBadge>
              </template>
              <StrategyParameters
                v-if="selectedStrategyDetails"
                :strategy="selectedStrategyDetails"
                class="m-3"
                editable
                v-model:parameters="strategyParams"
              />
            </BaseCollapsible>
            <span v-else class="text-muted text-sm">No strategy parameters available</span>
          </UFormField>
        </UCard>

        <UCard class="order-4" :ui="{ header: 'py-2 sm:px-4', body: 'flex flex-col gap-3 sm:p-4' }">
          <template #header>
            <h4 class="font-bold flex items-center gap-2"><UIcon name="i-mdi-cog" />Advanced</h4>
          </template>
          <USwitch
            id="enable-protections"
            v-model="btStore.enableProtections"
            label="Enable protections"
            description="Apply the strategy's protections during the backtest."
          />
          <template v-if="botStore.activeBot.botFeatures.backtestFreqAI">
            <USwitch
              id="enable-cache"
              v-model="btStore.allowCache"
              label="Cache backtest results"
              description="Reuse previous results when strategy and settings are unchanged."
            />
            <FreqAIModelInput v-model="btStore.freqAI" />
          </template>
        </UCard>
      </div>

      <div class="contents lg:flex lg:flex-col lg:gap-3">
        <UCard class="order-2" :ui="{ header: 'py-2 sm:px-4', body: 'sm:p-4' }">
          <template #header>
            <h4 class="font-bold flex items-center gap-2">
              <UIcon name="i-mdi-calendar-range" />Time range
            </h4>
          </template>
          <TimeRangeSelect
            v-model="btStore.timerange"
            :can-use-time="botStore.activeBot.botFeatures.timerangeWithTime"
          />
        </UCard>

        <UCard class="order-3" :ui="{ header: 'py-2 sm:px-4', body: 'flex flex-col gap-3 sm:p-4' }">
          <template #header>
            <h4 class="font-bold flex items-center gap-2"><UIcon name="i-mdi-wallet" />Wallet</h4>
          </template>
          <UFormField label="Starting capital">
            <UInputNumber
              id="starting-capital"
              v-model="btStore.startingCapital"
              placeholder="Use config default"
              :increment="false"
              :decrement="false"
              :step="10"
              :min="0"
              :stepSnapping="false"
              :format-options="{
                maximumFractionDigits: 5,
              }"
            />
          </UFormField>
          <UFormField label="Max open trades">
            <UInputNumber
              id="max-open-trades"
              v-model="btStore.maxOpenTrades"
              placeholder="Use strategy default"
              :increment="false"
              :decrement="false"
            />
          </UFormField>
          <UFormField label="Stake amount">
            <div class="flex items-center gap-3">
              <UInputNumber
                id="stake-amount"
                v-model="btStore.stakeAmount"
                placeholder="Use strategy default"
                class="grow"
                :step="10"
                :stepSnapping="false"
                :format-options="{
                  maximumFractionDigits: 5,
                }"
                :min="0"
                :increment="false"
                :decrement="false"
                :disabled="btStore.stakeAmountUnlimited"
              />
              <UCheckbox
                id="stake-amount-bool"
                v-model="btStore.stakeAmountUnlimited"
                label="Unlimited"
              />
            </div>
          </UFormField>
        </UCard>
      </div>
    </div>

    <div class="flex flex-wrap justify-end gap-2">
      <UButton
        v-if="canCancel"
        color="neutral"
        icon="i-mdi-arrow-left"
        variant="outline"
        @click="$emit('cancel')"
      >
        Back to results
      </UButton>
      <UButton
        id="start-backtest"
        variant="solid"
        icon="i-mdi-play"
        :loading="botStore.activeBot.backtestRunning"
        :disabled="
          !btStore.canRunBacktest ||
          botStore.activeBot.backtestRunning ||
          !botStore.activeBot.canRunBacktest
        "
        @click="clickBacktest"
      >
        Start backtest
      </UButton>
    </div>
  </div>
</template>
