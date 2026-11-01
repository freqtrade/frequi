<script setup lang="ts">
const botStore = useBotStore();
</script>

<template>
  <div
    v-if="botStore.activeBot.backtestRunning"
    class="flex flex-col gap-1 p-2 border border-primary rounded-md"
  >
    <div class="flex items-center gap-2">
      <UIcon name="i-mdi-loading" class="animate-spin text-primary shrink-0" />
      <span class="text-sm grow truncate">
        Running: {{ botStore.activeBot.backtestStep }}
        {{ formatPercent(botStore.activeBot.backtestProgress, 2) }}
      </span>
      <UButton
        color="error"
        variant="soft"
        size="xs"
        icon="i-mdi-stop"
        @click="botStore.activeBot.stopBacktest()"
      >
        Stop
      </UButton>
    </div>
    <UProgress :model-value="(botStore.activeBot.backtestProgress ?? 0) * 100" size="sm" />
  </div>
</template>
