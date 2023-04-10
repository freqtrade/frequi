<template>
  <div>
    <div class="d-flex justify-content-center">
      <div>
        <label for="dateFrom">Start Date</label>
        <Datepicker
          id="dateFrom"
          v-model="dateFrom"
          :dark="settingsStore.isDarkTheme"
          :max-date="now"
          model-type="yyyy-MM-dd"
          format="yyyy-MM-dd"
          text-input
          auto-apply
          :enable-time-picker="false"
        ></Datepicker>
      </div>
      <div class="ms-2">
        <label for="dateTo">End Date</label>
        <Datepicker
          v-model="dateTo"
          :dark="settingsStore.isDarkTheme"
          :max-date="now"
          model-type="yyyy-MM-dd"
          format="yyyy-MM-dd"
          text-input
          auto-apply
          :enable-time-picker="false"
        ></Datepicker>
      </div>
    </div>

    <label class="mt-1 text-start">
      Timerange: <b>{{ timeRange }}</b>
    </label>
  </div>
</template>

<script setup lang="ts">
import { dateFromString, dateStringToTimeRange, timestampToDateString } from '@/shared/formatters';
import { ref, computed, onMounted, watch } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useSettingsStore } from '@/stores/settings';

const settingsStore = useSettingsStore();

const now = new Date();
const dateFrom = ref<string>('');
const dateTo = ref<string>('');

const props = defineProps({
  modelValue: { required: true, type: String },
});
const emit = defineEmits(['update:modelValue']);

const timeRange = computed(() => {
  if (dateFrom.value !== '' || dateTo.value !== '') {
    return `${dateStringToTimeRange(dateFrom.value)}-${dateStringToTimeRange(dateTo.value)}`;
  }
  return '';
});

const updateInput = () => {
  const tr = props.modelValue.split('-');
  if (tr[0]) {
    dateFrom.value = timestampToDateString(dateFromString(tr[0], 'yyyyMMdd'));
  } else {
    dateFrom.value = '';
  }
  if (tr.length > 1 && tr[1]) {
    dateTo.value = timestampToDateString(dateFromString(tr[1], 'yyyyMMdd'));
  } else {
    dateTo.value = '';
  }
  emit('update:modelValue', timeRange.value);
};

watch(
  () => timeRange.value,
  () => emit('update:modelValue', timeRange.value),
);
watch(
  () => props.modelValue,
  () => {
    updateInput();
  },
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
