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
    <b-list-group v-if="botStore.activeBot.backtestHistoryList" class="ms-2">
      <b-list-group-item
        v-for="(res, idx) in botStore.activeBot.backtestHistoryList"
        :key="idx"
        class="d-flex justify-content-between align-items-center py-1 mb-1"
        button
        @click="botStore.activeBot.getBacktestHistoryResult(res)"
      >
        <strong>{{ res.strategy }}</strong>
        backtested on: {{ timestampms(res.backtest_start_time * 1000) }}
        <small>{{ res.filename }}</small>
        <InfoBox
          v-if="botStore.activeBot.botApiVersion >= 2.32"
          :class="res.notes ? 'opacity-100' : 'opacity-0'"
          :hint="res.notes ?? ''"
        ></InfoBox>
        <b-button
          v-if="botStore.activeBot.botApiVersion >= 2.31"
          class="ms-1"
          size="sm"
          title="Delete this Result."
          @click.stop="deleteBacktestResult(res)"
        >
          <i-mdi-delete />
        </b-button>
      </b-list-group-item>
    </b-list-group>
  </div>
  <MessageBox ref="msgBox" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MessageBox, { MsgBoxObject } from '@/components/general/MessageBox.vue';
import { timestampms } from '@/shared/formatters';
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
    title: 'Stop Bot',
    message: `Delete result ${result.filename} from disk?`,
    accept: () => {
      botStore.activeBot.deleteBacktestHistoryResult(result);
    },
  };
  msgBox.value?.show(msg);
}
</script>

<style lang="scss" scoped></style>
