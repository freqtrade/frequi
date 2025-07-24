<script setup lang="ts">
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
    <div class="w-full flex">
      <Select
        id="strategy-select"
        v-model="locStrategy"
        filter
        fluid
        :options="botStore.activeBot.strategyList"
      >
      </Select>
      <div class="ms-1">
        <Button severity="secondary" variant="outlined" @click="botStore.activeBot.getStrategyList">
          <template #icon>
            <i-mdi-refresh />
          </template>
        </Button>
      </div>
    </div>

    <textarea
      v-if="showDetails && botStore.activeBot.strategy"
      v-model="strategyCode"
      class="w-full h-full"
    ></textarea>
  </div>
</template>
