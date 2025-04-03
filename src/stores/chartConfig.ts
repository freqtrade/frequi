export const useChartConfigStore = defineStore('chartConfig', {
  state: () => ({
    strategy: '',
    useLiveData: false,
    selectedTimeframe: '1h',
    timerange: '',
  }),
  getters: {},
  actions: {},
  persist: {
    key: 'ftUIChartSettings',
    pick: ['useLiveData'],
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useChartConfigStore, import.meta.hot));
}
