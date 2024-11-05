<script setup lang="ts">
const { runningJobs } = useBackgroundJob();
</script>

<template>
  <BListGroup class="ms-2">
    <BListGroupItem v-for="(job, key) in runningJobs" :key="key" class="d-flex gap-2" :title="key">
      <i-mdi-download-box-outline v-if="job.job_category === 'download_data'" />

      <span v-else>{{ job.job_category }}</span>
      <div class="d-flex justify-content-between w-25">
        <i-mdi-check v-if="job.status === 'success'" class="text-success" title="" />
        <span v-else>{{ job.status }} </span>

        <span class="w-25">{{ job.progress }}</span>
      </div>
      <BProgress class="w-100 flex-grow" :value="job.progress" show-progress :max="100" striped />
    </BListGroupItem>
  </BListGroup>
</template>
