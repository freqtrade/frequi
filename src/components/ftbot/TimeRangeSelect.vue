<script setup lang="ts">
import { CalendarDate, Time } from '@internationalized/date';
import type { TimeValue } from 'reka-ui';

const now = new Date();
const maxDateNow = new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
const maxDateTomorrow = maxDateNow.add({ days: 1 });

const props = defineProps<{
  /** Whether the bot this timerange is sent to supports hour/minute precision (API 2.50) */
  canUseTime: boolean;
}>();

const timeRangeModel = defineModel<string>({ required: true });

const dateFromText = ref('');
const dateToText = ref('');
const timeFrom = shallowRef<TimeValue | null>(null);
const timeTo = shallowRef<TimeValue | null>(null);
/** Use hour/minute precision - requires API 2.50 */
const withTime = ref(false);
const withSeconds = ref(false);
const popoverFromOpen = ref(false);
const popoverToOpen = ref(false);

const useTime = computed(() => withTime.value && props.canUseTime);

/** Only show the seconds segment if the timerange actually uses seconds */
const granularity = computed(() => (withSeconds.value ? 'second' : 'minute'));

function timeToInputString(time: TimeValue | null): string {
  if (!time) return '';
  const result = `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
  return time.second ? `${result}:${String(time.second).padStart(2, '0')}` : result;
}

function parseTimeText(text: string): Time | null {
  const match = text.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (match) {
    return new Time(parseInt(match[1]!), parseInt(match[2]!), match[3] ? parseInt(match[3]) : 0);
  }
  return null;
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
  const fromTime = useTime.value ? timeToInputString(timeFrom.value) : '';
  const toTime = useTime.value ? timeToInputString(timeTo.value) : '';
  const from = inputToTimeRangePart(dateFromText.value, fromTime);
  const to = inputToTimeRangePart(dateToText.value, toTime);
  if (from || to) {
    return `${from}-${to}`;
  }
  return '';
});

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
  const tr = timeRangeModel.value.split('-');
  const from = timeRangePartToInput(tr[0] ?? '');
  const to = timeRangePartToInput(tr[1] ?? '');
  dateFromText.value = from?.date ?? '';
  timeFrom.value = parseTimeText(from?.time ?? '');
  dateToText.value = to?.date ?? '';
  timeTo.value = parseTimeText(to?.time ?? '');
  withSeconds.value = !!(timeFrom.value?.second || timeTo.value?.second);
  if (timeFrom.value || timeTo.value) {
    withTime.value = true;
  }
}

watch(
  () => timeRange.value,
  () => {
    timeRangeModel.value = timeRange.value;
  },
);
watch(timeRangeModel, (newValue) => {
  if (newValue !== timeRange.value) {
    updateInput();
  }
});

onMounted(() => {
  if (!timeRangeModel.value) {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    dateFromText.value = calendarDateToInputString(
      new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate()),
    );
  } else {
    updateInput();
  }
  timeRangeModel.value = timeRange.value;
});
</script>

<template>
  <div>
    <div class="flex gap-2">
      <div class="flex flex-1 min-w-0 gap-1">
        <UFormField label="Start Date" class="flex-1 min-w-0">
          <UInput v-model="dateFromText" placeholder="yyyy-mm-dd" class="flex-1 min-w-0">
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
        <UFormField v-if="useTime" label="Time">
          <UInputTime
            v-model="timeFrom"
            :hour-cycle="24"
            :granularity="granularity"
            title="Start time (UTC)"
          />
        </UFormField>
      </div>
      <div class="flex flex-1 min-w-0 gap-1">
        <UFormField label="End Date" class="flex-1 min-w-0">
          <UInput v-model="dateToText" placeholder="yyyy-mm-dd" class="flex-1 min-w-0">
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
        <UFormField v-if="useTime" label="Time">
          <UInputTime
            v-model="timeTo"
            :hour-cycle="24"
            :granularity="granularity"
            title="End time (UTC)"
          />
        </UFormField>
      </div>
    </div>

    <div class="mt-1 flex flex-wrap items-center justify-between gap-x-3">
      <BaseCheckbox
        v-if="canUseTime"
        v-model="withTime"
        title="Select the timerange with hour/minute precision (in UTC)"
      >
        Use time
      </BaseCheckbox>
      <div class="text-start">
        Timerange: <b>{{ timeRange }}</b>
      </div>
    </div>
  </div>
</template>
