<script setup lang="ts">
import type { ColumnDef, ListDef, Row } from '@/widgets/types';
import { formatValue, toneColor } from '@/widgets/helpers';

const props = withDefaults(
  defineProps<{
    rows: Row[];
    def: ListDef;
    columns: ColumnDef[];
    stake?: string;
    clickable?: boolean;
    limit?: number;
    selectedId?: number | null;
  }>(),
  { stake: '', clickable: false, limit: 200, selectedId: null },
);

const emit = defineEmits<{ rowClick: [row: Row] }>();

const colFor = (key?: string) => props.columns.find((c) => c.key === key);
const valueCol = computed(() => colFor(props.def.value));
const secondaryCol = computed(() => colFor(props.def.secondary));
</script>

<template>
  <ul class="flex flex-col gap-1.5 p-2">
    <li
      v-for="(row, idx) in rows.slice(0, limit)"
      :key="idx"
      class="flex items-center gap-3 rounded-xl border border-(--ft-glass-border) bg-white/3 px-3 py-2 transition-colors"
      :class="[
        clickable ? 'cursor-pointer hover:bg-white/6' : '',
        selectedId !== null && row.trade_id === selectedId ? 'ring-1 ring-primary' : '',
      ]"
      @click="clickable && emit('rowClick', row)"
    >
      <div class="min-w-0 grow">
        <div class="truncate font-medium">{{ def.title(row) }}</div>
        <div v-if="def.subtitle" class="truncate text-xs text-muted">{{ def.subtitle(row) }}</div>
      </div>
      <div v-if="valueCol" class="text-right">
        <div
          class="font-semibold tabular-nums"
          :style="valueCol.tone ? { color: toneColor(row[valueCol.key]) } : undefined"
        >
          {{ formatValue(row[valueCol.key], valueCol.format, stake) }}
        </div>
        <div
          v-if="secondaryCol"
          class="text-xs tabular-nums"
          :style="secondaryCol.tone ? { color: toneColor(row[secondaryCol.key]) } : undefined"
        >
          {{ formatValue(row[secondaryCol.key], secondaryCol.format, stake) }}
        </div>
      </div>
    </li>
    <li v-if="rows.length === 0" class="py-6 text-center text-sm text-muted">Nothing to show.</li>
  </ul>
</template>
