import { defineStore } from 'pinia';

const STORE_UI_COLORS = 'ftUIColorSettings';

export const useColorStore = defineStore('colorStore', {
  // other options...
  state: () => {
    return {
      colorPreference: 'greenUp',
      colorUp: '#26A69A',
      colorDown: '#EF5350',
      colorProfit: '#26A69A', //12bb7b
      colorLoss: '#ef5350',
    };
  },
  getters: {},
  actions: {
    updateProfitLossColor() {
      const [colorUp, colorDown] =
        this.colorPreference === 'greenUp' ? ['#26A69A', '#ef5350'] : ['#ef5350', '#12bb7b'];
      this.colorUp = colorUp;
      this.colorDown = colorDown;
    },
  },
  persist: {
    key: STORE_UI_COLORS,
  },
});
