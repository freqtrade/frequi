<template>
  <div class="h-100 overflow-auto w-100">
    <b-list-group>
      <b-list-group-item v-for="trade in trades" :key="trade.trade_id">
        <CustomTradeListEntry :trade="trade" :stake-currency-decimals="stakeCurrencyDecimals" />
      </b-list-group-item>
    </b-list-group>

    <div class="w-100 d-flex justify-content-between">
      <b-pagination
        v-if="!activeTrades"
        v-model="currentPage"
        :total-rows="rows"
        :per-page="perPage"
        aria-controls="my-table"
      ></b-pagination>
      <b-input
        v-if="showFilter"
        v-model="filterText"
        type="text"
        placeholder="Filter"
        size="sm"
        style="width: unset"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { formatPercent, formatPrice } from '@/shared/formatters';
import { MultiDeletePayload, MultiForcesellPayload, Trade } from '@/types';
import DeleteIcon from 'vue-material-design-icons/Delete.vue';
import ForceSellIcon from 'vue-material-design-icons/CloseBoxMultiple.vue';
import ActionIcon from 'vue-material-design-icons/GestureTap.vue';
import DateTimeTZ from '@/components/general/DateTimeTZ.vue';
import { BotStoreGetters } from '@/store/modules/ftbot';
import StoreModules from '@/store/storeSubModules';
import CustomTradeListEntry from '@/components/ftbot/CustomTradeListEntry.vue';
import TradeProfit from './TradeProfit.vue';

const ftbot = namespace(StoreModules.ftbot);

@Component({
  components: {
    DeleteIcon,
    ForceSellIcon,
    ActionIcon,
    DateTimeTZ,
    TradeProfit,
    CustomTradeListEntry,
  },
})
export default class CustomTradeList extends Vue {
  $refs!: {
    tradesTable: HTMLFormElement;
  };

  formatPercent = formatPercent;

  formatPrice = formatPrice;

  @Prop({ required: true }) trades!: Array<Trade>;

  @Prop({ default: 'Trades' }) title!: string;

  @Prop({ required: false, default: '' }) stakeCurrency!: string;

  @Prop({ default: false }) activeTrades!: boolean;

  @Prop({ default: false }) showFilter!: boolean;

  @Prop({ default: false, type: Boolean }) multiBotView!: boolean;

  @Prop({ default: 'No Trades to show.' }) emptyText!: string;

  @ftbot.Getter [BotStoreGetters.detailTradeId]?: number;

  @ftbot.Getter [BotStoreGetters.stakeCurrencyDecimals]!: number;

  @ftbot.Getter [BotStoreGetters.botApiVersion]: number;

  @ftbot.Action setDetailTrade;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action forceSellMulti!: (payload: MultiForcesellPayload) => Promise<string>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action deleteTradeMulti!: (payload: MultiDeletePayload) => Promise<string>;

  currentPage = 1;

  selectedItemIndex? = undefined;

  filterText = '';

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
  closedFields: Record<string, string | Function>[] = [
    { key: 'close_timestamp', label: 'Close date' },
    { key: 'sell_reason', label: 'Close Reason' },
  ];

  tableFields: Record<string, string | Function>[] = [
    this.multiBotView ? { key: 'botName', label: 'Bot' } : {},
    { key: 'trade_id', label: 'ID' },
    { key: 'pair', label: 'Pair' },
    { key: 'amount', label: 'Amount' },
    {
      key: 'stake_amount',
      label: 'Stake amount',
      formatter: (value: number) => this.formatPriceWithDecimals(value),
    },
    {
      key: 'open_rate',
      label: 'Open rate',
      formatter: (value: number) => this.formatPrice(value),
    },
    {
      key: this.activeTrades ? 'current_rate' : 'close_rate',
      label: this.activeTrades ? 'Current rate' : 'Close rate',
      formatter: (value: number) => this.formatPrice(value),
    },
    {
      key: 'profit',
      label: this.activeTrades ? 'Current profit %' : 'Profit %',
      formatter: (value: number, key, item: Trade) => {
        const percent = formatPercent(item.profit_ratio, 2);
        return `${percent} ${`(${this.formatPriceWithDecimals(item.profit_abs)})`}`;
      },
    },
    { key: 'open_timestamp', label: 'Open date' },
    ...(this.activeTrades ? this.openFields : this.closedFields),
  ];

  formatPriceWithDecimals(price) {
    return formatPrice(price, this.stakeCurrencyDecimals);
  }

  forcesellHandler(item: Trade, ordertype: string | undefined = undefined) {
    this.$bvModal
      .msgBoxConfirm(`Really forcesell trade ${item.trade_id} (Pair ${item.pair})?`)
      .then((value: boolean) => {
        if (value) {
          const payload: MultiForcesellPayload = {
            tradeid: String(item.trade_id),
            botId: item.botId,
          };
          if (ordertype) {
            payload.ordertype = ordertype;
          }
          this.forceSellMulti(payload)
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
          const payload: MultiDeletePayload = {
            tradeid: String(item.trade_id),
            botId: item.botId,
          };
          this.deleteTradeMulti(payload).catch((error) => console.log(error.response));
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
