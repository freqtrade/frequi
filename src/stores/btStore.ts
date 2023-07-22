import { defineStore } from 'pinia';

export const useBtStore = defineStore('btStore', {
  state: () => {
    return {
      strategy: '',
      selectedTimeframe: '',
      selectedDetailTimeframe: '',
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
