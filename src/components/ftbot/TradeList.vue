<script setup lang="ts">
import type { MultiDeletePayload, MultiForcesellPayload, Trade } from '@/types';
import { useBotStore } from '@/stores/ftbotwrapper';
import { useRouter } from 'vue-router';
import { ref, h } from 'vue'; // Modified: Added 'h' for rendering custom components


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
const currentPage = ref(1);
const selectedItem = ref();
const filterText = ref('');
const feTrade = ref<Trade>({} as Trade);
const perPage = props.activeTrades ? 200 : 15;
const tradesTable = ref<HTMLFormElement>();
const forceExitVisible = ref(false);
const removeTradeVisible = ref(false);
const confirmExitText = ref('');
const confirmExitValue = ref<ModalReasons | null>(null);

// NEW: Menu reference and items for column toggle dropdown
const menu = ref(null);




// Modified: Add visible property to tableFields and initialize menuItems

const increasePosition = ref({ visible: false, trade: {} as Trade });
function formatPriceWithDecimals(price: number) {
  return formatPrice(price, botStore.activeBot.stakeCurrencyDecimals);
}

// Modified: Define tableFields with visible property
const tableFields = ref([
  { field: 'trade_id', header: 'ID', visible: true },
  { field: 'pair', header: 'Pair', visible: true },
  { field: 'amount', header: 'Amount', visible: true },
  props.activeTrades
    ? { field: 'stake_amount', header: 'Stake amount', visible: true }
    : { field: 'max_stake_amount', header: 'Total stake amount', visible: true },
  {
    field: 'open_rate',
    header: 'Open rate',
    visible: true,
  },
  {
    field: props.activeTrades ? 'current_rate' : 'close_rate',
    header: props.activeTrades ? 'Current rate' : 'Close rate',
    visible: true,
  },
  {
    field: 'profit',
    header: props.activeTrades ? 'Current profit %' : 'Profit %',
    visible: true,
  },
  { field: 'open_timestamp', header: 'Open date', visible: true },
  ...(props.activeTrades
    ? [{ field: 'actions', header: '', visible: true }]
    : [
        { field: 'close_timestamp', header: 'Close date', visible: true },
        { field: 'exit_reason', header: 'Close Reason', visible: true },
      ]),
]);

const menuItems = ref([
  {
    label: 'Toggle Columns',
    items: tableFields.value.map(col => ({
      label: col.header,
      command: () => toggleColumn(col.field),
      item: ({ item }) => h(
        'div',
        { class: 'p-menuitem-content flex align-items-center' },
        [
          h(BaseCheckbox, {
            modelValue: col.visible,
            'onUpdate:modelValue': () => toggleColumn(col.field),
            class: 'p-checkbox-input',
            binary: true,
            title: `Toggle ${col.header} column`,
          }),
          h('span', { class: 'ml-2' }, item.label),
        ]),
    })),
  },
]);

// Modified: Add botName field for multiBotView with visible property
if (props.multiBotView) {
  tableFields.value.unshift({ field: 'botName', header: 'Bot', visible: true });
}

// NEW: Function to toggle column visibility
function toggleColumn(field: string) {
  const column = tableFields.value.find(col => col.field === field);
  if (column) {
    column.visible = !column.visible;
  }
}

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
}

function removeTradeHandler(item: Trade) {
  confirmExitText.value = `Really delete trade ${item.trade_id} (Pair ${item.pair})?`;
  confirmExitValue.value = ModalReasons.removeTrade;
  feTrade.value = item;
  removeTradeVisible.value = true;
}

function forceExitPartialHandler(item: Trade) {
  feTrade.value = item;
  forceExitVisible.value = true;
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
  increasePosition.value.trade = item;
  increasePosition.value.visible = true;
}

