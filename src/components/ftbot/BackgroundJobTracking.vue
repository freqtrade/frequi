<script setup lang="ts">
const { runningJobs, clearJobs } = useBackgroundJob();
</script>

<template>
  <div class="flex flex-row items-end gap-1">
    <ul class="ms-2 w-full grow space-y-1">
      <li
        v-for="(job, key) in runningJobs"
        :key="key"
        class="border p-1 pb-2 rounded-sm dark:border-surface-700 border-surface-300 flex gap-2 items-center"
        :title="key"
      >
        <i-mdi-download-box-outline v-if="job.taskStatus?.job_category === 'download_data'" />
        <span v-else>{{ job.taskStatus?.job_category }}</span>
        <div class="flex justify-between">
          <i-mdi-check v-if="job.taskStatus?.status === 'success'" class="text-success" title="" />
          <span v-else>{{ job.taskStatus?.status }} </span>
          <span v-if="job.taskStatus?.progress" class="w-25">{{ job.taskStatus?.progress }}</span>
        </div>
        <ProgressBar
          v-if="job.taskStatus?.progress"
          class="w-full grow"
          :value="(job.taskStatus?.progress / 100) * 100"
          show-progress
          :max="100"
          striped
        />
        <div
          v-if="job.taskStatus?.progress_tasks"
          class="flex flex-col md:flex-row w-full grow gap-2"
        >
          <div
            v-for="[tkey, t] in Object.entries(job.taskStatus?.progress_tasks)"
            :key="tkey"
            class="w-full"
          >
            {{ t.description }}

            <ProgressBar
              class="w-full grow"
              :value="Math.round((t.progress / t.total) * 100 * 100) / 100"
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
    <Button
      v-if="Object.keys(runningJobs).length > 0"
      severity="secondary"
      class="ms-auto"
      @click="clearJobs"
    >
      <template #icon>
        <i-mdi-delete />
      </template>
    </Button>
  </div>
</template>
