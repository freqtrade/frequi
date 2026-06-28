import type { BacktestFreqAIInput } from '@/types';

export const useBtStore = defineStore('btStore', () => {
  const strategy = ref('');
  const freqAI = ref<BacktestFreqAIInput>({
    enabled: false,
    model: '',
    identifier: '',
  });

  const selectedTimeframe = ref('');
  const selectedDetailTimeframe = ref('');
  const timerange = ref('');

  // Backtest settings
  const maxOpenTrades = ref<number | null>(null);
  const stakeAmount = ref<number | null>(null);
  const startingCapital = ref<number | null>(null);
  const allowCache = ref(true);
  const enableProtections = ref(false);
  const stakeAmountUnlimited = ref(false);

  const canRunBacktest = computed(() => strategy.value !== '');

  return {
    strategy,
    selectedTimeframe,
    selectedDetailTimeframe,
    timerange,
    maxOpenTrades,
    stakeAmount,
    startingCapital,
    allowCache,
    enableProtections,
    stakeAmountUnlimited,
    freqAI,
    canRunBacktest,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBtStore, import.meta.hot));
}
