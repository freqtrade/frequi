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
      <b-form-group class="ms-2 col-md-6" label="End date" label-for="dp_dateTo">
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
    <label class="text-start">
      Timerange: <b>{{ timeRange }}</b>
    </label>
  </div>
</template>

<script setup lang="ts">
import { dateFromString, dateStringToTimeRange, timestampToDateString } from '@/shared/formatters';
import { ref, computed, onMounted, watch } from 'vue';

const now = new Date();

const props = defineProps({
  modelValue: { required: true, type: String },
});
const emit = defineEmits(['update:modelValue']);
const dateFrom = ref<string>('');
const dateTo = ref<string>('');

const timeRange = computed(() => {
  if (dateFrom.value !== '' || dateTo.value !== '') {
    return `${dateStringToTimeRange(dateFrom.value)}-${dateStringToTimeRange(dateTo.value)}`;
  }
  return '';
});

const updated = () => {
  emit('update:modelValue', timeRange.value);
};

const updateInput = () => {
  const tr = props.modelValue.split('-');
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
  if (!props.modelValue) {
    dateFrom.value = timestampToDateString(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  } else {
    updateInput();
  }
  emit('update:modelValue', timeRange.value);
});
</script>

<style scoped></style>
