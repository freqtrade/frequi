const STORE_UI_COLORS = 'ftUIColorSettings';

export enum ColorPreferences {
  GREEN_UP = 'greenUp',
  RED_UP = 'redUp',
}

export const useColorStore = defineStore(
  'colorStore',
  () => {
    const colorPreference = ref(ColorPreferences.GREEN_UP);
    const colorUp = ref('#26A69A');
    const colorDown = ref('#EF5350');
    const colorProfit = ref('#12bb7b');
    const colorLoss = ref('#ef5350');

    const cssVars = computed(() => {
      return {
        '--color-profit': colorProfit.value,
        '--color-loss': colorLoss.value,
      };
    });

    function updateProfitLossColor() {
      const [nextColorUp, nextColorDown] =
        colorPreference.value === ColorPreferences.GREEN_UP
          ? ['#26A69A', '#ef5350']
          : ['#ef5350', '#26A69A'];
      colorUp.value = nextColorUp;
      colorDown.value = nextColorDown;
    }

    return {
      colorPreference,
      colorUp,
      colorDown,
      colorProfit,
      colorLoss,
      cssVars,
      updateProfitLossColor,
    };
  },
  {
    persist: {
      key: STORE_UI_COLORS,
      pick: ['colorPreference'],
    },
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useColorStore, import.meta.hot));
}
