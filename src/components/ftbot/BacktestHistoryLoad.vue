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
          v-for="(res, idx) in botStore.activeBot.backtestHistoryList"
          :key="idx"
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
              <b-button
                v-if="botStore.activeBot.botApiVersion >= 2.31"
                class="ms-1"
                size="sm"
                title="Load this Result."
                :disabled="res.run_id in botStore.activeBot.backtestHistory"
                @click.stop="botStore.activeBot.getBacktestHistoryResult(res)"
              >
                <i-mdi-arrow-right />
              </b-button>
              <b-button
                v-if="botStore.activeBot.botApiVersion >= 2.31"
                class="ms-1"
                size="sm"
                title="Delete this Result."
                :disabled="res.run_id in botStore.activeBot.backtestHistory"
                @click.stop="deleteBacktestResult(res)"
              >
                <i-mdi-delete />
              </b-button>
            </div>
          </BTd>
        </BTr>
      </BTbody>
    </BTableSimple>
  </div>
  <MessageBox ref="msgBox" />
</template>

<script setup lang="ts">
import MessageBox, { MsgBoxObject } from '@/components/general/MessageBox.vue';
import { timestampms, timestampToTimeRangeString } from '@/shared/formatters';
import { useBotStore } from '@/stores/ftbotwrapper';
import { BacktestHistoryEntry } from '@/types';
import InfoBox from '../general/InfoBox.vue';

const botStore = useBotStore();
const msgBox = ref<typeof MessageBox>();

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

<style lang="scss" scoped>
.table-rounded-corners {
  box-shadow: 0 0 0 1px var(--bs-border-color);
  overflow: hidden;
  vertical-align: middle;
}
</style>
