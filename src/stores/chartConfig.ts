export const useChartConfigStore = defineStore(
  'chartConfig',
  () => {
    const strategy = ref<string>('');
    const useLiveData = ref<boolean>(false);
    const selectedTimeframe = ref<string>('');
    const timerange = ref<string>('');
    // For TradingView timeframe switching (visualization only)
    const selectedTradingTimeframe = ref<string>('');

    return {
      strategy,
      useLiveData,
      selectedTimeframe,
      timerange,
      selectedTradingTimeframe,
    };
  },
  {
    persist: {
      key: 'ftUIChartSettings',
      pick: ['useLiveData'],
    },
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useChartConfigStore, import.meta.hot));
}
