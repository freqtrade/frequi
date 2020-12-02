<template>
  <!-- <b-table class="table-sm" :items="combinedPairList" :fields="tableFields"> </b-table> -->

  <b-list-group>
    <b-list-group-item
      v-for="comb in combinedPairList"
      :key="comb.pair"
      button
      class="d-flex justify-content-between align-items-center py-1"
      @click="setSelectedPair(comb.pair)"
    >
      <div>
        {{ comb.pair }}
        <span v-if="comb.locks" :title="comb.lockReason"> &#128274; </span>
      </div>
      <b-badge
        :variant="comb.trade && comb.trade.profit_ratio > 0 ? 'success' : 'danger'"
        pill
        :title="comb.profitString"
        >{{
          comb.trade && comb.trade.profit_ratio ? formatPercent(comb.trade.profit_ratio) : ''
        }}</b-badge
      >
    </b-list-group-item>
  </b-list-group>
</template>

<script lang="ts">
import { formatPercent, timestampms } from '@/shared/formatters';
import { BotStoreGetters } from '@/store/modules/ftbot';
import { Lock, Trade } from '@/types';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const ftbot = namespace('ftbot');

interface CombinedPairList {
  pair: string;
  lockReason: string;
  profitString: string;
  trade?: Trade;
  locks?: Lock;
}

@Component({})
export default class PairSummary extends Vue {
  @ftbot.Getter [BotStoreGetters.currentLocks]!: Lock[];

  @ftbot.Getter [BotStoreGetters.openTrades]!: Trade[];

  @ftbot.State whitelist!: string[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action setSelectedPair!: (pair: string) => void;

  timestampms = timestampms;

  formatPercent = formatPercent;

  get combinedPairList() {
    const comb: CombinedPairList[] = [];

    this.whitelist.forEach((pair) => {
      const trade = this.openTrades.find((el) => el.pair === pair);
      const allLocks = this.currentLocks.filter((el) => el.pair === pair);
      // Sort to have longer timeframe in front
      allLocks.sort((a, b) => (a.lock_end_timestamp > b.lock_end_timestamp ? -1 : 1));
      let lockReason = '';
      let locks;
      if (allLocks.length > 0) {
        [locks] = allLocks;
        console.log(locks);
        lockReason = `${timestampms(locks.lock_end_timestamp)} - ${locks.reason}`;
      }
      let profitString = '';
      if (trade && trade.profit_ratio) {
        profitString = `Current profit: ${formatPercent(trade.profit_ratio)}
Open since: ${timestampms(trade.open_timestamp)}`;
      }
      comb.push({ pair, trade, locks, lockReason, profitString });
    });
    // sort Pairs: "with open trade" -> available -> locked
    comb.sort((a, b) => {
      if (a.trade && !b.trade) {
        return -1;
      }
      if (!a.locks && b.locks) {
        return -1;
      }
      return 1;
    });
    return comb;
  }

  get tableFields() {
    return [
      { key: 'pair', label: 'Pair' },
      {
        key: 'locks.lock_end_timestamp',
        label: 'Lock',
        formatter: (value) => (value ? `${timestampms(value)}` : ''),
      },
      {
        key: 'trade.current_profit',
        label: 'Position',
        formatter: (value) => formatPercent(value, 3),
      },
    ];
  }
}
</script>

<style scoped>
.list-group {
  text-align: left;
}
</style>
