import { defineStore } from 'pinia';

export const useSignalsStore = defineStore('signals', {
  state: () => ({
    pairSignals: {} as Record<
      string,
      {
        actionable: boolean;
        score?: number;
      }
    >,
  }),

  actions: {
    updateSignal(pair: string, data: { actionable: boolean; score?: number }) {
      this.pairSignals[pair] = data;
    },

    isActionable(pair: string): boolean {
      return this.pairSignals[pair]?.actionable === true;
    },
  },
});