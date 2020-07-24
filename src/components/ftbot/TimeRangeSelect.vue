<template>
  <b-card class="row mb-2 mr-4">
    <b-list-group class="col-mb-4" horizontal="md">
      <b-form-group label="Start date" label-for="dp_dateFrom">
        <b-input-group>
          <b-input-group-prepend>
            <b-form-datepicker v-model="dateFrom" class="mb-2" button-only></b-form-datepicker>
          </b-input-group-prepend>
          <b-form-input
            id="dp_dateFrom"
            v-model="dateFrom"
            type="text"
            placeholder="YYYY-MM-DD"
            autocomplete="off"
          ></b-form-input>
        </b-input-group>
      </b-form-group>
      <b-form-group class="ml-2" label="End date" label-for="dp_dateTo">
        <b-input-group>
          <b-input-group-prepend>
            <b-form-datepicker v-model="dateTo" class="mb-2" button-only></b-form-datepicker>
          </b-input-group-prepend>
          <b-form-input
            id="dp_dateTo"
            v-model="dateTo"
            type="text"
            placeholder="YYYY-MM-DD"
            autocomplete="off"
          ></b-form-input>
        </b-input-group>
      </b-form-group>
      <label
        >Timerange: <b>{{ timeRange }}</b></label
      >
    </b-list-group>
  </b-card>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator';
import { dateStringToTimeRange, timestampToDateString } from '@/shared/formatters';

const now = new Date();
@Component({})
export default class TimeRangeSelect extends Vue {
  dateFrom = timestampToDateString(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  dateTo = '';

  @Emit('input')
  emitTimeRange() {
    return this.timeRange;
  }

  created() {
    this.emitTimeRange();
  }

  updated() {
    this.emitTimeRange();
  }

  get timeRange() {
    if (this.dateFrom !== '' || this.dateTo !== '') {
      return `${dateStringToTimeRange(this.dateFrom)}-${dateStringToTimeRange(this.dateTo)}`;
    }
    return '';
  }
}
</script>

<style scoped>
</style>
