<script setup lang="ts">
const botStore = useBotStore();
const scrollContainer = ref<HTMLElement | null>(null);

onMounted(async () => {
  refreshLogs();
});

async function refreshLogs() {
  await botStore.activeBot.getLogs();
  scrollToBottom();
}

function getLogColor(logLevel: string) {
  switch (logLevel) {
    case 'WARNING':
      return 'text-yellow-500';
    case 'ERROR':
      return 'text-red-500';
    default:
      return 'text-surface-500';
  }
}

function scrollToBottom() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
}
</script>

<template>
  <div class="flex h-full p-0 align-items-start">
    <div
      ref="scrollContainer"
      class="border border-surface-500 p-1 text-start text-sm pb-5 w-full h-full overflow-auto"
    >
      <pre
        v-for="(log, index) in botStore.activeBot.lastLogs"
        :key="index"
        class="m-0 overflow-visible"
        style="line-height: unset"
      ><span class="text-surface-600 dark:text-surface-400">{{ log[0] }} <span :class="getLogColor(log[3])">{{ log[3].padEnd(7, ' ') }}</span> {{ log[2] }} - </span
      ><span class="dark:text-surface-200">{{ log[4] }}</span
        ></pre>
    </div>
    <div class="flex flex-col gap-1 ms-1">
      <Button
        id="refresh-logs"
        severity="secondary"
        size="small"
        title="Reload Logs"
        @click="refreshLogs"
      >
        <template #icon>
          <i-mdi-refresh />
        </template>
      </Button>
      <Button size="small" title="Scroll to bottom" severity="secondary" @click="scrollToBottom">
        <template #icon>
          <i-mdi-arrow-down-thick />
        </template>
      </Button>
    </div>
  </div>
</template>

<style lang="css" scoped>
textarea {
  width: 100%;
  min-height: 6em;
  resize: none;
}
</style>
