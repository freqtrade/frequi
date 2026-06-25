<script setup lang="ts">
const { runningJobs, clearAllJobs } = useBackgroundJob();

const jobCategoryIcons: Record<string, string> = {
  pairlist: 'mdi-format-list-bulleted',
  download_data: 'mdi-download-box-outline',
  // backtest: 'mdi-chart-timeline-variant-shimmer',
  // lookahead_analysis: 'mdi-chart-timeline-variant-shimmer',
  // recursive_analysis: 'mdi-chart-timeline-variant-shimmer',
};
</script>

<template>
  <div class="flex flex-row items-end gap-1">
    <ul class="ms-2 w-full grow space-y-1">
      <li
        v-for="(job, key) in runningJobs"
        :key="key"
        class="border p-1 pb-2 rounded-sm dark:border-neutral-700 border-neutral-300 flex gap-2 items-center"
        :title="key"
      >
        <UIcon
          :name="jobCategoryIcons[job.taskStatus?.job_category]"
          v-if="job.taskStatus?.job_category"
          :title="job.taskStatus?.job_category"
        />
        <span v-else>{{ job.taskStatus?.job_category }}</span>
        <div class="flex justify-between">
          <i-mdi-check v-if="job.taskStatus?.status === 'success'" class="text-success" title="" />
          <div
            class="flex gap-2 items-center w-full"
            v-else-if="job.taskStatus?.status === 'failed'"
          >
            <i-mdi-close class="text-error" title="" />
            <span class="capitalize text-error">{{ job.taskStatus?.status }}</span>
            <span class="ms-2">{{ job.taskStatus?.error }}</span>
          </div>
          <span v-else>{{ job.taskStatus?.status }} </span>
          <span v-if="job.taskStatus?.progress" class="w-25">{{ job.taskStatus?.progress }}</span>
        </div>
        <UProgress
          v-if="job.taskStatus?.progress"
          class="w-full grow"
          color="success"
          :model-value="(job.taskStatus?.progress / 100) * 100"
          :max="100"
        />
        <div
          v-if="
            job.taskStatus?.progress_tasks && Object.keys(job.taskStatus?.progress_tasks).length > 0
          "
          class="flex flex-col md:flex-row w-full grow gap-2"
        >
          <div
            v-for="[tkey, t] in Object.entries(job.taskStatus?.progress_tasks)"
            :key="tkey"
            class="w-full"
          >
            {{ t.description }}

            <UProgress
              class="w-full grow"
              :model-value="Math.round((t.progress / t.total) * 100 * 100) / 100"
              color="success"
              show-progress
              :pt="{
                value: {
                  class: job.taskStatus.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500',
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
      @click="clearAllJobs"
    />
  </div>
</template>
