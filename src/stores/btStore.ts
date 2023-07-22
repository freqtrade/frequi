import { defineStore } from 'pinia';

export const useBtStore = defineStore('btStore', {
  state: () => {
    return {
      strategy: '',
      selectedTimeframe: '',
      selectedDetailTimeframe: '',
      timerange: '',
      maxOpenTrades: '',
      stakeAmount: '',
      startingCapital: '',
      allowCache: true,
      freqAI: {
        enabled: false,
        model: '',
        identifier: '',
      },
    };
  },
  getters: {},
  actions: {},
});
