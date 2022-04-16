<template>
  <div>
    <div class="w-100 d-flex">
      <b-form-select id="strategy-select" v-model="locStrategy" :options="strategyList">
      </b-form-select>
      <div class="ml-2">
        <b-button @click="getStrategyList">&#x21bb;</b-button>
      </div>
    </div>

    <textarea v-if="showDetails && strategy" v-model="strategyCode" class="w-100 h-100"></textarea>
  </div>
</template>

<script lang="ts">
import { BotStoreGetters } from '@/store/modules/ftbot';
import StoreModules from '@/store/storeSubModules';
import { defineComponent, computed, onMounted } from '@vue/composition-api';
import { useNamespacedActions, useNamespacedGetters } from 'vuex-composition-helpers';

export default defineComponent({
  name: 'StrategySelect',
  props: {
    value: { type: String, required: true },
    showDetails: { default: false, required: false, type: Boolean },
  },
  emits: ['input'],
  setup(props, { emit }) {
    const { getStrategyList, getStrategy } = useNamespacedActions(StoreModules.ftbot, [
      'getStrategyList',
      'getStrategy',
    ]);

    const { strategyList, strategy } = useNamespacedGetters(StoreModules.ftbot, [
      BotStoreGetters.strategyList,
      BotStoreGetters.strategy,
    ]);

    const strategyCode = computed((): string => strategy.value?.code);
    const locStrategy = computed({
      get() {
        return props.value;
      },
      set(strategy) {
        getStrategy(strategy);
        emit('input', strategy);
      },
    });

    onMounted(() => {
      if (strategyList.value.length === 0) {
        getStrategyList();
      }
    });
    return {
      getStrategyList,
      getStrategy,
      strategyList,
      strategy,
      strategyCode,
      locStrategy,
    };
  },
});
</script>

<style></style>
