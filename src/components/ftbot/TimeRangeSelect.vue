<template>
  <div>
    <div class="d-flex">
      <b-form-group class="col-md-6" label="Start date" label-for="dp_dateFrom">
        <b-input-group>
          <b-input-group-prepend>
            <b-form-datepicker v-model="dateFrom" class="mb-1" button-only></b-form-datepicker>
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
      <b-form-group class="ml-2 col-md-6" label="End date" label-for="dp_dateTo">
        <b-input-group>
          <b-input-group-prepend>
            <b-form-datepicker v-model="dateTo" class="mb-1" button-only></b-form-datepicker>
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
    </div>
    <label class="text-left">
      Timerange: <b>{{ timeRange }}</b>
    </label>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit, Prop, Watch } from 'vue-property-decorator';
import { dateFromString, dateStringToTimeRange, timestampToDateString } from '@/shared/formatters';

const now = new Date();
@Component({})
export default class TimeRangeSelect extends Vue {
  dateFrom = '';

  dateTo = '';

  @Prop() value!: string;

  @Emit('input')
  emitTimeRange() {
    return this.timeRange;
  }

  @Watch('value')
  valueChanged() {
    this.updateInput();
  }

  updateInput() {
    const tr = this.value.split('-');
    if (tr[0]) {
      this.dateFrom = timestampToDateString(dateFromString(tr[0], 'yyyyMMdd'));
    }
    if (tr.length > 1 && tr[1]) {
      this.dateTo = timestampToDateString(dateFromString(tr[1], 'yyyyMMdd'));
    }
  }

  created() {
    if (!this.value) {
      this.dateFrom = timestampToDateString(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    } else {
      this.updateInput();
    }
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

<style scoped></style>
