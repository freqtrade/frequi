<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core';
import type { GridItemData } from '@/types';

const props = defineProps<{ boardId: string }>();

const boardsStore = useBoardsStore();
const isMobile = useBreakpoints(breakpointsTailwind).smaller('md');

watch(
  () => props.boardId,
  (id, old) => {
    boardsStore.getBoard(id);
    boardsStore.activeBoardId = id;
    if (old !== undefined) {
      boardsStore.editing = false;
      boardsStore.settingsWidgetId = null;
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (boardsStore.activeBoardId === props.boardId) {
    boardsStore.activeBoardId = null;
    boardsStore.editing = false;
    boardsStore.galleryOpen = false;
    boardsStore.settingsWidgetId = null;
  }
});

const board = computed(() => boardsStore.boards[props.boardId]);
const editing = computed(() => boardsStore.editing);

/** A board with a single widget fills the page (e.g. Backtest, Logs) until it is edited. */
const fillWidget = computed(() =>
  !editing.value && board.value?.widgets.length === 1 && !board.value.widgets[0]!.collapsed
    ? board.value.widgets[0]
    : undefined,
);

function layoutFor(id: number): GridItemData {
  return board.value?.layout.find((l) => l.i === id) ?? { i: id, x: 0, y: 0, w: 6, h: 6 };
}

const gridLayout = computed(() => board.value?.layout ?? []);

/** Phone layout: widgets stacked in reading order. */
const stacked = computed(() =>
  [...(board.value?.widgets ?? [])].sort((a, b) => {
    const la = layoutFor(a.id);
    const lb = layoutFor(b.id);
    return la.y - lb.y || la.x - lb.x;
  }),
);

function stackedHeight(id: number, collapsed?: boolean, display?: string) {
  // Collapsed widgets and stat tiles size to their content on phones.
  if (collapsed || display === 'kpi') return undefined;
  return `${Math.min(640, Math.max(260, layoutFor(id).h * 50))}px`;
}

function layoutUpdated(newLayout: GridItemData[]) {
  if (!board.value || isMobile.value) return;
  board.value.layout = newLayout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }));
}
</script>

<template>
  <div v-if="board" class="h-full w-full">
    <!-- Single widget: full height, no frame -->
    <div v-if="fillWidget" class="h-full overflow-auto p-1 md:p-3">
      <WidgetRenderer :widget="fillWidget" />
    </div>

    <div v-else-if="board.widgets.length === 0" class="flex h-full items-center justify-center p-6">
      <div class="glass max-w-md rounded-2xl p-6 text-center">
        <UIcon name="i-mdi-view-grid-plus-outline" class="mb-2 size-10 text-primary" />
        <h2 class="mb-1 text-lg font-semibold">This board is empty</h2>
        <p class="mb-4 text-sm text-muted">
          Add widgets to show trades, profit, charts or tools, each as a table, chart, stat tiles or
          cards.
        </p>
        <UButton icon="i-mdi-plus" @click="boardsStore.galleryOpen = true">Add widget</UButton>
      </div>
    </div>

    <!-- Phone: stacked -->
    <div v-else-if="isMobile" class="flex flex-col gap-2 p-2">
      <div
        v-for="w in stacked"
        :key="w.id"
        class="board-stack-item"
        :style="{ height: stackedHeight(w.id, w.collapsed, w.display) }"
      >
        <WidgetCard :board-id="boardId" :widget="w" :editing="editing" />
      </div>
    </div>

    <!-- Desktop: grid -->
    <GridLayout
      v-else
      class="h-full w-full"
      :class="editing ? 'board-editing' : ''"
      :row-height="50"
      :layout="gridLayout"
      :vertical-compact="true"
      :margin="[6, 6]"
      :is-resizable="editing"
      :is-draggable="editing"
      :responsive="false"
      :col-num="12"
      @layout-updated="layoutUpdated"
    >
      <template #default="{ gridItemProps }">
        <GridItem
          v-for="w in board.widgets"
          :key="w.id"
          v-bind="gridItemProps"
          :i="w.id"
          :x="layoutFor(w.id).x"
          :y="layoutFor(w.id).y"
          :w="layoutFor(w.id).w"
          :h="layoutFor(w.id).h"
          :min-w="2"
          :min-h="1"
          :is-resizable="editing && !w.collapsed"
          drag-allow-from=".drag-header"
        >
          <WidgetCard :board-id="boardId" :widget="w" :editing="editing" />
        </GridItem>
      </template>
    </GridLayout>

    <WidgetGallery :board-id="boardId" />
    <WidgetSettings :board-id="boardId" />
  </div>
  <div v-else class="p-6 text-center text-muted">Board not found.</div>
</template>

<style scoped>
/* Dotted background while editing, so the grid is visible */
.board-editing {
  background-image: radial-gradient(var(--ft-glass-border) 1px, transparent 1px);
  background-size: 24px 24px;
}
</style>
