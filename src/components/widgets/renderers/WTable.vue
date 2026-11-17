<script setup lang="ts">
import type { ColumnDef, Row } from '@/widgets/types';
import { formatValue, toneColor } from '@/widgets/helpers';

const props = withDefaults(
  defineProps<{
    rows: Row[];
    columns: ColumnDef[];
    stake?: string;
    sortBy?: string;
    sortDesc?: boolean;
    pageSize?: number;
    clickable?: boolean;
    /** Value of `trade_id` to highlight */
    selectedId?: number | null;
  }>(),
  {
    stake: '',
    sortBy: undefined,
    sortDesc: true,
    pageSize: 25,
    clickable: false,
    selectedId: null,
  },
);

const emit = defineEmits<{
  rowClick: [row: Row];
  sort: [key: string, desc: boolean];
}>();

const page = ref(0);

const sorted = computed(() => {
  if (!props.sortBy) return props.rows;
  const key = props.sortBy;
  const dir = props.sortDesc ? -1 : 1;
  return [...props.rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av === bv) return 0;
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    return (av > bv ? 1 : -1) * dir;
  });
});

const pageCount = computed(() => Math.max(1, Math.ceil(sorted.value.length / props.pageSize)));
const visibleRows = computed(() =>
  sorted.value.slice(page.value * props.pageSize, (page.value + 1) * props.pageSize),
);

watch(
  () => [props.rows.length, props.pageSize],
  () => {
    if (page.value >= pageCount.value) page.value = 0;
  },
);

function toggleSort(key: string) {
  if (props.sortBy === key) {
    emit('sort', key, !props.sortDesc);
  } else {
    emit('sort', key, true);
  }
}

const numeric = (c: ColumnDef) => c.format && !['text', 'date', 'duration'].includes(c.format);
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="min-h-0 grow overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 z-10 bg-(--ui-bg)/90 backdrop-blur">
          <tr class="border-b border-(--ft-glass-border)">
            <th
              v-for="c in columns"
              :key="c.key"
              scope="col"
              class="px-3 text-xs font-semibold tracking-wide whitespace-nowrap text-muted uppercase"
              :class="numeric(c) ? 'text-right' : 'text-left'"
              :aria-sort="sortBy === c.key ? (sortDesc ? 'descending' : 'ascending') : 'none'"
            >
              <button
                type="button"
                class="inline-flex items-center gap-1 hover:text-default"
                @click="toggleSort(c.key)"
              >
                {{ c.label }}
                <UIcon
                  v-if="sortBy === c.key"
                  :name="sortDesc ? 'i-mdi-arrow-down' : 'i-mdi-arrow-up'"
                  class="size-3.5"
                />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in visibleRows"
            :key="idx"
            class="border-b border-(--ft-glass-border) transition-colors last:border-0"
            :class="[
              clickable ? 'cursor-pointer hover:bg-white/5' : '',
              selectedId !== null && row.trade_id === selectedId ? 'bg-primary/15' : '',
            ]"
            @click="clickable && emit('rowClick', row)"
          >
            <td
              v-for="c in columns"
              :key="c.key"
              class="px-3 whitespace-nowrap"
              :class="numeric(c) ? 'text-right tabular-nums' : 'text-left'"
              :style="c.tone ? { color: toneColor(row[c.key]) } : undefined"
            >
              {{ formatValue(row[c.key], c.format, stake) }}
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td :colspan="columns.length" class="px-3 py-6 text-center text-sm text-muted">
              Nothing to show.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-if="pageCount > 1"
      class="flex shrink-0 items-center justify-end gap-2 border-t border-(--ft-glass-border) px-3 py-1 text-xs text-muted"
    >
      <span>{{ rows.length }} rows · page {{ page + 1 }} / {{ pageCount }}</span>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        icon="i-mdi-chevron-left"
        aria-label="Previous page"
        :disabled="page === 0"
        @click="page--"
      />
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        icon="i-mdi-chevron-right"
        aria-label="Next page"
        :disabled="page >= pageCount - 1"
        @click="page++"
      />
    </div>
  </div>
</template>
