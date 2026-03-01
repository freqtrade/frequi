<script setup lang="ts">
import type { Lock } from '@/types';
import type { TableColumn } from '@nuxt/ui';

const botStore = useBotStore();

const columns: TableColumn<Lock>[] = [
  { accessorKey: 'pair', header: 'Pair' },
  { accessorKey: 'lock_end_timestamp', header: 'Until' },
  { accessorKey: 'reason', header: 'Reason' },
  { id: 'actions', header: 'Actions' },
];

function removePairLock(item: Lock) {
  console.log(item);
  if (item.id !== undefined) {
    botStore.activeBot.deleteLock(item.id);
  } else {
    showAlert('This Freqtrade version does not support deleting locks.');
  }
}
// TODO: nuxtui -> columns should resize instead of showing a horizontal scrollbar when the content.
</script>

<template>
  <div>
    <div class="mb-2">
      <label class="me-auto text-xl">Pair Locks</label>
      <UButton
        class="float-end"
        color="neutral"
        icon="mdi:refresh"
        @click="botStore.activeBot.getLocks"
      />
    </div>
    <UTable :data="botStore.activeBot.activeLocks" :columns="columns">
      <template #lock_end_timestamp-cell="{ row }">
        {{ timestampms(row.original.lock_end_timestamp) }}
      </template>
      <template #actions-cell="{ row }">
        <UButton
          class="btn-xs ms-1"
          size="sm"
          color="neutral"
          title="Delete Lock"
          icon="mdi:delete"
          @click="removePairLock(row.original)"
        />
      </template>
    </UTable>
  </div>
</template>
