const pairTemplates = ref([
  {
    description: 'BTC/ETH v15 Futures',
    pairs: ['BTC/USDT:USDT', 'ETH/USDT:USDT'],
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
