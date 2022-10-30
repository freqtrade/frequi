<template>
  <div class="d-flex flex-column h-100">
    <!-- <div v-if="isWebserverMode" class="mr-auto ml-3"> -->
    <!-- Currently only available in Webserver mode -->
    <!-- <b-form-checkbox v-model="historicView">HistoricData</b-form-checkbox> -->
    <!-- </div> -->
    <div v-if="botStore.activeBot.isWebserverMode" class="mx-md-3 mt-2">
      <div class="d-flex flex-wrap">
        <div class="col-md-3 text-left">
          <span>Strategy</span>
          <StrategySelect v-model="strategy" class="mt-1"></StrategySelect>
        </div>
        <div class="col-md-3 text-left">
          <span>Timeframe</span>
          <TimeframeSelect v-model="selectedTimeframe" class="mt-1" />
        </div>
        <TimeRangeSelect v-model="timerange" class="col-12 col-md-5 mr-md-2"></TimeRangeSelect>
      </div>
    </div>

    <div class="mx-2 mt-2 pb-1 h-100">
      <CandleChartContainer
        :available-pairs="
          botStore.activeBot.isWebserverMode
            ? botStore.activeBot.pairlist
            : botStore.activeBot.whitelist
        "
        :historic-view="botStore.activeBot.isWebserverMode"
        :timeframe="
          botStore.activeBot.isWebserverMode ? selectedTimeframe : botStore.activeBot.timeframe
        "
        :trades="botStore.activeBot.trades"
        :timerange="botStore.activeBot.isWebserverMode ? timerange : ''"
        :strategy="botStore.activeBot.isWebserverMode ? strategy : ''"
        :plot-config-modal="false"
      >
      </CandleChartContainer>
    </div>
  </div>
</template>

<script lang="ts">
import CandleChartContainer from '@/components/charts/CandleChartContainer.vue';
import TimeRangeSelect from '@/components/ftbot/TimeRangeSelect.vue';
import TimeframeSelect from '@/components/ftbot/TimeframeSelect.vue';
import StrategySelect from '@/components/ftbot/StrategySelect.vue';
import { defineComponent, onMounted, ref } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';

export default defineComponent({
  name: 'Graphs',
  components: { CandleChartContainer, StrategySelect, TimeRangeSelect, TimeframeSelect },
  setup() {
    const botStore = useBotStore();
    const strategy = ref('');
    const timerange = ref('');
    const selectedTimeframe = ref('');

    onMounted(() => {
      if (botStore.activeBot.isWebserverMode) {
        // this.refresh();
        botStore.activeBot.getAvailablePairs({ timeframe: botStore.activeBot.timeframe });
        // .then((val) => {
        // console.log(val);
        // });
      } else if (!botStore.activeBot.whitelist || botStore.activeBot.whitelist.length === 0) {
        botStore.activeBot.getWhitelist();
      }
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

<style scoped></style>
