<script setup lang="ts">
import type { ValueFormat } from '@/widgets/types';
import { formatValue, toneColor } from '@/widgets/helpers';

const props = withDefaults(
  defineProps<{
    items: { key: string; value: number; count?: number }[];
    format?: ValueFormat;
    stake?: string;
    /** Color values by sign */
    tone?: boolean;
  }>(),
  { format: 'number', stake: '', tone: true },
);

const maxAbs = computed(() => Math.max(1e-12, ...props.items.map((i) => Math.abs(i.value))));
const medals = ['i-mdi-medal', 'i-mdi-medal-outline', 'i-mdi-medal-outline'];
</script>

<template>
  <ol class="flex flex-col gap-1 p-2">
    <li
      v-for="(item, idx) in items"
      :key="item.key"
      class="relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2"
    >
      <!-- Bar behind the row, proportional to the value -->
      <div
        class="absolute inset-y-0 left-0 rounded-xl opacity-15"
        :style="{
          width: `${(Math.abs(item.value) / maxAbs) * 100}%`,
          backgroundColor: tone
            ? (toneColor(item.value) ?? 'var(--color-brand-400)')
            : 'var(--color-brand-400)',
        }"
        aria-hidden="true"
      />
      <span class="relative w-6 shrink-0 text-center text-sm font-semibold text-muted tabular-nums">
        <UIcon
          v-if="idx < 3"
          :name="medals[idx]!"
          class="size-5"
          :class="['text-amber-400', 'text-slate-300', 'text-orange-400'][idx]"
        />
        <template v-else>{{ idx + 1 }}</template>
      </span>
      <span class="relative min-w-0 grow truncate font-medium">{{ item.key }}</span>
      <span v-if="item.count !== undefined" class="relative text-xs text-muted tabular-nums">
        {{ item.count }} trades
      </span>
      <span
        class="relative font-semibold tabular-nums"
        :style="tone ? { color: toneColor(item.value) } : undefined"
      >
        {{ formatValue(item.value, format, stake) }}
      </span>
    </li>
    <li v-if="items.length === 0" class="py-6 text-center text-sm text-muted">Nothing to rank.</li>
  </ol>
</template>
