<template>
  <div class="d-flex h-100">
    <div class="flex-fill w-100 flex-column align-items-stretch d-flex h-100">
      <div class="pair-name">
        {{ pair }}
      </div>
      <div class="me-1 ms-1 h-100">
        <CandleChartSimple
          v-if="hasDataset"
          :dataset="dataset"
          :trades="trades"
          :plot-config="plotStore.plotConfig"
          :heikin-ashi="settingsStore.useHeikinAshiCandles"
          :use-u-t-c="settingsStore.timezone === 'UTC'"
          :theme="settingsStore.chartTheme"
          :slider-position="sliderPosition"
        >
        </CandleChartSimple>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Trade, PairHistory, LoadingStatus, ChartSliderPosition } from '@/types';
import CandleChartSimple from '@/components/charts/CandleChartSimple.vue';
import { useSettingsStore } from '@/stores/settings';
import { usePlotConfigStore } from '@/stores/plotConfig';
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';

export default defineComponent({
  name: 'CandleChartContainerSimple',
  components: { CandleChartSimple },
  props: {
    trades: { required: false, default: () => [], type: Array as () => Trade[] },
    pair: { required: true, type: String },
    timeframe: { required: true, type: String },
    historicView: { required: false, default: false, type: Boolean },
    plotConfigModal: { required: false, default: true, type: Boolean },
    timerange: { required: false, default: '', type: String },
    strategy: { required: false, default: '', type: String },
    sliderPosition: {
      required: false,
      type: Object as () => ChartSliderPosition,
      default: () => undefined,
    },
  },
  setup(props) {
    const settingsStore = useSettingsStore();
    const botStore = useBotStore();
    const plotStore = usePlotConfigStore();
    const pair = ref('');

    const dataset = computed((): PairHistory => {
      if (props.historicView) {
        return botStore.activeBot.history[`${pair.value}__${props.timeframe}`]?.data;
      }
      return botStore.activeBot.candleData[`${pair.value}__${props.timeframe}`]?.data;
    });

    const datasetColumns = computed(() => (dataset.value ? dataset.value.columns : []));
    const hasDataset = computed(() => !!dataset.value);
    const noDatasetText = computed((): string => {
      const status = props.historicView
        ? botStore.activeBot.historyStatus
        : botStore.activeBot.candleDataStatus;

      switch (status) {
        case LoadingStatus.loading:
          return 'Loading...';

        case LoadingStatus.success:
          return 'No data available';

        case LoadingStatus.error:
          return 'Failed to load data';

        default:
          return 'Unknown';
      }
    });

    const refresh = () => {
      console.log('refresh', pair.value, props.timeframe);
      if (pair.value && props.timeframe) {
        if (props.historicView) {
          botStore.activeBot.getPairHistory({
            pair: pair.value,
            timeframe: props.timeframe,
            timerange: props.timerange,
            strategy: props.strategy,
          });
        } else {
          botStore.activeBot.getPairCandles({
            pair: pair.value,
            timeframe: props.timeframe,
            limit: 500,
          });
        }
      }
    };

    onMounted(() => {
      pair.value = props.pair;
      plotStore.plotConfigChanged();

      refresh();
    });

    return {
      botStore,
      settingsStore,
      plotStore,
      history,
      dataset,
      datasetColumns,
      noDatasetText,
      hasDataset,

      refresh,
      pair,
    };
  },
});
</script>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.pair-name {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
}
</style>
