export const useBtStore = defineStore('btStore', {
  state: () => {
    return {
      strategy: '',
      selectedTimeframe: '',
      selectedDetailTimeframe: '',
      timerange: '',
      maxOpenTrades: null as number | null,
      stakeAmount: null as number | null,
      startingCapital: null as number | null,
      allowCache: true,
      enableProtections: false,
      stakeAmountUnlimited: false,
      freqAI: {
        enabled: false,
        model: '',
        identifier: '',
      },
    };
  },
  getters: {
    canRunBacktest: (state) => state.strategy !== '',
  },
  actions: {},
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBtStore, import.meta.hot));
}
