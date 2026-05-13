<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    date: number;
    showTimezone?: boolean;
    dateOnly?: boolean;
  }>(),
  {
    showTimezone: false,
    dateOnly: false,
  },
);
const formattedDate = computed((): string => {
  if (props.dateOnly) {
    return timestampToDateString(props.date);
  }
  if (props.showTimezone) {
    return timestampmsWithTimezone(props.date);
  }
  return timestampmsOrNa(props.date);
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

<template>
  <span :title="timezoneTooltip">{{ formattedDate }}</span>
</template>
