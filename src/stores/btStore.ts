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

  // Lookahead analysis settings
  const lookaheadMinTradeAmount = ref(10);
  const lookaheadTargetedTradeAmount = ref(20);
  const lookaheadAllowLimitOrders = ref(false);

  // Recursive analysis settings
  // Comma-separated list of startup candle counts to test.
  const recursiveStartupCandleInput = ref<string>('199,399,499,999,1999');
  const recursiveStartupCandles = computed<number[]>(() =>
    recursiveStartupCandleInput.value
      .split(',')
      .map((c) => Number(c.trim()))
      .filter((c) => Number.isFinite(c) && c > 0),
  );

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
    lookaheadMinTradeAmount,
    lookaheadTargetedTradeAmount,
    lookaheadAllowLimitOrders,
    recursiveStartupCandleInput,
    recursiveStartupCandles,
    freqAI,
    canRunBacktest,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBtStore, import.meta.hot));
}
