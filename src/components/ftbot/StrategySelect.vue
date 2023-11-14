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
        <b-button @click="botStore.activeBot.getStrategyList">
          <i-mdi-refresh />
        </b-button>
      </div>
    </div>

    <textarea
      v-if="showDetails && botStore.activeBot.strategy"
      v-model="strategyCode"
      class="w-100 h-100"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';

const props = defineProps({
  modelValue: { type: String, required: true },
  showDetails: { default: false, required: false, type: Boolean },
});
const emit = defineEmits(['update:modelValue']);
const botStore = useBotStore();

const strategyCode = computed((): string => botStore.activeBot.strategy?.code);
const locStrategy = computed({
  get() {
    return props.modelValue;
  },
  set(strategy: string) {
    botStore.activeBot.getStrategy(strategy);
    emit('update:modelValue', strategy);
  },
});

onMounted(() => {
  if (botStore.activeBot.strategyList.length === 0) {
    botStore.activeBot.getStrategyList();
  }
});
</script>
