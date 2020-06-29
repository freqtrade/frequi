<template>
  <b-card :header="title" no-body>
    <b-card-body>
      <b-table
        class="table-sm"
        :items="trades"
        :fields="tableFields"
        @row-contextmenu="handleContextMenuEvent"
        show-empty
        :emptyText="emptyText"
        :per-page="perPage"
        :current-page="currentPage"
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
      <b-pagination
        v-if="!activeTrades"
        v-model="currentPage"
        :total-rows="rows"
        :per-page="perPage"
        aria-controls="my-table"
      ></b-pagination>
    </b-card-body>
  </b-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { formatPercent } from '../../shared/formatters';
import { Trade } from '../../store/types';

const ftbot = namespace('ftbot');

@Component({})
export default class TradeList extends Vue {
  @Prop({ required: true })
  trades!: Array<Trade>;

  @Prop({ default: 'Trades' })
  title!: string;

  @Prop({ default: false })
  activeTrades!: boolean;

  @Prop({ default: 'No Trades to show.' })
  emptyText!: string;

  @ftbot.State detailTradeId?: string;

  @ftbot.Getter openTradeDetail?: Trade;

  @ftbot.Mutation setDetailTrade;

  @ftbot.Action forcesell;

  currentPage = 1;

  get rows(): number {
    return this.trades.length;
  }

  perPage = this.activeTrades ? 200 : 15;

  tableFields: Array<Record<string, string>> = [
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
  ];

  formatPercent;

  profitSymbol(item) {
    // Red arrow / green circle
    return item.close_profit < 0 || item.current_profit < 0 ? `&#x1F534;` : `&#x1F7E2;`;
  }

  forcesellHandler(item) {
    this.forcesell(item.trade_id)
      .then(() => console.log('asdf'))
      .catch((error) => console.log(error.response));
  }

  handleContextMenuEvent(item, index, event) {
    // stop browser context menu from appearing
    if (!this.activeTrades) {
      return;
    }
    event.preventDefault();
    // log the selected item to the console
    console.log(item);
  }

  showDetails(trade) {
    if (this.detailTradeId === trade.trade_id) {
      this.setDetailTrade(null);
    } else {
      this.setDetailTrade(trade);
    }
  }
}
</script>

<style scoped>
</style>
