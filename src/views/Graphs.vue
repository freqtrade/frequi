<template>
  <div class="d-flex flex-column h-100">
    <!-- <div v-if="isWebserverMode" class="mr-auto ml-3"> -->
    <!-- Currently only available in Webserver mode -->
    <!-- <b-checkbox v-model="historicView">HistoricData</b-checkbox> -->
    <!-- </div> -->
    <div v-if="isWebserverMode" class="mx-md-3 mt-2">
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
        :available-pairs="isWebserverMode ? pairlist : whitelist"
        :historic-view="isWebserverMode"
        :timeframe="isWebserverMode ? selectedTimeframe : timeframe"
        :trades="trades"
        :timerange="isWebserverMode ? timerange : ''"
        :strategy="isWebserverMode ? strategy : ''"
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
import { BotStoreGetters } from '@/store/modules/ftbot';
import StoreModules from '@/store/storeSubModules';
import { defineComponent, onMounted, ref } from '@vue/composition-api';
import { useNamespacedActions, useNamespacedGetters } from 'vuex-composition-helpers';

export default defineComponent({
  name: 'Graphs',
  components: { CandleChartContainer, StrategySelect, TimeRangeSelect, TimeframeSelect },
  setup() {
    const strategy = ref('');
    const timerange = ref('');
    const selectedTimeframe = ref('');
    const { pairlist, whitelist, trades, timeframe, isWebserverMode } = useNamespacedGetters(
      StoreModules.ftbot,
      [
        BotStoreGetters.pairlist,
        BotStoreGetters.whitelist,
        BotStoreGetters.trades,
        BotStoreGetters.timeframe,
        BotStoreGetters.isWebserverMode,
      ],
    );

    const { getWhitelist, getAvailablePairs } = useNamespacedActions(StoreModules.ftbot, [
      'getWhitelist',
      'getAvailablePairs',
    ]);
    onMounted(() => {
      if (!whitelist.value || whitelist.value.length === 0) {
        getWhitelist();
      }
      console.log(isWebserverMode.value);
      if (isWebserverMode.value) {
        // this.refresh();
        getAvailablePairs({ timeframe: timeframe.value });
        // .then((val) => {
        // console.log(val);
        // });
      }
    });

    return {
      pairlist,
      whitelist,
      trades,
      timeframe,
      isWebserverMode,
      getWhitelist,
      getAvailablePairs,
      strategy,
      timerange,
      selectedTimeframe,
    };
  },
});
</script>

<style scoped></style>
