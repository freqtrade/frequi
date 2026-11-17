<script setup lang="ts">
import type { WidgetPreset } from '@/widgets/types';
import { CATEGORIES, DISPLAY_LABELS, SOURCE_LIST } from '@/widgets/sources';
import { WIDGET_PRESETS } from '@/widgets/presets';

const props = defineProps<{ boardId: string }>();

const boardsStore = useBoardsStore();
const search = ref('');
const VISUALIZATIONS = 'Visualizations';
const category = ref<string>(VISUALIZATIONS);

const open = computed({
  get: () => boardsStore.galleryOpen,
  set: (v: boolean) => (boardsStore.galleryOpen = v),
});

const matches = (label: string, description: string) => {
  const q = search.value.trim().toLowerCase();
  return !q || label.toLowerCase().includes(q) || description.toLowerCase().includes(q);
};

const showPresets = computed(() => category.value === VISUALIZATIONS || category.value === 'All');
const filteredPresets = computed(() =>
  showPresets.value ? WIDGET_PRESETS.filter((p) => matches(p.label, p.description)) : [],
);
const filteredSources = computed(() =>
  category.value === VISUALIZATIONS
    ? []
    : SOURCE_LIST.filter(
        (s) =>
          (category.value === 'All' || s.category === category.value) &&
          matches(s.label, s.description),
      ),
);

function finish(widgetId?: number) {
  open.value = false;
  search.value = '';
  if (widgetId) boardsStore.openSettings(widgetId);
}

function addSource(sourceId: string) {
  finish(boardsStore.addWidget(props.boardId, sourceId)?.id);
}

function addPreset(preset: WidgetPreset) {
  finish(boardsStore.addWidget(props.boardId, preset)?.id);
}

const cardClass =
  'flex gap-3 rounded-xl border border-(--ft-glass-border) bg-white/3 p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/10';
</script>

<template>
  <UModal
    v-model:open="open"
    title="Add widget"
    description="Pick a ready-made visualization, or any data source. Everything can be changed afterwards."
    :ui="{ content: 'sm:max-w-4xl' }"
  >
    <template #body>
      <div class="flex flex-col gap-3">
        <UInput
          v-model="search"
          icon="i-mdi-magnify"
          placeholder="Search widgets (e.g. calendar, heatmap, leaderboard)"
          autofocus
          class="w-full"
        />
        <div class="flex flex-wrap gap-1">
          <UButton
            v-for="c in [VISUALIZATIONS, 'All', ...CATEGORIES]"
            :key="c"
            size="xs"
            color="neutral"
            :variant="category === c ? 'solid' : 'ghost'"
            :icon="c === VISUALIZATIONS ? 'i-mdi-auto-fix' : undefined"
            @click="category = c"
            >{{ c }}</UButton
          >
        </div>
        <div
          class="grid max-h-[60vh] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3"
        >
          <button
            v-for="p in filteredPresets"
            :key="`preset-${p.key}`"
            type="button"
            :class="cardClass"
            @click="addPreset(p)"
          >
            <UIcon :name="p.icon" class="mt-0.5 size-6 shrink-0 text-primary" />
            <div class="min-w-0">
              <div class="font-medium">{{ p.label }}</div>
              <div class="text-xs text-muted">{{ p.description }}</div>
            </div>
          </button>
          <button
            v-for="s in filteredSources"
            :key="s.id"
            type="button"
            :class="cardClass"
            @click="addSource(s.id)"
          >
            <UIcon :name="s.icon" class="mt-0.5 size-6 shrink-0 text-primary" />
            <div class="min-w-0">
              <div class="font-medium">{{ s.label }}</div>
              <div class="mb-1.5 text-xs text-muted">{{ s.description }}</div>
              <div class="flex flex-wrap gap-1">
                <UBadge
                  v-for="d in s.displays"
                  :key="d"
                  size="sm"
                  color="neutral"
                  variant="subtle"
                  :icon="DISPLAY_LABELS[d]?.icon"
                  :label="DISPLAY_LABELS[d]?.label"
                />
              </div>
            </div>
          </button>
          <p
            v-if="filteredPresets.length === 0 && filteredSources.length === 0"
            class="col-span-full py-6 text-center text-sm text-muted"
          >
            No widget matches "{{ search }}".
          </p>
        </div>
      </div>
    </template>
  </UModal>
</template>
