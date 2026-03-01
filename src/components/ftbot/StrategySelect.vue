<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string;
    showDetails?: boolean;
  }>(),
  {
    showDetails: false,
  },
);
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const botStore = useBotStore();

const strategyCode = computed((): string => botStore.activeBot.strategy?.code ?? '');
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
      <USelectMenu
        id="strategy-select"
        v-model="locStrategy"
        filter
        class="w-full"
        :items="botStore.activeBot.strategyList"
      >
      </USelectMenu>
      <div class="ms-1">
        <UButton
          color="neutral"
          variant="outline"
          icon="mdi:refresh"
          @click="botStore.activeBot.getStrategyList()"
        />
      </div>
    </div>

    <textarea
      v-if="showDetails && botStore.activeBot.strategy"
      v-model="strategyCode"
      class="w-full h-full"
    ></textarea>
  </div>
</template>
