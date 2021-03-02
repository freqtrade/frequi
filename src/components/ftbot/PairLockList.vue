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
import { BotStoreGetters } from '@/store/modules/ftbot';
import { Lock } from '@/types';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import DeleteIcon from 'vue-material-design-icons/Delete.vue';
import { AlertActions } from '@/store/modules/alerts';

const ftbot = namespace('ftbot');
const alerts = namespace('alerts');

@Component({
  components: { DeleteIcon },
})
export default class PairLockList extends Vue {
  @ftbot.Action getLocks;

  @ftbot.Getter [BotStoreGetters.currentLocks]!: Lock[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action deleteLock!: (lockid: string) => Promise<string>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @alerts.Action [AlertActions.addAlert];

  timestampms = timestampms;

  get tableFields() {
    return [
      { key: 'pair', label: 'Pair' },
      { key: 'lock_end_timestamp', label: 'Until', formatter: 'timestampms' },
      { key: 'reason', label: 'Reason' },
      { key: 'actions' },
    ];
  }

  removePairLock(item: Lock) {
    console.log(item);
    if (item.id !== undefined) {
      this.deleteLock(item.id);
    } else {
      this.addAlert({ message: 'This Freqtrade version does not support deleting locks.' });
    }
  }
}
</script>

<style scoped></style>
