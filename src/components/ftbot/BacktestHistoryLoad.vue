<template>
  <div>
    <button
      class="btn btn-secondary float-end"
      title="Refresh"
      aria-label="Refresh"
      @click="botStore.activeBot.getBacktestHistory"
    >
      &#x21bb;
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
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { timestampms } from '@/shared/formatters';
import { useBotStore } from '@/stores/ftbotwrapper';

const botStore = useBotStore();

onMounted(() => {
  botStore.activeBot.getBacktestHistory();
});
</script>

<style lang="scss" scoped></style>
