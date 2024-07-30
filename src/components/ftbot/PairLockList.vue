<script setup lang="ts">
import { Lock } from '@/types';

import { useBotStore } from '@/stores/ftbotwrapper';
import { TableField } from 'bootstrap-vue-next';
const botStore = useBotStore();

const tableFields: TableField[] = [
  { key: 'pair', label: 'Pair' },
  { key: 'lock_end_timestamp', label: 'Until', formatter: (value) => timestampms(value as number) },
  { key: 'reason', label: 'Reason' },
  { key: 'actions' },
];

const removePairLock = (item: Lock) => {
  console.log(item);
  if (item.id !== undefined) {
    botStore.activeBot.deleteLock(item.id);
  } else {
    showAlert('This Freqtrade version does not support deleting locks.');
  }
};
</script>

<template>
  <div>
    <div class="mb-2">
      <label class="me-auto h3">Pair Locks</label>
      <BButton class="float-end" size="sm" @click="botStore.activeBot.getLocks">
        <i-mdi-refresh />
      </BButton>
    </div>
    <div>
      <BTable class="table-sm" :items="botStore.activeBot.activeLocks" :fields="tableFields">
        <template #cell(actions)="row">
          <BButton
            class="btn-xs ms-1"
            size="sm"
            title="Delete trade"
            @click="removePairLock(row.item as unknown as Lock)"
          >
            <i-mdi-delete />
          </BButton>
        </template>
      </BTable>
    </div>
  </div>
</template>
