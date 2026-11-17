<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import type { WidgetInstance } from '@/widgets/types';
import { DISPLAY_LABELS, SOURCES } from '@/widgets/sources';

const props = defineProps<{ boardId: string; widget: WidgetInstance; editing: boolean }>();

const boardsStore = useBoardsStore();
// Widgets live in the boards store; edit them through this alias.
const editable = computed(() => props.widget);
const source = computed(() => SOURCES[props.widget.source]);
const title = computed(() => props.widget.title || source.value?.label || props.widget.source);

const displayItems = computed<DropdownMenuItem[]>(() =>
  (source.value?.displays ?? []).map((d) => ({
    label: DISPLAY_LABELS[d]?.label ?? d,
    icon: DISPLAY_LABELS[d]?.icon,
    type: 'checkbox' as const,
    checked: props.widget.display === d,
    onSelect: () => {
      editable.value.display = d;
    },
  })),
);
</script>

<template>
  <div class="glass flex h-full w-full flex-col overflow-hidden rounded-2xl">
    <div
      class="drag-header flex shrink-0 items-center gap-2 border-b border-(--ft-glass-border) bg-white/3 py-1 ps-3 pe-1"
      :class="[editing ? 'cursor-move' : '', widget.collapsed ? 'border-b-0' : '']"
    >
      <UIcon
        v-if="editing"
        name="i-mdi-drag"
        class="size-4 shrink-0 text-muted"
        aria-hidden="true"
      />
      <UIcon
        v-else-if="source"
        :name="source.icon"
        class="size-4 shrink-0 text-primary"
        aria-hidden="true"
      />
      <span class="truncate text-sm font-semibold tracking-wide text-muted uppercase">
        {{ title }}
      </span>

      <div class="ms-auto flex shrink-0 items-center">
        <UDropdownMenu v-if="(source?.displays.length ?? 0) > 1" :items="displayItems">
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            :icon="DISPLAY_LABELS[widget.display]?.icon"
            :title="`Display: ${DISPLAY_LABELS[widget.display]?.label}`"
            aria-label="Change display type"
          />
        </UDropdownMenu>
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-mdi-tune-variant"
          title="Widget settings"
          aria-label="Widget settings"
          @click="boardsStore.openSettings(widget.id)"
        />
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          :icon="widget.collapsed ? 'i-mdi-chevron-down' : 'i-mdi-chevron-up'"
          :title="widget.collapsed ? 'Expand' : 'Minimize'"
          :aria-label="widget.collapsed ? 'Expand widget' : 'Minimize widget'"
          @click="boardsStore.toggleCollapsed(boardId, widget.id)"
        />
        <template v-if="editing">
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-mdi-content-copy"
            title="Duplicate"
            aria-label="Duplicate widget"
            @click="boardsStore.duplicateWidget(boardId, widget.id)"
          />
          <UButton
            size="xs"
            color="error"
            variant="ghost"
            icon="i-mdi-close"
            title="Remove"
            aria-label="Remove widget"
            @click="boardsStore.removeWidget(boardId, widget.id)"
          />
        </template>
      </div>
    </div>
    <div v-if="!widget.collapsed" class="min-h-0 grow overflow-auto">
      <WidgetRenderer :widget="widget" />
    </div>
  </div>
</template>
