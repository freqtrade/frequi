<template>
  <span :title="timezoneTooltip">{{ timestampms(date) }}</span>
</template>

<script lang="ts">
import { timestampms, timestampmsWithTimezone } from '@/shared/formatters';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class DateTimeTZ extends Vue {
  @Prop({ required: true, type: Number }) date!: number;

  timestampms = timestampms;

  get timezoneTooltip(): string {
    const time1 = timestampmsWithTimezone(this.date);
    const timeUTC = timestampmsWithTimezone(this.date, 'UTC');
    if (time1 === timeUTC) {
      return timeUTC;
    }

    return `${time1}\n${timeUTC}`;
  }
}
</script>

<style scoped></style>
