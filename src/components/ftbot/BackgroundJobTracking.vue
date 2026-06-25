<script setup lang="ts">
const botStore = useBotStore();
const runningJobs = computed(() => botStore.activeBot.backgroundJobs);

const jobCategoryIcons: Record<string, string> = {
  pairlist: 'mdi-format-list-bulleted',
  download_data: 'mdi-download-box-outline',
  // backtest: 'mdi-chart-timeline-variant-shimmer',
  lookahead_analysis: 'mdi-chart-timeline-variant-shimmer',
  recursive_analysis: 'mdi-magnify-scan',
};
</script>

<template>
  <div class="flex flex-row items-end gap-1">
    <ul class="ms-2 w-full grow space-y-1">
      <li
        v-for="(job, key) in runningJobs"
        :key="key"
        class="border p-1 pb-2 rounded-sm dark:border-neutral-700 border-neutral-300 flex gap-2 items-center"
        :title="job.job_category + ' - ' + job.status"
      >
        <UIcon
          :name="jobCategoryIcons[job.job_category]"
          v-if="job.job_category in jobCategoryIcons"
          :title="job.job_id"
        />
        <span v-else>{{ job.job_category }}</span>
        <div class="flex justify-between">
          <i-mdi-check v-if="job.status === 'success'" class="text-success" title="" />
          <div class="flex gap-2 items-center w-full" v-else-if="job.status === 'failed'">
            <i-mdi-close class="text-error" title="" />
            <span class="capitalize text-error">{{ job.status }}</span>
            <span class="ms-2">{{ job.error }}</span>
          </div>
          <span v-else>{{ job.status }} </span>
          <span v-if="job.progress" class="w-25">{{ job.progress }}</span>
        </div>
        <UProgress
          v-if="job.progress"
          class="w-full grow"
          color="success"
          :model-value="(job.progress / 100) * 100"
          :max="100"
        />
        <div
          v-if="job.progress_tasks && Object.keys(job.progress_tasks).length > 0"
          class="flex flex-col md:flex-row w-full grow gap-2"
        >
          <div v-for="[tkey, t] in Object.entries(job.progress_tasks)" :key="tkey" class="w-full">
            {{ t.description }}

            <UProgress
              class="w-full grow"
              :model-value="Math.round((t.progress / t.total) * 100 * 100) / 100"
              color="success"
              show-progress
              :pt="{
                value: {
                  class: job.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500',
                },
              }"
              striped
            />
          </div>
        </div>
      </li>
    </ul>
    <UButton
      v-if="Object.keys(runningJobs).length > 0"
      color="neutral"
      class="ms-auto"
      icon="mdi:delete"
      @click="botStore.activeBot.clearBgJobs()"
    />
  </div>
</template>
