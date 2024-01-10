<template>
  <div class="d-flex h-100 p-0 align-items-start">
    <div ref="scrollContainer" class="border p-1 text-start pb-5 w-100 h-100 overflow-auto">
      <pre
        v-for="(log, index) in botStore.activeBot.lastLogs"
        :key="index"
        class="m-0 overflow-visible"
        style="line-height: unset"
      ><span class="text-muted">{{ log[0] }} <span :class="getLogColor(log[3])">{{ log[3].padEnd(7, ' ') }}</span> {{ log[2] }} - </span><span class="text-{{ log[1] }}">{{ log[4] }}</span
        ></pre>
    </div>
    <div class="d-flex flex-column gap-1 ms-1">
      <b-button id="refresh-logs" size="sm" title="Reload Logs" @click="refreshLogs">
        <i-mdi-refresh />
      </b-button>
      <b-button size="sm" title="Scroll to bottom" @click="scrollToBottom">
        <i-mdi-arrow-down-thick />
      </b-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';

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
      return 'text-warning';
    case 'ERROR':
      return 'text-danger';
    default:
      return 'text-secondary';
  }
}

function scrollToBottom() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
}
</script>

<style lang="scss" scoped>
textarea {
  width: 100%;
  min-height: 6em;
  resize: none;
  font-size: $fontsize-small;
}
</style>
