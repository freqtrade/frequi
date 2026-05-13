<script setup lang="ts">
import { CalendarDate } from '@internationalized/date';

const now = new Date();
const maxDateNow = new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
const maxDateTomorrow = maxDateNow.add({ days: 1 });

const props = withDefaults(
  defineProps<{
    modelValue: string;
  }>(),
  {},
);
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const dateFromText = ref('');
const dateToText = ref('');
const popoverFromOpen = ref(false);
const popoverToOpen = ref(false);

function calendarDateToTimeRangeString(d: CalendarDate | null): string {
  if (!d) return '';
  return `${d.year}${String(d.month).padStart(2, '0')}${String(d.day).padStart(2, '0')}`;
}

function calendarDateToInputString(d: CalendarDate | null): string {
  if (!d) return '';
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

function parseInputText(text: string): CalendarDate | null {
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return new CalendarDate(parseInt(match[1]!), parseInt(match[2]!), parseInt(match[3]!));
  }
  return null;
}

const dateFrom = computed(() => parseInputText(dateFromText.value));
const dateTo = computed(() => parseInputText(dateToText.value));

const timeRange = computed(() => {
  if (dateFrom.value || dateTo.value) {
    return `${calendarDateToTimeRangeString(dateFrom.value)}-${calendarDateToTimeRangeString(dateTo.value)}`;
  }
  return '';
});

function jsDateToInputString(d: Date): string {
  return calendarDateToInputString(
    new CalendarDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()),
  );
}

function onFromCalendarSelect(v: unknown) {
  const d = v as CalendarDate;
  dateFromText.value = calendarDateToInputString(d);
  popoverFromOpen.value = false;
}

function onToCalendarSelect(v: unknown) {
  const d = v as CalendarDate;
  dateToText.value = calendarDateToInputString(d);
  popoverToOpen.value = false;
}

function updateInput() {
  const tr = props.modelValue.split('-');
  if (tr[0]) {
    const d =
      tr[0].length === 8 ? dateFromString(tr[0], 'yyyyMMdd') : new Date(parseInt(tr[0]) * 1000);
    dateFromText.value = jsDateToInputString(d);
  } else {
    dateFromText.value = '';
  }
  if (tr.length > 1 && tr[1]) {
    const d =
      tr[1].length === 8 ? dateFromString(tr[1], 'yyyyMMdd') : new Date(parseInt(tr[1]) * 1000);
    dateToText.value = jsDateToInputString(d);
  } else {
    dateToText.value = '';
  }
}

watch(
  () => timeRange.value,
  () => emit('update:modelValue', timeRange.value),
);
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== timeRange.value) {
      updateInput();
    }
  },
);

onMounted(() => {
  if (!props.modelValue) {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    dateFromText.value = calendarDateToInputString(
      new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate()),
    );
  } else {
    updateInput();
  }
  emit('update:modelValue', timeRange.value);
});
</script>

<template>
  <div>
    <div class="flex gap-2">
      <UFormField label="Start Date">
        <UInput id="dateFrom" v-model="dateFromText" placeholder="yyyy-mm-dd" class="flex-1">
          <template #trailing>
            <UButton
              v-if="dateFromText"
              icon="mdi:close"
              color="neutral"
              variant="ghost"
              size="xs"
              title="Clear start date"
              @click="dateFromText = ''"
            />
            <UPopover v-model:open="popoverFromOpen">
              <UButton icon="mdi:calendar-blank" color="neutral" variant="ghost" size="sm" />
              <template #content>
                <UCalendar
                  :model-value="dateFrom"
                  :max-value="maxDateNow"
                  @update:model-value="onFromCalendarSelect"
                />
              </template>
            </UPopover>
          </template>
        </UInput>
      </UFormField>
      <UFormField label="End Date">
        <UInput id="dateTo" v-model="dateToText" placeholder="yyyy-mm-dd" class="flex-1">
          <template #trailing>
            <UButton
              v-if="dateToText"
              icon="mdi:close"
              color="neutral"
              variant="ghost"
              size="xs"
              title="Clear end date"
              @click="dateToText = ''"
            />
            <UPopover v-model:open="popoverToOpen">
              <UButton icon="mdi:calendar-blank" color="neutral" variant="ghost" size="sm" />
              <template #content>
                <UCalendar
                  :model-value="dateTo"
                  :max-value="maxDateTomorrow"
                  @update:model-value="onToCalendarSelect"
                />
              </template>
            </UPopover>
          </template>
        </UInput>
      </UFormField>
    </div>

    <div class="mt-1 text-start">
      Timerange: <b>{{ timeRange }}</b>
    </div>
  </div>
</template>
