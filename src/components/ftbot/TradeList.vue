<script setup lang="ts">
import { getPaginationRowModel } from '@tanstack/vue-table';
import type { TableColumn, TableRow } from '@nuxt/ui';
import type { MultiDeletePayload, MultiForceExitPayload, Trade } from '@/types';

import { useRouter } from 'vue-router';

enum ModalReasons {
  removeTrade,
  forceExit,
  forceExitPartial,
  cancelOpenOrder,
}

const props = withDefaults(
  defineProps<{
    trades: Trade[];
    title?: string;
    stakeCurrency?: string;
    activeTrades?: boolean;
    showFilter?: boolean;
    multiBotView?: boolean;
    emptyText?: string;
  }>(),
  {
    title: 'Trades',
    stakeCurrency: '',
    activeTrades: false,
    showFilter: false,
    multiBotView: false,
    emptyText: 'No Trades to show.',
  },
);

const botStore = useBotStore();
const router = useRouter();
const settingsStore = useSettingsStore();
const tradesTable = useTemplateRef('tradesTable');
const filterText = ref('');
const feTrade = ref<Trade>({} as Trade);
const perPage = props.activeTrades ? 200 : 15;
const pagination = ref({ pageIndex: 0, pageSize: perPage });
const removeTradeVisible = ref(false);
const confirmExitText = ref('');
const confirmExitValue = ref<ModalReasons | null>(null);
const { forceEntryDialog, forceExitDialog } = useForceTrade();

function formatPriceWithDecimals(price: number) {
  return formatPrice(price, botStore.activeBot.stakeCurrencyDecimals);
}

const tableFields = ref([
  { field: 'trade_id', header: 'ID' },
  { field: 'pair', header: 'Pair' },
  { field: 'amount', header: 'Amount' },
  props.activeTrades
    ? { field: 'stake_amount', header: 'Stake amount' }
    : { field: 'max_stake_amount', header: 'Total stake amount' },
  {
    field: 'open_rate',
    header: 'Open rate',
  },
  {
    field: props.activeTrades ? 'current_rate' : 'close_rate',
    header: props.activeTrades ? 'Current rate' : 'Close rate',
  },
  {
    field: 'profit',
    header: props.activeTrades ? 'Current profit %' : 'Profit %',
  },
  { field: 'open_timestamp', header: 'Open date' },
  ...(props.activeTrades
    ? [{ field: 'actions', header: '' }]
    : [
        { field: 'close_timestamp', header: 'Close date' },
        { field: 'exit_reason', header: 'Close Reason' },
      ]),
]);

if (props.multiBotView) {
  tableFields.value.unshift({ field: 'botName', header: 'Bot' });
}

const tableColumns = computed<TableColumn<Trade>[]>(() =>
  tableFields.value.map((f) => ({ accessorKey: f.field, header: f.header })),
);

const filteredTrades = computed(() => {
  if (!filterText.value) return props.trades;
  const text = filterText.value.toLowerCase();
  return props.trades.filter(
    (t) =>
      t.pair.toLowerCase().includes(text) ||
      t.exit_reason?.toLowerCase().includes(text) ||
      t.enter_tag?.toLowerCase().includes(text) ||
      (props.multiBotView ? t.botName?.toLowerCase().includes(text) : false),
  );
});

const feOrderType = ref<string | undefined>(undefined);
function forceExitHandler(item: Trade, ordertype: string | undefined = undefined) {
  feTrade.value = item;
  confirmExitValue.value = ModalReasons.forceExit;
  confirmExitText.value = `Really exit trade ${item.trade_id} (Pair ${item.pair}) using ${ordertype} Order?`;
  feOrderType.value = ordertype;
  if (settingsStore.confirmDialog === true) {
    removeTradeVisible.value = true;
  } else {
    forceExitExecuter();
  }
}

