export const useChartConfigStore = defineStore(
  'chartConfig',
  () => {
    const strategy = ref<string>('');
    const useLiveData = ref<boolean>(false);
    const selectedTimeframe = ref<string>('1h');
    const timerange = ref<string>('');

    return {
      strategy,
      useLiveData,
      selectedTimeframe,
      timerange,
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
