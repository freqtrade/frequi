<template>
  <div class="h-100 overflow-auto w-100">
    <b-table
      ref="tradesTable"
      small
      hover
      stacked="md"
      :items="
        trades.filter(
          (t) =>
            t.pair.toLowerCase().includes(filterText.toLowerCase()) ||
            t.exit_reason?.toLowerCase().includes(filterText.toLowerCase()) ||
            t.enter_tag?.toLowerCase().includes(filterText.toLowerCase()),
        )
      "
      :fields="tableFields"
      show-empty
      :empty-text="emptyText"
      :per-page="perPage"
      :current-page="currentPage"
      primary-key="botTradeId"
      selectable
      :select-head="false"
      select-mode="single"
      @row-contextmenu="handleContextMenuEvent"
      @row-clicked="onRowClicked"
      @row-selected="onRowSelected"
    >
      <template #cell(actions)="row">
        <TradeActionsPopover
          :id="row.index"
          :trade="row.item"
          :bot-api-version="botStore.activeBot.botApiVersion"
          @deleteTrade="removeTradeHandler(row.item)"
          @forceExit="forceExitHandler"
          @forceExitPartial="forceExitPartialHandler"
          @cancel-open-order="cancelOpenOrderHandler"
        />
      </template>
      <template #cell(pair)="row">
        <span>
          {{
            `${row.item.pair}${
              row.item.open_order_id === undefined || row.item.open_order_id === null ? '' : '*'
            }`
          }}
        </span>
      </template>
      <template #cell(trade_id)="row">
        {{ row.item.trade_id }}
        {{
          botStore.activeBot.botApiVersion > 2.0 && row.item.trading_mode !== 'spot'
            ? '| ' + (row.item.is_short ? 'Short' : 'Long')
            : ''
        }}
      </template>
      <template #cell(stake_amount)="row">
        {{ formatPriceWithDecimals(row.item.stake_amount) }}
        {{ row.item.trading_mode !== 'spot' ? `(${row.item.leverage}x)` : '' }}
      </template>
      <template #cell(profit)="row">
        <trade-profit :trade="row.item" />
      </template>
      <template #cell(open_timestamp)="row">
        <DateTimeTZ :date="row.item.open_timestamp" />
      </template>
      <template #cell(close_timestamp)="row">
        <DateTimeTZ :date="row.item.close_timestamp" />
      </template>
    </b-table>
    <div class="w-100 d-flex justify-content-between">
      <b-pagination
        v-if="!activeTrades"
        v-model="currentPage"
        :total-rows="rows"
        :per-page="perPage"
        aria-controls="my-table"
      ></b-pagination>
      <b-form-input
        v-if="showFilter"
        v-model="filterText"
        type="text"
        placeholder="Filter"
        size="sm"
        style="width: unset"
      />
    </div>
    <force-exit-form v-if="activeTrades" v-model="forceExitVisible" :trade="feTrade" />
    <b-modal v-model="removeTradeVisible" title="Exit trade" @ok="forceExitExecuter">
      {{ confirmExitText }}
    </b-modal>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { formatPercent, formatPrice } from '@/shared/formatters';
import { MultiDeletePayload, MultiForcesellPayload, Trade } from '@/types';
import DateTimeTZ from '@/components/general/DateTimeTZ.vue';
import TradeProfit from './TradeProfit.vue';
import TradeActionsPopover from './TradeActionsPopover.vue';
import ForceExitForm from '@/components/ftbot/ForceExitForm.vue';

import { ref, computed, watch } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import { useRouter } from 'vue-router';

enum ModalReasons {
  removeTrade,
  forceExit,
  forceExitPartial,
  cancelOpenOrder,
}

const props = defineProps({
  trades: { required: true, type: Array as () => Array<Trade> },
  title: { default: 'Trades', type: String },
  stakeCurrency: { required: false, default: '', type: String },
  activeTrades: { default: false, type: Boolean },
  showFilter: { default: false, type: Boolean },
  multiBotView: { default: false, type: Boolean },
  emptyText: { default: 'No Trades to show.', type: String },
});
const botStore = useBotStore();
const router = useRouter();
const currentPage = ref(1);
const selectedItemIndex = ref();
const filterText = ref('');
const feTrade = ref<Trade>({} as Trade);
const perPage = props.activeTrades ? 200 : 15;
const tradesTable = ref<HTMLFormElement>();
const forceExitVisible = ref(false);
const removeTradeVisible = ref(false);
const confirmExitText = ref('');
const confirmExitValue = ref<ModalReasons | null>(null);

const openFields: Record<string, string | Function>[] = [{ key: 'actions' }];
const closedFields: Record<string, string | Function>[] = [
  { key: 'close_timestamp', label: 'Close date' },
  { key: 'exit_reason', label: 'Close Reason' },
];
const formatPriceWithDecimals = (price) => {
  return formatPrice(price, botStore.activeBot.stakeCurrencyDecimals);
};
const rows = computed(() => {
  return props.trades.length;
});

