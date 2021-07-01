<template>
  <span>{{ timestampms(date) }}</span>
</template>

<script lang="ts">
import { timestampms } from '@/shared/formatters';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class DateTimeTZ extends Vue {
  @Prop({ required: true, type: Number }) date!: number;

  timestampms = timestampms;
}
</script>

<style scoped></style>
