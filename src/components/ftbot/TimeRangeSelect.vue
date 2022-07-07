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
import { dateFromString, dateStringToTimeRange, timestampToDateString } from '@/shared/formatters';
import { defineComponent, ref, computed, onMounted, watch } from 'vue';

const now = new Date();

export default defineComponent({
  name: 'TimeRangeSelect',
  props: {
    value: { required: true, type: String },
  },
  setup(props, { emit }) {
    const dateFrom = ref<string>('');
    const dateTo = ref<string>('');

    const timeRange = computed(() => {
      if (dateFrom.value !== '' || dateTo.value !== '') {
        return `${dateStringToTimeRange(dateFrom.value)}-${dateStringToTimeRange(dateTo.value)}`;
      }
      return '';
    });

    const updated = () => {
      emit('input', timeRange.value);
    };

    const updateInput = () => {
      const tr = props.value.split('-');
      if (tr[0]) {
        dateFrom.value = timestampToDateString(dateFromString(tr[0], 'yyyyMMdd'));
      }
      if (tr.length > 1 && tr[1]) {
        dateTo.value = timestampToDateString(dateFromString(tr[1], 'yyyyMMdd'));
      }
      updated();
    };

    watch(
      () => timeRange.value,
      () => updated(),
    );

    onMounted(() => {
      if (!props.value) {
        dateFrom.value = timestampToDateString(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      } else {
        updateInput();
      }
      emit('input', timeRange.value);
    });

    return {
      dateFrom,
      dateTo,
      timeRange,
      updated,
    };
  },
});
</script>

<style scoped></style>
