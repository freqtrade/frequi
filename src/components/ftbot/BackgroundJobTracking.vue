<script setup lang="ts">
const { runningJobs } = useBackgroundJob();
</script>

<template>
  <BListGroup class="ms-2">
    <BListGroupItem v-for="(job, key) in runningJobs" :key="key" class="d-flex gap-2" :title="key">
      <i-mdi-download-box-outline v-if="job.job_category === 'download_data'" />

      <div>{{ job.job_category }} {{ job.status }} {{ job.progress }}</div>
      <BProgress class="w-100 flex-grow" :value="job.progress" show-progress :max="100" striped />
    </BListGroupItem>
  </BListGroup>
</template>
