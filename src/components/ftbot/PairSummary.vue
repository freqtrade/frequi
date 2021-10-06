<template>
  <!-- <b-table class="table-sm" :items="combinedPairList" :fields="tableFields"> </b-table> -->

  <b-list-group>
    <b-list-group-item
      v-for="comb in combinedPairList"
      :key="comb.pair"
      button
      class="d-flex justify-content-between align-items-center py-1"
      :active="comb.pair === selectedPair"
      @click="setSelectedPair(comb.pair)"
    >
      <div>
        {{ comb.pair }}
        <span v-if="comb.locks" :title="comb.lockReason"> &#128274; </span>
      </div>
      <TradeProfit v-if="comb.trade" :trade="comb.trade" />
    </b-list-group-item>
  </b-list-group>
</template>

<script lang="ts">
import { formatPercent, timestampms } from '@/shared/formatters';
import { BotStoreGetters } from '@/store/modules/ftbot';
import { Lock, Trade } from '@/types';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import TradeProfit from '@/components/ftbot/TradeProfit.vue';

const ftbot = namespace('ftbot');

interface CombinedPairList {
  pair: string;
  lockReason: string;
  profitString: string;
  trade?: Trade;
  locks?: Lock;
  profit: number;
}

@Component({ components: { TradeProfit } })
export default class PairSummary extends Vue {
  @Prop({ required: true }) pairlist!: string[];

  @Prop({ required: false, default: () => [] }) currentLocks!: Lock[];

  @Prop({ required: true }) trades!: Trade[];

  /** Sort method, "normal" (sorts by open trades > pairlist -> locks) or "profit" */
  @Prop({ required: false, default: 'normal' }) sortMethod!: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action setSelectedPair!: (pair: string) => void;

  @ftbot.Getter [BotStoreGetters.selectedPair]!: string;

  timestampms = timestampms;

  formatPercent = formatPercent;

  get combinedPairList() {
    const comb: CombinedPairList[] = [];

    this.pairlist.forEach((pair) => {
      const trades: Trade[] = this.trades.filter((el) => el.pair === pair);
      const allLocks = this.currentLocks.filter((el) => el.pair === pair);
      let lockReason = '';
      let locks;

      // Sort to have longer timeframe in front
      allLocks.sort((a, b) => (a.lock_end_timestamp > b.lock_end_timestamp ? -1 : 1));
      if (allLocks.length > 0) {
        [locks] = allLocks;
        lockReason = `${timestampms(locks.lock_end_timestamp)} - ${locks.reason}`;
      }
      let profitString = '';
      let profit = 0;
      trades.forEach((trade) => {
        profit += trade.profit_ratio;
      });

      const trade = trades.length === 1 ? trades[0] : undefined;
      if (trades.length > 0) {
        profitString = `Current profit: ${formatPercent(profit)}`;
      }
      if (trade) {
        profitString += `\nOpen since: ${timestampms(trade.open_timestamp)}`;
      }
      comb.push({ pair, trade, locks, lockReason, profitString, profit });
    });
    if (this.sortMethod === 'profit') {
      comb.sort((a, b) => {
        if (a.profit > b.profit) {
          return -1;
        }
        return 1;
      });
    } else {
      // sort Pairs: "with open trade" -> available -> locked
      comb.sort((a, b) => {
        if (a.trade && !b.trade) {
          return -1;
        }
        if (a.trade && b.trade) {
          // 2 open trade pairs
          return a.trade.trade_id > b.trade.trade_id ? 1 : -1;
        }
        if (!a.locks && b.locks) {
          return -1;
        }
        if (a.locks && b.locks) {
          // Both have locks
          return a.locks.lock_end_timestamp > b.locks.lock_end_timestamp ? 1 : -1;
        }
        return 1;
      });
    }
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
