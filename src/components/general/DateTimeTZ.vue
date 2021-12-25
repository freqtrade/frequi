<template>
  <span :title="timezoneTooltip">{{ formattedDate }}</span>
</template>

<script lang="ts">
import { timestampms, timestampmsWithTimezone, timestampToDateString } from '@/shared/formatters';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class DateTimeTZ extends Vue {
  @Prop({ required: true, type: Number }) date!: number;

  @Prop({ required: false, type: Boolean, default: false }) showTimezone!: boolean;

  @Prop({ required: false, type: Boolean, default: false }) dateOnly!: boolean;

  timestampms = timestampms;

  get formattedDate(): string {
    if (this.dateOnly) {
      return timestampToDateString(this.date);
    }
    if (this.showTimezone) {
      return timestampmsWithTimezone(this.date);
    }
    return timestampms(this.date);
  }

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
