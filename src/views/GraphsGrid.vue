<template>
  <div class="d-flex flex-column h-100">
    <div class="graphs-grid">
      <div v-for="pair in botStore.activeBot.whitelist" class="grid">
        <CandleChartContainerSimple
          :pair="pair"
          :historic-view="botStore.activeBot.isWebserverMode"
          :timeframe="botStore.activeBot.timeframe"
          :trades="botStore.activeBot.trades"
          :timerange="botStore.activeBot.isWebserverMode ? timerange : ''"
          :strategy="botStore.activeBot.isWebserverMode ? strategy : ''"
          :plot-config-modal="false"
        >
        </CandleChartContainerSimple>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import CandleChartContainerSimple from '@/components/charts/CandleChartContainerSimple.vue';
import { defineComponent, onMounted, ref } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';

export default defineComponent({
  name: 'GraphsGrid',
  components: {
    CandleChartContainerSimple,
  },
  setup() {
    const botStore = useBotStore();
    const strategy = ref('');
    const timerange = ref('');
    const selectedTimeframe = ref('');

    onMounted(() => {
      botStore.activeBot.getWhitelist();
    });

    return {
      botStore,
      strategy,
      timerange,
      selectedTimeframe,
    };
  },
});
</script>

<style lang="scss" scoped>
  .graphs-grid {
    display: flex;
    flex-wrap: wrap;

    .grid {
      width: 50%;
      height: 50vh;
      box-sizing: border-box;
    }
  }
</style>