function forceExitExecuter() {
  if (confirmExitValue.value === ModalReasons.removeTrade) {
    const payload: MultiDeletePayload = {
      tradeid: String(feTrade.value.trade_id),
      botId: feTrade.value.botId,
    };
    botStore.deleteTradeMulti(payload).catch((error) => console.log(error.response));
  }
  if (confirmExitValue.value === ModalReasons.forceExit) {
    const payload: MultiForceExitPayload = {
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
}

function removeTradeHandler(item: Trade) {
  confirmExitText.value = `Really delete trade ${item.trade_id} (Pair ${item.pair})?`;
  confirmExitValue.value = ModalReasons.removeTrade;
  feTrade.value = item;
  removeTradeVisible.value = true;
}

function forceExitPartialHandler(item: Trade) {
  forceExitDialog({
    trade: item,
    stakeCurrencyDecimals: botStore.activeBot.botState.stake_currency_decimals ?? 3,
  });
}

function cancelOpenOrderHandler(item: Trade) {
  confirmExitText.value = `Cancel open order for trade ${item.trade_id} (Pair ${item.pair})?`;
  feTrade.value = item;
  confirmExitValue.value = ModalReasons.cancelOpenOrder;
  removeTradeVisible.value = true;
}

function reloadTradeHandler(item: Trade) {
  botStore.reloadTradeMulti({ tradeid: String(item.trade_id), botId: item.botId });
}

function handleForceEntry(item: Trade) {
  forceEntryDialog({
    pair: item.pair,
    positionIncrease: true,
  });
}

const onRowClicked = (item: Trade) => {
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

function onRowSelect(_e: Event, row: TableRow<Trade>) {
  onRowClicked(row.original);
}
</script>

<template>
  <div class="h-full overflow-auto w-full">
    <UTable
      ref="tradesTable"
      v-model:pagination="pagination"
      :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
      :data="filteredTrades"
      :columns="tableColumns"
      class="text-center"
      :ui="{
        tr: ((row: any) =>
          row.original.trade_id === botStore.activeBot.detailTradeId
            ? 'bg-elevated/50'
            : '') as unknown as string,
      }"
      @select="onRowSelect"
    >
      <template #empty>
        {{ emptyText }}
      </template>
      <template #trade_id-cell="{ row }">
        {{ row.original.trade_id }}
        {{
          botStore.activeBot.botFeatures.futures && row.original.trading_mode !== 'spot'
            ? (row.original.trade_id ? '| ' : '') + (row.original.is_short ? 'Short' : 'Long')
            : ''
        }}
      </template>
      <template #pair-cell="{ row }">
        {{
          `${row.original.pair}${row.original.open_order_id || row.original.has_open_orders ? '*' : ''}`
        }}
      </template>
      <template #actions-cell="{ row }">
        <TradeActionsPopover
          :id="row.original.trade_id ?? row.index"
          :enable-force-entry="botStore.activeBot.botState.force_entry_enable"
          :trade="row.original"
          :bot-features="botStore.activeBot.botFeatures"
          @delete-trade="removeTradeHandler(row.original)"
          @force-exit="forceExitHandler"
          @force-exit-partial="forceExitPartialHandler"
          @cancel-open-order="cancelOpenOrderHandler"
          @reload-trade="reloadTradeHandler"
          @force-entry="handleForceEntry"
        />
      </template>
      <template #stake_amount-cell="{ row }">
        {{ formatPriceWithDecimals(row.original.stake_amount) }}
        {{ row.original.trading_mode !== 'spot' ? `(${row.original.leverage}x)` : '' }}
      </template>
      <template #max_stake_amount-cell="{ row }">
        {{ formatPriceWithDecimals(row.original.max_stake_amount ?? 0) }}
        {{ row.original.trading_mode !== 'spot' ? `(${row.original.leverage}x)` : '' }}
      </template>
      <template #open_rate-cell="{ row }">{{ formatPrice(row.original.open_rate) }}</template>
      <template #current_rate-cell="{ row }">{{
        formatPrice(row.original.current_rate ?? null)
      }}</template>
      <template #close_rate-cell="{ row }">{{
        formatPrice(row.original.close_rate ?? null)
      }}</template>
      <template #amount-cell="{ row }">{{ formatPrice(row.original.amount) }}</template>
      <template #profit-cell="{ row }"><TradeProfit :trade="row.original" /></template>
      <template #open_timestamp-cell="{ row }"
        ><DateTimeTZ :date="row.original.open_timestamp"
      /></template>
      <template #close_timestamp-cell="{ row }"
        ><DateTimeTZ :date="row.original.close_timestamp ?? 0"
      /></template>
      <template #exit_reason-cell="{ row }">{{ row.original.exit_reason }}</template>
      <template #botName-cell="{ row }">{{ row.original.botName }}</template>
    </UTable>

    <div v-if="showFilter" class="flex justify-end gap-2 p-2">
      <UInput v-model="filterText" placeholder="Filter" class="w-64" />
    </div>
    <div v-if="!activeTrades" class="flex justify-end border-t border-default pt-2">
      <UPagination
        :page="(tradesTable?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="tradesTable?.tableApi?.getState().pagination.pageSize"
        :total="tradesTable?.tableApi?.getFilteredRowModel().rows.length ?? 0"
        @update:page="(p) => tradesTable?.tableApi?.setPageIndex(p - 1)"
      />
    </div>

    <UModal
      v-model:open="removeTradeVisible"
      :modal="true"
      title="Exit trade"
      description="Confirm forced exit"
    >
      <template #body>
        <p>{{ confirmExitText }}</p>
      </template>
      <template #footer>
        <UButton
          icon="mdi:close"
          class="ms-auto"
          label="Cancel"
          @click="removeTradeVisible = false"
        />
        <UButton icon="mdi:check" label="Confirm" color="error" @click="forceExitExecuter" />
      </template>
    </UModal>
  </div>
</template>