const tableFields: Record<string, string | Function>[] = [
  props.multiBotView ? { key: 'botName', label: 'Bot' } : {},
  { key: 'trade_id', label: 'ID' },
  { key: 'pair', label: 'Pair' },
  { key: 'amount', label: 'Amount' },
  {
    key: 'stake_amount',
    label: 'Stake amount',
  },
  {
    key: 'open_rate',
    label: 'Open rate',
    formatter: (value: number) => formatPrice(value),
  },
  {
    key: props.activeTrades ? 'current_rate' : 'close_rate',
    label: props.activeTrades ? 'Current rate' : 'Close rate',
    formatter: (value: number) => formatPrice(value),
  },
  {
    key: 'profit',
    label: props.activeTrades ? 'Current profit %' : 'Profit %',
    formatter: (value: number, key, item: Trade) => {
      const percent = formatPercent(item.profit_ratio, 2);
      return `${percent} ${`(${formatPriceWithDecimals(item.profit_abs)})`}`;
    },
  },
  { key: 'open_timestamp', label: 'Open date' },
  ...(props.activeTrades ? openFields : closedFields),
];
const feOrderType = ref<string | undefined>(undefined);
const forceExitHandler = (item: Trade, ordertype: string | undefined = undefined) => {
  feTrade.value = item;
  confirmExitValue.value = ModalReasons.forceExit;
  confirmExitText.value = `Really exit trade ${item.trade_id} (Pair ${item.pair}) using ${ordertype} Order?`;
  removeTradeVisible.value = true;
  feOrderType.value = ordertype;
};

const forceExitExecuter = () => {
  if (confirmExitValue.value === ModalReasons.removeTrade) {
    const payload: MultiDeletePayload = {
      tradeid: String(feTrade.value.trade_id),
      botId: feTrade.value.botId,
    };
    botStore.deleteTradeMulti(payload).catch((error) => console.log(error.response));
  }
  if (confirmExitValue.value === ModalReasons.forceExit) {
    const payload: MultiForcesellPayload = {
      tradeid: String(feTrade.value.trade_id),
      botId: feTrade.value.botId,
    };
    if (feOrderType.value) {
      payload.ordertype = feOrderType.value;
    }
    botStore
      .forceSellMulti(payload)
      .then((xxx) => console.log(xxx))
      .catch((error) => console.log(error.response));
  }
  if (confirmExitValue.value === ModalReasons.cancelOpenOrder) {
    const payload: MultiDeletePayload = {
      tradeid: String(feTrade.value.trade_id),
      botId: feTrade.value.botId,
    };
    botStore.cancelOpenOrderMulti(payload);
  }

  feOrderType.value = undefined;
  removeTradeVisible.value = false;
};

const removeTradeHandler = (item: Trade) => {
  confirmExitText.value = `Really delete trade ${item.trade_id} (Pair ${item.pair})?`;
  confirmExitValue.value = ModalReasons.removeTrade;
  feTrade.value = item;
  removeTradeVisible.value = true;
};

const forceExitPartialHandler = (item: Trade) => {
  feTrade.value = item;
  forceExitVisible.value = true;
};

const cancelOpenOrderHandler = (item: Trade) => {
  confirmExitText.value = `Cancel open order for trade ${item.trade_id} (Pair ${item.pair})?`;
  feTrade.value = item;
  confirmExitValue.value = ModalReasons.cancelOpenOrder;
  removeTradeVisible.value = true;
};

const handleContextMenuEvent = (item, index, event) => {
  // stop browser context menu from appearing
  if (!props.activeTrades) {
    return;
  }
  event.preventDefault();
  // log the selected item to the console
  console.log(item);
};

const onRowClicked = (item) => {
  if (props.multiBotView && botStore.selectedBot !== item.botId) {
    // Multibotview - on click switch to the bot trade view
    botStore.selectBot(item.botId);
  }
  if (item && item.trade_id !== botStore.activeBot.detailTradeId) {
    botStore.activeBot.setDetailTrade(item);
    if (props.multiBotView) {
      router.push({ name: 'Freqtrade Trading' });
    }
  } else {
    botStore.activeBot.setDetailTrade(null);
  }
};

const onRowSelected = () => {
  if (botStore.activeBot.detailTradeId) {
    const itemIndex = props.trades.findIndex(
      (v) => v.trade_id === botStore.activeBot.detailTradeId,
    );
    if (itemIndex >= 0) {
      tradesTable.value?.selectRow(itemIndex);
    } else {
      console.log(`Unsetting item for tradeid ${selectedItemIndex.value}`);
      selectedItemIndex.value = undefined;
    }
  }
};

watch(
  () => botStore.activeBot.detailTradeId,
  (val) => {
    const index = props.trades.findIndex((v) => v.trade_id === val);
    // Unselect when another tradeTable is selected!
    if (index < 0) {
      tradesTable.value?.clearSelected();
    }
  },
);
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
