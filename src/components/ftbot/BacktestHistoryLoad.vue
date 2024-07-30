<script setup lang="ts">
import MessageBox, { MsgBoxObject } from '@/components/general/MessageBox.vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import { BacktestHistoryEntry } from '@/types';
import InfoBox from '../general/InfoBox.vue';

const botStore = useBotStore();
const msgBox = ref<typeof MessageBox>();
const filterText = ref('');
const filterTextDebounced = refDebounced(filterText, 350, { maxWait: 1000 });

onMounted(() => {
  botStore.activeBot.getBacktestHistory();
});

function deleteBacktestResult(result: BacktestHistoryEntry) {
  const msg: MsgBoxObject = {
    title: 'Delete result',
    message: `Delete result ${result.filename} from disk?`,
    accept: () => {
      botStore.activeBot.deleteBacktestHistoryResult(result);
    },
  };
  msgBox.value?.show(msg);
}
</script>

<template>
  <div>
    <button
      class="btn btn-secondary float-end"
      title="Refresh"
      aria-label="Refresh"
      @click="botStore.activeBot.getBacktestHistory"
    >
      <i-mdi-refresh />
    </button>
    <p>
      Load Historic results from disk. You can click on multiple results to load all of them into
      freqUI.
    </p>
    <div class="d-flex align-items-center">
      <BFormGroup
        v-if="botStore.activeBot.backtestHistoryList.length > 0"
        class="my-2"
        label-for="trade-filter"
      >
        <BFormInput
          id="trade-filter"
          v-model="filterText"
          type="text"
          placeholder="Filter Strategies"
          tilte="Filter Strategies"
        />
      </BFormGroup>
    </div>
    <BTableSimple
      v-if="botStore.activeBot.backtestHistoryList.length > 0"
      responsive
      small
      class="rounded-1 table-rounded-corners"
    >
      <BThead>
        <BTr>
          <BTh>Strategy</BTh>
          <BTh>Details</BTh>
          <BTh>Backtest Time</BTh>
          <BTh>Filename</BTh>
          <BTh>Actions</BTh>
        </BTr>
      </BThead>
      <BTbody>
        <BTr
          v-for="res in botStore.activeBot.backtestHistoryList.filter(
            (r) =>
              r.filename.toLowerCase().includes(filterTextDebounced.toLowerCase()) ||
              r.strategy.toLowerCase().includes(filterTextDebounced.toLowerCase()),
          )"
          :key="res.filename + res.strategy"
          role="button"
          @click="botStore.activeBot.getBacktestHistoryResult(res)"
        >
          <BTd>{{ res.strategy }}</BTd>
          <BTd>
            <strong>{{ res.timeframe }}</strong>
            <span v-if="res.backtest_start_ts && res.backtest_end_ts" class="ms-1">
              {{ timestampToTimeRangeString(res.backtest_start_ts * 1000) }}-{{
                timestampToTimeRangeString(res.backtest_end_ts * 1000)
              }}</span
            >
          </BTd>
          <BTd
            ><small>{{ timestampms(res.backtest_start_time * 1000) }}</small></BTd
          >
          <BTd>
            <small>{{ res.filename }}</small>
          </BTd>
          <BTd>
            <div class="d-flex align-items-center">
              <InfoBox
                v-if="botStore.activeBot.botApiVersion >= 2.32"
                :class="res.notes ? 'opacity-100' : 'opacity-0'"
                :hint="res.notes ?? ''"
              ></InfoBox>
              <BButton
                v-if="botStore.activeBot.botApiVersion >= 2.31"
                class="ms-1"
                size="sm"
                title="Load this Result."
                :disabled="res.run_id in botStore.activeBot.backtestHistory"
                @click.stop="botStore.activeBot.getBacktestHistoryResult(res)"
              >
                <i-mdi-arrow-right />
              </BButton>
              <BButton
                v-if="botStore.activeBot.botApiVersion >= 2.31"
                class="ms-1"
                size="sm"
                title="Delete this Result."
                :disabled="res.run_id in botStore.activeBot.backtestHistory"
                @click.stop="deleteBacktestResult(res)"
              >
                <i-mdi-delete />
              </BButton>
            </div>
          </BTd>
        </BTr>
      </BTbody>
    </BTableSimple>
  </div>
  <MessageBox ref="msgBox" />
</template>

<style lang="scss" scoped>
.table-rounded-corners {
  box-shadow: 0 0 0 1px var(--bs-border-color);
  overflow: hidden;
  vertical-align: middle;
}
</style>
