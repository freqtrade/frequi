<script setup lang="ts">
const { runningJobs, clearJobs } = useBackgroundJob();
</script>

<template>
  <div class="flex flex-row align-end gap-1">
    <ul class="ms-2 w-full flex-grow">
      <li v-for="(job, key) in runningJobs" :key="key" class="flex gap-2 align-center" :title="key">
        <i-mdi-download-box-outline v-if="job.taskStatus?.job_category === 'download_data'" />
        <span v-else>{{ job.taskStatus?.job_category }}</span>
        <div class="flex justify-between">
          <i-mdi-check v-if="job.taskStatus?.status === 'success'" class="text-success" title="" />
          <span v-else>{{ job.taskStatus?.status }} </span>
          <span v-if="job.taskStatus?.progress" class="w-25">{{ job.taskStatus?.progress }}</span>
        </div>
        <ProgressBar
          v-if="job.taskStatus?.progress"
          class="w-full flex-grow"
          :value="job.taskStatus?.progress"
          show-progress
          :max="100"
          striped
        />
        <div v-if="job.taskStatus?.progress_tasks" class="flex flex-col w-full flex-grow gap-2">
          <div
            v-for="[tkey, t] in Object.entries(job.taskStatus?.progress_tasks)"
            :key="tkey"
            class="w-full"
          >
            {{ t.description }}
            <ProgressBar
              class="w-full flex-grow"
              :value="t.progress"
              show-progress
              :variant="job.taskStatus?.status === 'success' ? 'success' : 'primary'"
              :max="t.total"
              striped
            />
          </div>
        </div>
      </li>
    </ul>
    <Button
      v-if="Object.keys(runningJobs).length > 0"
      size="small"
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
