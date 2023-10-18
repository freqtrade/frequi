import { defineStore } from 'pinia';

const STORE_UI_COLORS = 'ftUIColorSettings';

export const useColorStore = defineStore('colorStore', {
  // other options...
  state: () => {
    return {
      colorPreference: 'greenUp',
      colorProfit: '#12bb7b',
      colorLoss: '#ef5350',
    };
  },
  getters: {},
  actions: {
    updateProfitLossColor() {
      const [colorProfit, colorLoss] =
        this.colorPreference === 'greenUp' ? ['#12bb7b', '#ef5350'] : ['#ef5350', '#12bb7b'];
      this.colorProfit = colorProfit;
      this.colorLoss = colorLoss;
    },
  },
  persist: {
    key: STORE_UI_COLORS,
  },
});
