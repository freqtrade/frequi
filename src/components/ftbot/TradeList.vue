<template>
  <div class="h-100 overflow-auto w-100">
    <b-table
      ref="tradesTable"
      small
      hover
      stacked="md"
      :items="trades"
      :fields="tableFields"
      show-empty
      :empty-text="emptyText"
      :per-page="perPage"
      :current-page="currentPage"
      primary-key="botTradeId"
      selectable
      select-mode="single"
      :filter="filterText"
      @row-contextmenu="handleContextMenuEvent"
      @row-clicked="onRowClicked"
      @row-selected="onRowSelected"
    >
      <template #cell(actions)="row">
        <b-button
          :id="`btn-actions_${row.index}`"
          class="btn-xs"
          size="sm"
          title="Actions"
          href="#"
        >
          <ActionIcon :size="16" title="Actions" />
        </b-button>
        <b-popover :target="`btn-actions_${row.index}`" triggers="focus" placement="left">
          <trade-actions
            :trade="row.item"
            :bot-api-version="botStore.activeBot.botApiVersion"
            @deleteTrade="removeTradeHandler"
            @forceExit="forceExitHandler"
            @forceExitPartial="forceExitPartialHandler"
          />
        </b-popover>
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
      <b-input
        v-if="showFilter"
        v-model="filterText"
        type="text"
        placeholder="Filter"
        size="sm"
        style="width: unset"
      />
    </div>
    <force-exit-form v-if="activeTrades" :trade="feTrade" />
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { formatPercent, formatPrice } from '@/shared/formatters';
import { MultiDeletePayload, MultiForcesellPayload, Trade } from '@/types';
import ActionIcon from 'vue-material-design-icons/GestureTap.vue';
import DateTimeTZ from '@/components/general/DateTimeTZ.vue';
import TradeProfit from './TradeProfit.vue';
import TradeActions from './TradeActions.vue';
import ForceExitForm from '@/components/ftbot/ForceExitForm.vue';

import { defineComponent, ref, computed, watch, getCurrentInstance, nextTick } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';

export default defineComponent({
  name: 'TradeList',
  components: { ActionIcon, DateTimeTZ, TradeProfit, TradeActions, ForceExitForm },
  props: {
    trades: { required: true, type: Array as () => Array<Trade> },
    title: { default: 'Trades', type: String },
    stakeCurrency: { required: false, default: '', type: String },
    activeTrades: { default: false, type: Boolean },
    showFilter: { default: false, type: Boolean },
    multiBotView: { default: false, type: Boolean },
    emptyText: { default: 'No Trades to show.', type: String },
  },
  setup(props) {
    const root = getCurrentInstance();
    const botStore = useBotStore();
    const currentPage = ref(1);
    const selectedItemIndex = ref();
    const filterText = ref('');
    const feTrade = ref<Trade>({} as Trade);
    const perPage = props.activeTrades ? 200 : 15;
    const tradesTable = ref<HTMLFormElement>();

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
        formatter: (value: number) => formatPriceWithDecimals(value),
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

    const forceExitHandler = (item: Trade, ordertype: string | undefined = undefined) => {
      root?.proxy.$bvModal
        .msgBoxConfirm(
          `Really exit trade ${item.trade_id} (Pair ${item.pair}) using ${ordertype} Order?`,
        )
        .then((value: boolean) => {
          if (value) {
            const payload: MultiForcesellPayload = {
              tradeid: String(item.trade_id),
              botId: item.botId,
            };
            if (ordertype) {
              payload.ordertype = ordertype;
            }
            botStore
              .forceSellMulti(payload)
              .then((xxx) => console.log(xxx))
              .catch((error) => console.log(error.response));
          }
        });
    };

    const forceExitPartialHandler = (item: Trade) => {
      feTrade.value = item;
      nextTick(() => {
        console.log('showing modal', item);
        root?.proxy.$bvModal.show('forceexit-modal');
      });
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

    const removeTradeHandler = (item) => {
      console.log(item);
      root?.proxy.$bvModal
        .msgBoxConfirm(`Really delete trade ${item.trade_id} (Pair ${item.pair})?`)
        .then((value: boolean) => {
          if (value) {
            const payload: MultiDeletePayload = {
              tradeid: String(item.trade_id),
              botId: item.botId,
            };
            botStore.deleteTradeMulti(payload).catch((error) => console.log(error.response));
          }
        });
    };

    const onRowClicked = (item, index) => {
      // Only allow single selection mode!
      if (
        item &&
        item.trade_id !== botStore.activeBot.detailTradeId &&
        !tradesTable.value?.isRowSelected(index)
      ) {
        botStore.activeBot.setDetailTrade(item);
      } else {
        console.log('unsetting item');
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

    return {
      botStore,
      currentPage,
      selectedItemIndex,
      filterText,
      perPage,
      tableFields,
      rows,
      tradesTable,
      forceExitHandler,
      forceExitPartialHandler,
      handleContextMenuEvent,
      removeTradeHandler,
      onRowClicked,
      onRowSelected,
      feTrade,
    };
  },
});
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
