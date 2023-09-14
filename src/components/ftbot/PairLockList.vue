<template>
  <div>
    <div class="mb-2">
      <label class="me-auto h3">Pair Locks</label>
      <b-button class="float-end" size="sm" @click="botStore.activeBot.getLocks">
        <i-mdi-refresh />
      </b-button>
    </div>
    <div>
      <b-table class="table-sm" :items="botStore.activeBot.activeLocks" :fields="tableFields">
        <template #cell(actions)="row">
          <b-button
            class="btn-xs ms-1"
            size="sm"
            title="Delete trade"
            @click="removePairLock(row.item as unknown as Lock)"
          >
            <i-mdi-delete />
          </b-button>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { timestampms } from '@/shared/formatters';
import { Lock } from '@/types';

import { showAlert } from '@/stores/alerts';
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

<style scoped></style>
