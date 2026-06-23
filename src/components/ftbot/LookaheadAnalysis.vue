<script setup lang="ts">
import type { LookaheadAnalysisPayload, LookaheadResult } from '@/types';

const botStore = useBotStore();

const running = ref(false);
const intervalId = ref<number>();
const result = ref<LookaheadResult | null>(null);
const statusMessage = ref('');

function clearInterval_() {
  if (intervalId.value) {
    window.clearInterval(intervalId.value);
    intervalId.value = undefined;
  }
}

async function startAnalysis(payload: LookaheadAnalysisPayload) {
  running.value = true;
  result.value = null;
  statusMessage.value = '';
  try {
    const { job_id: jobId } = await botStore.activeBot.startLookaheadAnalysis(payload);

    intervalId.value = window.setInterval(async () => {
      const res = await botStore.activeBot.getBackgroundJobStatus(jobId);
      if (!res.running) {
        clearInterval_();
        running.value = false;
        try {
          const analysis = await botStore.activeBot.getLookaheadAnalysisResult(jobId);
          if (analysis.status === 'ended') {
            result.value = analysis.result;
            statusMessage.value = analysis.status_msg;
          } else {
            statusMessage.value = analysis.status_msg || 'Lookahead analysis failed';
            showAlert(statusMessage.value, 'error');
          }
        } catch (error) {
          console.error(error);
          showAlert('Failed to load lookahead analysis result', 'error');
        }
      }
    }, 1000);
  } catch (error) {
    console.error(error);
    running.value = false;
    showAlert('Failed to start lookahead analysis', 'error');
  }
}

onBeforeUnmount(() => {
  clearInterval_();
});
</script>

<template>
  <div class="px-1 mx-auto w-full max-w-4xl lg:max-w-7xl">
    <BackgroundJobTracking class="mb-4" />
    <DraggableContainer header="Lookahead Analysis" class="mx-1 p-4">
      <LookaheadAnalysisForm :running="running" @start="startAnalysis" />
    </DraggableContainer>
    <DraggableContainer v-if="result" header="Analysis Result" class="mx-1 mt-4 p-4">
      <LookaheadAnalysisResults :result="result" />
    </DraggableContainer>
  </div>
</template>
