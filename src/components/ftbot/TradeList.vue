<template>
  <b-card :header="title" no-body>
    <b-card-body>
      <b-table
        class="table-sm"
        :items="trades"
        :fields="table_fields"
        @row-contextmenu="handleContextMenuEvent"
        show-empty
        :emptyText="emptyText"
      >
        <template v-slot:cell(actions)="row">
          <b-button size="sm" @click="forcesellHandler(row.item, row.index, $event.target)">
            Forcesell
          </b-button>
          <b-button size="sm" @click="showDetails(row.item)">D</b-button>
        </template>
        <template v-slot:cell(pair)="row">
          <span class="mr-1" v-html="profitSymbol(row.item)"></span>
          <span>
            {{ row.item.pair }}
          </span>
        </template>
      </b-table>
    </b-card-body>
    <b-card-body class="border-top p-0" v-if="showDetail">
      <TradeDetail :trade="openTradeDetail"></TradeDetail>
    </b-card-body>
  </b-card>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from 'vuex';
import { formatPercent } from '@/shared/formatters';
import TradeDetail from './TradeDetail.vue';

export default {
  name: 'TradeList',
  props: {
    trades: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: false,
      default: 'Trades',
    },
    activeTrades: {
      type: Boolean,
      required: false,
      default: false,
    },
    emptyText: {
      type: String,
      required: false,
      default: 'No Trades to show.',
    },
  },
  components: { TradeDetail },
  computed: {
    ...mapGetters('ftbot', ['openTradeDetail']),
  },
  data() {
    return {
      table_fields: [
        { key: 'trade_id', label: 'ID' },
        { key: 'pair', label: 'Pair' },
        { key: 'amount', label: 'Amount' },
        { key: 'stake_amount', label: 'Stake amount' },
        { key: 'open_rate', label: 'Open rate' },
        {
          key: this.activeTrades ? 'current_rate' : 'close_rate',
          label: this.activeTrades ? 'Current rate' : 'Close rate',
        },
        {
          key: this.activeTrades ? 'current_profit' : 'close_profit',
          label: this.activeTrades ? 'Current profit' : 'Profit',
          formatter: 'formatPercent',
        },
        { key: 'open_date', label: 'Open date' },
        { key: 'close_date', label: 'Close date' },
        ...(this.activeTrades ? [{ key: 'actions' }] : []),
      ],
      showDetail: false,
    };
  },
  methods: {
    ...mapActions('ftbot', ['forcesell']),
    ...mapMutations('ftbot', ['setDetailTrade']),

    formatPercent,
    profitSymbol(item) {
      // Red arrow / green circle
      return item.close_profit < 0 || item.current_profit < 0 ? `&#x1F534;` : `&#x1F7E2;`;
    },
    forcesellHandler(item) {
      this.forcesell(item.trade_id)
        .then(() => console.log('asdf'))
        .catch((error) => console.log(error.response));
    },
    handleContextMenuEvent(item, index, event) {
      // stop browser context menu from appearing
      if (!this.activeTrades) {
        return;
      }
      event.preventDefault();
      // log the selected item to the console
      console.log(item);
    },
    showDetails(trade) {
      console.log(trade);
      this.showDetail = !this.showDetail;
      this.setDetailTrade(trade);
    },
  },
};
</script>

<style scoped>
</style>
