<script setup lang="ts">
import type { FeedItem } from '@/widgets/types';
import { formatValue, toneColor } from '@/widgets/helpers';

const props = withDefaults(defineProps<{ items: FeedItem[]; stake?: string; limit?: number }>(), {
  stake: '',
  limit: 150,
});

const toneClass: Record<string, string> = {
  profit: 'text-(--color-profit)',
  loss: 'text-(--color-loss)',
  warning: 'text-amber-400',
  neutral: 'text-primary',
};

/** Items grouped by day, newest first. */
const days = computed(() => {
  const groups = new Map<string, FeedItem[]>();
  [...props.items]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, props.limit)
    .forEach((item) => {
      const day = timestampToDateString(item.ts);
      const g = groups.get(day);
      if (g) g.push(item);
      else groups.set(day, [item]);
    });
  return [...groups];
});

const timeOf = (ts: number) => timestampms(ts).slice(11, 16);
</script>

<template>
  <div class="flex flex-col gap-3 p-3">
    <section v-for="[day, items] in days" :key="day">
      <h3 class="mb-1 text-xs font-semibold tracking-wider text-muted uppercase">{{ day }}</h3>
      <ol class="relative ms-2 border-s border-(--ft-glass-border)">
        <li v-for="(item, idx) in items" :key="idx" class="relative mb-2 ps-5">
          <span
            class="absolute -start-3 top-0.5 flex size-6 items-center justify-center rounded-full border border-(--ft-glass-border) bg-(--ui-bg)"
            :class="toneClass[item.tone ?? 'neutral']"
            aria-hidden="true"
          >
            <UIcon :name="item.icon" class="size-3.5" />
          </span>
          <div class="flex items-baseline gap-2">
            <span class="text-xs text-muted tabular-nums">{{ timeOf(item.ts) }}</span>
            <span class="min-w-0 grow truncate text-sm font-medium">{{ item.title }}</span>
            <span
              v-if="item.value !== undefined && item.value !== null"
              class="text-sm font-semibold tabular-nums"
              :style="{ color: toneColor(item.value) }"
            >
              {{ formatValue(item.value, item.valueFormat ?? 'number', stake) }}
            </span>
          </div>
          <div v-if="item.detail" class="truncate text-xs text-muted">{{ item.detail }}</div>
        </li>
      </ol>
    </section>
    <p v-if="days.length === 0" class="py-6 text-center text-sm text-muted">No activity yet.</p>
  </div>
</template>
