const pairTemplates = ref([
  {
    description: 'All USDT Pairs',
    pairs: ['.*/USDT'],
  },
  {
    description: 'All USDT Futures Pairs',
    pairs: ['.*/USDT:USDT'],
  },
]);

export function usePairTemplates() {
  return {
    pairTemplates: computed(() => pairTemplates.value.map((x, idx) => ({ ...x, idx }))),
  };
}
