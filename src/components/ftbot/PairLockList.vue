<script setup lang="ts">
import type { Lock } from '@/types';

const botStore = useBotStore();
const { t } = useUiText();

function removePairLock(item: Lock) {
    console.log(item);
    if (item.id !== undefined) {
      botStore.activeBot.deleteLock(item.id);
    } else {
    showAlert('此版本的 Freqtrade 不支援刪除鎖定。');
    }
}
</script>

<template>
  <div>
    <div class="mb-2">
      <label class="me-auto text-xl">{{ t('pairLocks') }}</label>
      <Button class="float-end" severity="secondary" @click="botStore.activeBot.getLocks">
        <template #icon>
          <i-mdi-refresh />
        </template>
      </Button>
    </div>
    <div>
      <DataTable size="small" :value="botStore.activeBot.activeLocks">
        <Column field="pair" :header="t('pair')"></Column>
        <Column field="lock_end_timestamp" :header="t('endDate')">
          <template #body="{ data, field }">
            {{ timestampms(data[field as string]) }}
          </template>
        </Column>
        <Column field="reason" :header="t('closeReason')"></Column>
        <Column field="actions" :header="t('actions')">
          <template #body="{ data }">
            <Button
              class="btn-xs ms-1"
              size="small"
              severity="secondary"
              :title="t('deleteLock')"
              @click="removePairLock(data as Lock)"
            >
              <i-mdi-delete />
            </Button>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
