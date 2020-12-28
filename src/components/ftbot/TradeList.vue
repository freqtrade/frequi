<template>
  <div class="h-100 d-flex overflow-auto">
    <div>
      <b-table
        ref="tradesTable"
        class="table-sm"
        :items="trades"
        :fields="tableFields"
        show-empty
        :empty-text="emptyText"
        :per-page="perPage"
        :current-page="currentPage"
        primary-key="trade_id"
        selectable
        select-mode="single"
        @row-contextmenu="handleContextMenuEvent"
        @row-clicked="onRowClicked"
        @row-selected="onRowSelected"
      >
        <template #cell(actions)="row">
          <b-button class="btn-xs" size="sm" title="Forcesell" @click="forcesellHandler(row.item)">
            <ForceSellIcon :size="16" />
          </b-button>
          <b-button
            class="btn-xs ml-1"
            size="sm"
            title="Delete trade"
            @click="removeTradeHandler(row.item)"
          >
            <DeleteIcon :size="16" />
          </b-button>
        </template>
        <template #cell(pair)="row">
          <ProfitSymbol :trade="row.item" />
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
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { formatPercent, formatPrice } from '@/shared/formatters';
import { Trade } from '@/types';
import DeleteIcon from 'vue-material-design-icons/Delete.vue';
import ForceSellIcon from 'vue-material-design-icons/CloseBoxMultiple.vue';
import ProfitSymbol from './ProfitSymbol.vue';

const ftbot = namespace('ftbot');

@Component({
  components: { ProfitSymbol, DeleteIcon, ForceSellIcon },
})
export default class TradeList extends Vue {
  $refs!: {
    tradesTable: HTMLFormElement;
  };

  @Prop({ required: true })
  trades!: Array<Trade>;

  @Prop({ default: 'Trades' })
  title!: string;

  @Prop({ default: false })
  activeTrades!: boolean;

  @Prop({ default: 'No Trades to show.' })
  emptyText!: string;

  @ftbot.State detailTradeId?: number;

  @ftbot.Action setDetailTrade;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action forcesell!: (tradeid: string) => Promise<string>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action deleteTrade!: (tradeid: string) => Promise<string>;

  currentPage = 1;

  selectedItemIndex? = undefined;

  @Watch('detailTradeId')
  watchTradeDetail(val) {
    const index = this.trades.findIndex((v) => v.trade_id === val);
    // Unselect when another tradeTable is selected!
    if (index < 0) {
      this.$refs.tradesTable.clearSelected();
    }
  }

  get rows(): number {
    return this.trades.length;
  }

  perPage = this.activeTrades ? 200 : 15;

  // Added to table-fields for current trades
  openFields: Record<string, string | Function>[] = [{ key: 'actions' }];

  // Added to table-fields for historic trades
  closedFields: Record<string, string | Function>[] = [{ key: 'close_date', label: 'Close date' }];

  tableFields: Record<string, string | Function>[] = [
    { key: 'trade_id', label: 'ID' },
    { key: 'pair', label: 'Pair' },
    { key: 'amount', label: 'Amount' },
    { key: 'stake_amount', label: 'Stake amount' },
    { key: 'open_rate', label: 'Open rate', formatter: (value) => formatPrice(value) },
    {
      key: this.activeTrades ? 'current_rate' : 'close_rate',
      label: this.activeTrades ? 'Current rate' : 'Close rate',
      formatter: (value) => formatPrice(value),
    },
    {
      key: this.activeTrades ? 'current_profit' : 'close_profit',
      label: this.activeTrades ? 'Current profit %' : 'Profit %',
      formatter: (value) => formatPercent(value, 3),
    },
    { key: 'open_date', label: 'Open date' },
    ...(this.activeTrades ? this.openFields : this.closedFields),
  ];

  forcesellHandler(item) {
    this.$bvModal
      .msgBoxConfirm(`Really forcesell trade ${item.trade_id} (Pair ${item.pair})?`)
      .then((value: boolean) => {
        if (value) {
          this.forcesell(item.trade_id)
            .then((xxx) => console.log(xxx))
            .catch((error) => console.log(error.response));
        }
      });
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

  removeTradeHandler(item) {
    console.log(item);
    this.$bvModal
      .msgBoxConfirm(`Really delete trade ${item.trade_id} (Pair ${item.pair})?`)
      .then((value: boolean) => {
        if (value) {
          this.deleteTrade(item.trade_id).catch((error) => console.log(error.response));
        }
      });
  }

  onRowClicked(item, index) {
    // Only allow single selection mode!
    if (
      item &&
      item.trade_id !== this.detailTradeId &&
      !this.$refs.tradesTable.isRowSelected(index)
    ) {
      this.setDetailTrade(item);
    } else {
      console.log('unsetting item');
      this.setDetailTrade(null);
    }
  }

  onRowSelected() {
    if (this.detailTradeId) {
      const itemIndex = this.trades.findIndex((v) => v.trade_id === this.detailTradeId);
      if (itemIndex >= 0) {
        this.$refs.tradesTable.selectRow(itemIndex);
      } else {
        console.log(`Unsetting item for tradeid ${this.selectedItemIndex}`);
        this.selectedItemIndex = undefined;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.card-body {
  padding: 0 0.2em;
}
.table-sm {
  font-size: $fontsize-small;
}
.btn-xs {
  padding: 0.1rem 0.25rem;
  font-size: 0.75rem;
}
</style>
