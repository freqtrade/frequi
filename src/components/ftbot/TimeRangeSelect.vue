<script setup lang="ts">
import { CalendarDate, Time } from '@internationalized/date';
import type { DateValue, TimeValue } from 'reka-ui';

const now = new Date();
const maxDateNow = new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
const maxDateTomorrow = maxDateNow.add({ days: 1 });

/** Locale forcing the yyyy-mm-dd segment order of the date inputs */
const dateLocale = 'en-CA';

const props = defineProps<{
  /** Whether the bot this timerange is sent to supports hour/minute precision (API 2.50) */
  canUseTime: boolean;
}>();

const timeRangeModel = defineModel<string>({ required: true });

const dateFrom = shallowRef<DateValue | null>(null);
const dateTo = shallowRef<DateValue | null>(null);
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

function dateToInputString(d: DateValue | null): string {
  if (!d) return '';
  return `${String(d.year).padStart(4, '0')}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

function parseInputText(text: string): CalendarDate | null {
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return new CalendarDate(parseInt(match[1]!), parseInt(match[2]!), parseInt(match[3]!));
  }
  return null;
}

const timeRange = computed(() => {
  const fromTime = useTime.value ? timeToInputString(timeFrom.value) : '';
  const toTime = useTime.value ? timeToInputString(timeTo.value) : '';
  const from = inputToTimeRangePart(dateToInputString(dateFrom.value), fromTime);
  const to = inputToTimeRangePart(dateToInputString(dateTo.value), toTime);
  if (from || to) {
    return `${from}-${to}`;
  }
  return '';
});

function onFromCalendarSelect(v: unknown) {
  dateFrom.value = v as DateValue;
  popoverFromOpen.value = false;
}

function onToCalendarSelect(v: unknown) {
  dateTo.value = v as DateValue;
  popoverToOpen.value = false;
}

function updateInput() {
  const tr = timeRangeModel.value.split('-');
  const from = timeRangePartToInput(tr[0] ?? '');
  const to = timeRangePartToInput(tr[1] ?? '');
  dateFrom.value = parseInputText(from?.date ?? '');
  timeFrom.value = parseTimeText(from?.time ?? '');
  dateTo.value = parseInputText(to?.date ?? '');
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
    dateFrom.value = new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
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
          <UInputDate
            v-model="dateFrom"
            :locale="dateLocale"
            :max-value="maxDateNow"
            :ui="{ base: 'pe-14' }"
            title="Start date (yyyy-mm-dd, UTC)"
          >
            <template #trailing>
              <UButton
                v-if="dateFrom"
                icon="mdi:close"
                color="neutral"
                variant="ghost"
                size="xs"
                title="Clear start date"
                @click="dateFrom = null"
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
          </UInputDate>
        </UFormField>
        <UFormField v-if="useTime" label="Time">
          <UInputTime
            v-model="timeFrom"
            :hour-cycle="24"
            :granularity="granularity"
            title="Start time (UTC)"
          >
            <template #trailing>
              <UButton
                v-if="timeFrom"
                icon="mdi:close"
                color="neutral"
                variant="ghost"
                size="xs"
                title="Clear start time"
                @click="timeFrom = null"
              />
            </template>
          </UInputTime>
        </UFormField>
      </div>
      <div class="flex flex-1 min-w-0 gap-1">
        <UFormField label="End Date" class="flex-1 min-w-0">
          <UInputDate
            v-model="dateTo"
            :locale="dateLocale"
            :max-value="maxDateTomorrow"
            :ui="{ base: 'pe-14' }"
            title="End date (yyyy-mm-dd, UTC)"
          >
            <template #trailing>
              <UButton
                v-if="dateTo"
                icon="mdi:close"
                color="neutral"
                variant="ghost"
                size="xs"
                title="Clear end date"
                @click="dateTo = null"
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
          </UInputDate>
        </UFormField>
        <UFormField v-if="useTime" label="Time">
          <UInputTime
            v-model="timeTo"
            :hour-cycle="24"
            :granularity="granularity"
            title="End time (UTC)"
          >
            <template #trailing>
              <UButton
                v-if="timeTo"
                icon="mdi:close"
                color="neutral"
                variant="ghost"
                size="xs"
                title="Clear end time"
                @click="timeTo = null"
              /> </template
          ></UInputTime>
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
