<template>
  <div class="card">
    <div class="card-header">{{ title }}</div>
    <div class="card-body">
      <b-table
        class="table-sm"
        :items="trades"
        :fields="table_fields"
        @row-contextmenu="handleContextMenuEvent"
      >
        <template v-slot:cell(actions)="row">
          <b-button size="sm" @click="forcesellHandler(row.item, row.index, $event.target)">
            Forcesell
          </b-button>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

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
    };
  },
  methods: {
    ...mapActions('ftbot', ['forcesell']),
    formatPercent(value) {
      return `${value.toFixed(3)}%`;
    },
    forcesellHandler(item) {
      this.forcesell(item.trade_id)
        .then(() => console.log('asdf'))
        .catch((error) => console.log(error.response));
    },
    handleContextMenuEvent(item, index, event) {
      // stop browser context menu from appearing
      event.preventDefault();
      // log the selected item to the console
      console.log(item);
    },
  },
};
</script>
