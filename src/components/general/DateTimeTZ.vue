<template>
  <span :title="timezoneTooltip">{{ formattedDate }}</span>
</template>

<script setup lang="ts">
import { timestampms, timestampmsWithTimezone, timestampToDateString } from '@/shared/formatters';

import { computed } from 'vue';

const props = defineProps({
  date: { required: true, type: Number },
  showTimezone: { required: false, type: Boolean, default: false },
  dateOnly: { required: false, type: Boolean, default: false },
});
const formattedDate = computed((): string => {
  if (props.dateOnly) {
    return timestampToDateString(props.date);
  }
  if (props.showTimezone) {
    return timestampmsWithTimezone(props.date);
  }
  return timestampms(props.date);
});

const timezoneTooltip = computed((): string => {
  const time1 = timestampmsWithTimezone(props.date);
  const timeUTC = timestampmsWithTimezone(props.date, 'UTC');
  if (time1 === timeUTC) {
    return timeUTC;
  }

  return `${time1}\n${timeUTC}`;
});
</script>

<style scoped></style>
