<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';

const props = defineProps({
  modelValue: { type: String, required: true },
  showDetails: { default: false, required: false, type: Boolean },
});
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

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

<template>
  <div>
    <div class="w-100 d-flex">
      <BFormSelect
        id="strategy-select"
        v-model="locStrategy"
        :options="botStore.activeBot.strategyList"
      >
      </BFormSelect>
      <div class="ms-1">
        <BButton @click="botStore.activeBot.getStrategyList">
          <i-mdi-refresh />
        </BButton>
      </div>
    </div>

    <textarea
      v-if="showDetails && botStore.activeBot.strategy"
      v-model="strategyCode"
      class="w-100 h-100"
    ></textarea>
  </div>
</template>
