import { defineStore } from 'pinia';

const STORE_UI_COLORS = 'ftUIColorSettings';

export enum ColorPreferences {
  GREEN_UP = 'greenUp',
  RED_UP = 'redUp',
}

export const useColorStore = defineStore('colorStore', {
  // other options...
  state: () => {
    return {
      colorPreference: ColorPreferences.GREEN_UP,
      colorUp: '#26A69A',
      colorDown: '#EF5350',
      colorProfit: '#26A69A', //12bb7b
      colorLoss: '#ef5350',
    };
  },
  getters: {
    cssVars(state) {
      return {
        '--color-profit': state.colorProfit,
        '--color-loss': state.colorLoss,
      };
    },
  },
  actions: {
    updateProfitLossColor() {
      const [colorUp, colorDown] =
        this.colorPreference === ColorPreferences.GREEN_UP
          ? ['#26A69A', '#ef5350']
          : ['#ef5350', '#26A69A'];
      this.colorUp = colorUp;
      this.colorDown = colorDown;
    },
  },
  persist: {
    key: STORE_UI_COLORS,
  },
});
