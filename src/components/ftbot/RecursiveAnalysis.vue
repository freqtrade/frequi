<script setup lang="ts">
import type { RecursiveAnalysisPayload, RecursiveResult } from '@/types';

const botStore = useBotStore();

const running = ref(false);
const result = ref<RecursiveResult | null>(null);
const statusMessage = ref('');

async function startAnalysis(payload: RecursiveAnalysisPayload) {
  running.value = true;
  result.value = null;
  statusMessage.value = '';
  try {
    const { job_id: jobId } = await botStore.activeBot.startRecursiveAnalysis(payload);
    const status = await botStore.activeBot.pollBgJob(jobId, 'recursive_analysis');
    if (status.status === 'failed') {
      statusMessage.value = status.error || 'Recursive analysis failed';
      showAlert(statusMessage.value, 'error');
      return;
    }
    const analysis = await botStore.activeBot.getRecursiveAnalysisResult(jobId);
    if (analysis.status === 'ended') {
      result.value = analysis.result;
      statusMessage.value = analysis.status_msg;
    } else {
      statusMessage.value = analysis.status_msg || 'Recursive analysis failed';
      showAlert(statusMessage.value, 'error');
    }
  } catch (error) {
    console.error(error);
    showAlert('Failed to run recursive analysis', 'error');
  } finally {
    running.value = false;
  }
}
</script>

<template>
  <div class="px-1 mx-auto w-full max-w-4xl lg:max-w-7xl">
    <BackgroundJobTracking class="mb-4" />
    <DraggableContainer header="Recursive Analysis" class="mx-1 p-4">
      <RecursiveAnalysisForm :running="running" @start="startAnalysis" />
    </DraggableContainer>
    <DraggableContainer v-if="result" header="Analysis Result" class="mx-1 mt-4 p-4">
      <RecursiveAnalysisResults :result="result" />
    </DraggableContainer>
  </div>
</template>
