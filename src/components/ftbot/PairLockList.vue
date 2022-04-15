<template>
  <div>
    <div class="mb-2">
      <label class="mr-auto h3">Pair Locks</label>
      <b-button class="float-right" size="sm" @click="getLocks">&#x21bb;</b-button>
    </div>
    <div>
      <b-table class="table-sm" :items="currentLocks" :fields="tableFields">
        <template #cell(actions)="row">
          <b-button
            class="btn-xs ml-1"
            size="sm"
            title="Delete trade"
            @click="removePairLock(row.item)"
          >
            <DeleteIcon :size="16" />
          </b-button>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script lang="ts">
import { timestampms } from '@/shared/formatters';
import { Lock } from '@/types';

import DeleteIcon from 'vue-material-design-icons/Delete.vue';
import { showAlert } from '@/stores/alerts';
import StoreModules from '@/store/storeSubModules';
import { defineComponent } from '@vue/composition-api';
import { useNamespacedActions, useNamespacedGetters } from 'vuex-composition-helpers';

export default defineComponent({
  name: 'PairLockList',
  components: { DeleteIcon },
  setup() {
    const { currentLocks } = useNamespacedGetters(StoreModules.ftbot, ['currentLocks']);
    const { getLocks, deleteLock } = useNamespacedActions(StoreModules.ftbot, [
      'getLocks',
      'deleteLock',
    ]);
    const tableFields = [
      { key: 'pair', label: 'Pair' },
      { key: 'lock_end_timestamp', label: 'Until', formatter: 'timestampms' },
      { key: 'reason', label: 'Reason' },
      { key: 'actions' },
    ];

    const removePairLock = (item: Lock) => {
      console.log(item);
      if (item.id !== undefined) {
        deleteLock(item.id);
      } else {
        showAlert('This Freqtrade version does not support deleting locks.');
      }
    };

    return {
      timestampms,
      tableFields,
      removePairLock,
      currentLocks,
      getLocks,
      deleteLock,
    };
  },
});
</script>

<style scoped></style>
