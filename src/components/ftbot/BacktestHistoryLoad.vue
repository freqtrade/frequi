<template>
  <div>
    <button
      class="btn btn-secondary float-right"
      title="Refresh"
      aria-label="Refresh"
      @click="getBacktestHistory"
    >
      &#x21bb;
    </button>
    <p>
      Load Historic results from disk. You can click on multiple results to load all of them into
      freqUI.
    </p>
    <b-list-group v-if="backtestHistoryList" class="ml-2">
      <b-list-group-item
        v-for="(res, idx) in backtestHistoryList"
        :key="idx"
        class="d-flex justify-content-between align-items-center py-1 mb-1"
        button
        @click="getBacktestHistoryResult(res)"
      >
        <strong>{{ res.strategy }}</strong>
        backtested on: {{ timestampms(res.backtest_start_time * 1000) }}
        <small>{{ res.filename }}</small>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import { defineComponent, onMounted } from '@vue/composition-api';
import StoreModules from '@/store/storeSubModules';
import { useNamespacedActions, useNamespacedGetters } from 'vuex-composition-helpers';
import { timestampms } from '@/shared/formatters';

export default defineComponent({
  setup() {
    const { getBacktestHistory, getBacktestHistoryResult } = useNamespacedActions(
      StoreModules.ftbot,
      ['getBacktestHistory', 'getBacktestHistoryResult'],
    );
    const { backtestHistoryList } = useNamespacedGetters(StoreModules.ftbot, [
      'backtestHistoryList',
    ]);

    onMounted(() => {
      getBacktestHistory();
    });

    return {
      getBacktestHistory,
      getBacktestHistoryResult,
      backtestHistoryList,
      timestampms,
    };
  },
});
</script>

<style lang="scss" scoped></style>
