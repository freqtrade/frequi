<template>
  <div>
    <div class="w-100 d-flex">
      <b-form-select
        id="strategy-select"
        v-model="locStrategy"
        :options="botStore.activeBot.strategyList"
      >
      </b-form-select>
      <div class="ms-2">
        <b-button @click="botStore.activeBot.getStrategyList">&#x21bb;</b-button>
      </div>
    </div>

    <textarea
      v-if="showDetails && botStore.activeBot.strategy"
      v-model="strategyCode"
      class="w-100 h-100"
    ></textarea>
  </div>
</template>

<script lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { defineComponent, computed, onMounted } from 'vue';

export default defineComponent({
  name: 'StrategySelect',
  props: {
    value: { type: String, required: true },
    showDetails: { default: false, required: false, type: Boolean },
  },
  emits: ['input'],
  setup(props, { emit }) {
    const botStore = useBotStore();

    const strategyCode = computed((): string => botStore.activeBot.strategy?.code);
    const locStrategy = computed({
      get() {
        return props.value;
      },
      set(strategy: string) {
        botStore.activeBot.getStrategy(strategy);
        emit('input', strategy);
      },
    });

    onMounted(() => {
      if (botStore.activeBot.strategyList.length === 0) {
        botStore.activeBot.getStrategyList();
      }
    });
    return {
      botStore,
      strategyCode,
      locStrategy,
    };
  },
});
</script>

<style></style>