const onRowClicked = ({ data: item }) => {
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

watch(
  () => botStore.activeBot.detailTradeId,
  (val) => {
    const index = props.trades.findIndex((v) => v.trade_id === val);
    // Unselect when another tradeTable is selected!
    if (index < 0) {
      selectedItem.value = undefined;
    }
  },
);
</script>

<template>
  <div class="h-full overflow-auto w-full">
    <DataTable
      ref="tradesTable"
      v-model:selection="selectedItem"
      :value="
        trades.filter(
          (t) =>
            t.pair.toLowerCase().includes(filterText.toLowerCase()) ||
            t.exit_reason?.toLowerCase().includes(filterText.toLowerCase()) ||
            t.enter_tag?.toLowerCase().includes(filterText.toLowerCase()),
        )
      "
      :rows="perPage"
      :paginator="!activeTrades"
      :first="(currentPage - 1) * perPage"
      selection-mode="single"
      class="text-center"
      size="small"
      :scrollable="true"
      scroll-height="flex"
      @row-click="onRowClicked"
    >
      <template #empty>
        {{ emptyText }}
      </template>
      <!-- Modified: Filter columns by visible property -->
      <Column
        v-for="column in tableFields.filter(c => c.visible)"
        :key="column.field"
        :field="column.field"
        :header="column.header"
      >
        <template #body="{ data, field, index }">
          <template v-if="field === 'trade_id'">
            {{ data.trade_id }}
            {{
              botStore.activeBot.botApiVersion > 2.0 && data.trading_mode !== 'spot'
                ? (data.trade_id ? '| ' : '') + (data.is_short ? 'Short' : 'Long')
                : ''
            }}
          </template>
          <template v-else-if="field === 'pair'">
            {{ `${data.pair}${data.open_order_id || data.has_open_orders ? '*' : ''}` }}
          </template>
          <template v-else-if="field === 'actions'">
            <TradeActionsPopover
              :id="index"
              :enable-force-entry="botStore.activeBot.botState.force_entry_enable"
              :trade="data as Trade"
              :bot-api-version="botStore.activeBot.botApiVersion"
              @delete-trade="removeTradeHandler(data as Trade)"
              @force-exit="forceExitHandler"
              @force-exit-partial="forceExitPartialHandler"
              @cancel-open-order="cancelOpenOrderHandler"
              @reload-trade="reloadTradeHandler"
              @force-entry="handleForceEntry"
            />
          </template>
          <template v-else-if="field === 'stake_amount' || field === 'max_stake_amount'">
            {{ formatPriceWithDecimals(data[field]) }}
            {{ data.trading_mode !== 'spot' ? `(${data.leverage}x)` : '' }}
          </template>
          <template
            v-else-if="field === 'open_rate' || field === 'current_rate' || field === 'close_rate'"
          >
            {{ formatPrice(data[field]) }}
          </template>
          <template v-else-if="field === 'profit'">
            <TradeProfit :trade="data" />
          </template>
          <template v-else-if="field === 'open_timestamp'">
            <DateTimeTZ :date="data.open_timestamp" />
          </template>
          <template v-else-if="field === 'close_timestamp'">
            <DateTimeTZ :date="data.close_timestamp ?? 0" />
          </template>
          <template v-else>
            {{ data[field] }}
          </template>
        </template>
      </Column>

      <template  #header>
        <div class="flex justify-end gap-2 p-2">
          <InputText v-if="showFilter" v-model="filterText" placeholder="Filter" class="w-64" size="small" />
          <!-- NEW: Three-dot button for column toggle menu -->
          <Button
            @click="menu.toggle($event)"
          >
            <template #icon>
              <i-mdi-menu />
            </template>
          </Button>
          
          <!-- NEW: Menu component for column toggle -->
          <Menu ref="menu" :model="menuItems" :popup="true" />
        </div>
      </template>
    </DataTable>

    <ForceExitForm
      v-if="activeTrades"
      v-model="forceExitVisible"
      :trade="feTrade"
      :stake-currency-decimals="botStore.activeBot.botState.stake_currency_decimals ?? 3"
    />
    <ForceEntryForm
      v-model="increasePosition.visible"
      :pair="increasePosition.trade?.pair"
      position-increase
    />

    <Dialog v-model:visible="removeTradeVisible" :modal="true" header="Exit trade">
      <p>{{ confirmExitText }}</p>
      <template #footer>
        <Button label="Cancel" @click="removeTradeVisible = false" />
        <Button label="Confirm" severity="danger" @click="forceExitExecuter" />
      </template>
    </Dialog>
  </div>
</template>
<style scoped>
/* NEW: Style for checkbox spacing in dropdown menu */
.p-checkbox-input {
  margin-right: 8px;
}
.p-button.p-button-text .pi-ellipsis-v {
  color: gray; /* Sets the three-dot icon to gray */
}
</style>
