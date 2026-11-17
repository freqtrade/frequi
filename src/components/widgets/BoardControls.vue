<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import { BOARD_TEMPLATES } from '@/widgets/defaultBoards';

const boardsStore = useBoardsStore();
const router = useRouter();
const { confirm } = useConfirmBox();

const board = computed(() =>
  boardsStore.activeBoardId ? boardsStore.boards[boardsStore.activeBoardId] : undefined,
);

const renameOpen = ref(false);
const newName = ref('');
const fileInput = useTemplateRef<HTMLInputElement>('fileInput');

function startRename() {
  newName.value = board.value?.name ?? '';
  renameOpen.value = true;
}
function saveRename() {
  if (board.value) boardsStore.renameBoard(board.value.id, newName.value);
  renameOpen.value = false;
}

function download(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCurrent() {
  if (!board.value) return;
  const data = boardsStore.exportBoard(board.value.id);
  const slug = board.value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  download(`frequi-board-${slug}.json`, data);
}

async function onImportFile(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  try {
    const id = boardsStore.importBoard(JSON.parse(await file.text()));
    showAlert(`Board "${boardsStore.boards[id]?.name}" imported.`, 'success');
    if (id.startsWith('custom-')) await router.push(`/board/${id}`);
  } catch (err) {
    showAlert(`Import failed: ${(err as Error).message}`, 'error');
  }
}

async function resetCurrent() {
  if (!board.value) return;
  if (
    await confirm({
      title: 'Reset board',
      message: `Reset "${board.value.name}" to its default widgets and layout?`,
      confirmText: 'Reset',
    })
  ) {
    boardsStore.resetBoard(board.value.id);
  }
}

async function deleteCurrent() {
  if (!board.value || board.value.builtIn) return;
  if (
    await confirm({
      title: 'Delete board',
      description: 'This cannot be undone. Export it first if you want to keep a copy.',
      message: `Delete "${board.value.name}"?`,
      confirmText: 'Delete',
    })
  ) {
    boardsStore.deleteBoard(board.value.id);
    await router.push('/dashboard');
  }
}

async function applyTemplate(key: string, label: string) {
  if (!board.value) return;
  if (
    await confirm({
      title: 'Apply template',
      message: `Replace the widgets on "${board.value.name}" with the "${label}" template?`,
      confirmText: 'Apply',
    })
  ) {
    boardsStore.applyTemplate(board.value.id, key);
  }
}

async function duplicateCurrent() {
  if (!board.value) return;
  const copy = boardsStore.duplicateBoard(board.value.id);
  if (copy) await router.push(`/board/${copy.id}`);
}

const menuItems = computed<DropdownMenuItem[][]>(() => [
  [
    { label: 'Rename board', icon: 'i-mdi-pencil-outline', onSelect: startRename },
    { label: 'Duplicate board', icon: 'i-mdi-content-copy', onSelect: duplicateCurrent },
    {
      label: 'Apply template',
      icon: 'i-mdi-view-dashboard-edit-outline',
      children: BOARD_TEMPLATES.map((t) => ({
        label: t.label,
        description: t.description,
        onSelect: () => applyTemplate(t.key, t.label),
      })),
    },
  ],
  [
    { label: 'Export board', icon: 'i-mdi-export', onSelect: exportCurrent },
    { label: 'Import board', icon: 'i-mdi-import', onSelect: () => fileInput.value?.click() },
  ],
  [
    ...(board.value?.builtIn
      ? [{ label: 'Reset to default', icon: 'i-mdi-restore', onSelect: resetCurrent }]
      : [
          {
            label: 'Delete board',
            icon: 'i-mdi-delete-outline',
            color: 'error' as const,
            onSelect: deleteCurrent,
          },
        ]),
  ],
]);
</script>

<template>
  <div v-if="board" class="flex items-center gap-1">
    <template v-if="boardsStore.editing">
      <UButton
        size="sm"
        icon="i-mdi-plus"
        label="Add widget"
        @click="boardsStore.galleryOpen = true"
      />
      <UButton
        size="sm"
        color="neutral"
        variant="solid"
        icon="i-mdi-check"
        label="Done"
        @click="boardsStore.editing = false"
      />
    </template>
    <UButton
      v-else
      size="sm"
      color="neutral"
      variant="ghost"
      icon="i-mdi-view-dashboard-edit-outline"
      label="Customize"
      title="Rearrange, add and configure widgets"
      @click="boardsStore.editing = true"
    />
    <UPopover v-model:open="renameOpen">
      <UDropdownMenu :items="menuItems" :content="{ align: 'start' }">
        <UButton
          size="sm"
          color="neutral"
          variant="ghost"
          icon="i-mdi-dots-horizontal"
          aria-label="Board options"
          title="Board options"
        />
      </UDropdownMenu>
      <template #content>
        <form class="flex gap-2 p-2" @submit.prevent="saveRename">
          <UInput v-model="newName" autofocus aria-label="Board name" />
          <UButton type="submit" size="sm" label="Save" />
        </form>
      </template>
    </UPopover>
    <input
      ref="fileInput"
      type="file"
      accept="application/json,.json"
      class="hidden"
      @change="onImportFile"
    />
  </div>
</template>
