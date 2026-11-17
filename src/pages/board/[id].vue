<script setup lang="ts">
const route = useRoute('/board/[id]');
const boardsStore = useBoardsStore();
const boardId = computed(() => String(route.params.id));
</script>

<template>
  <WidgetBoard v-if="boardsStore.boards[boardId]" :board-id="boardId" />
  <div v-else class="flex h-full flex-col items-center justify-center gap-3 p-6 text-muted">
    <UIcon name="i-mdi-view-grid-off-outline" class="size-10" />
    <p>This board does not exist (anymore).</p>
    <UButton to="/dashboard" color="neutral" variant="outline">Go to dashboard</UButton>
  </div>
</template>
