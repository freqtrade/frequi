<script setup lang="ts">
import type { RecursiveAnalysisPayload } from '@/types';

const props = defineProps<{
  running: boolean;
}>();

const emit = defineEmits<{
  start: [payload: RecursiveAnalysisPayload];
}>();

const botStore = useBotStore();

const strategy = ref('');
const timeframe = ref('');
const timerange = ref('');
// Optional comma-separated list of startup candle counts to test.
const startupCandlesInput = ref('199,399,499,999,1999');

const startupCandles = computed(() =>
  startupCandlesInput.value
    .split(',')
    .map((c) => Number(c.trim()))
    .filter((c) => Number.isFinite(c) && c > 0),
);

const canStart = computed(
  () => !!strategy.value && !props.running && botStore.activeBot.canRunBacktest,
);

function emitStart() {
  const payload: RecursiveAnalysisPayload = {
    strategy: strategy.value,
  };
  if (timeframe.value) {
    payload.timeframe = timeframe.value;
  }
  if (timerange.value) {
    payload.timerange = timerange.value;
  }
  if (startupCandles.value.length > 0) {
    payload.startup_candle = startupCandles.value;
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
      title="Recursive analysis"
      description="Checks your strategy's indicators for recursive formula issues by comparing
        indicator values calculated with different startup candle counts. Indicators that show a
        difference are likely affected by the amount of startup data and may produce inconsistent
        results between backtesting and dry/live runs."
    />

    <div class="flex flex-col gap-3">
      <div>
        <span class="font-bold">Strategy</span>
        <StrategySelect v-model="strategy" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        <label for="recursive-timeframe">Timeframe:</label>
        <TimeframeSelect id="recursive-timeframe" v-model="timeframe" />
      </div>

      <div class="border dark:border-neutral-700 border-neutral-300 rounded-sm p-2">
        <div class="flex items-center gap-2">
          <label for="recursive-startup-candles" class="font-bold">Startup candle counts:</label>
          <InfoBox
            hint="Comma separated list of startup candle counts to compare against each other.
              Leave empty to use the backend defaults."
          />
        </div>
        <UInput
          id="recursive-startup-candles"
          v-model="startupCandlesInput"
          class="w-full mt-1"
          placeholder="e.g. 199,399,499,999,1999"
        />
      </div>

      <TimeRangeSelect v-model="timerange" class="mx-auto mt-1" />

      <div class="flex justify-center mt-2">
        <UButton
          icon="i-mdi-play"
          variant="solid"
          :loading="running"
          :disabled="!canStart"
          @click="emitStart"
        >
          Start recursive analysis
        </UButton>
      </div>
    </div>
  </div>
</template>
