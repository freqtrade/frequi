<script setup lang="ts">
const botStore = useBotStore();
const chartStore = useChartConfigStore();
const settingsStore = useSettingsStore();

const chartTimeframes = [
  '1s',
  '5s',
  '10s',
  '15s',
  '30s',
  '45s',
  '1m',
  '3m',
  '5m',
  '15m',
  '30m',
  '1h',
];
const chartTimeframe = computed(
  () => chartStore.selectedTimeframe || botStore.activeBot.timeframe || '1m',
);

const hasOpenTrades = computed(() => botStore.activeBot.openTrades.length > 0);
const hasClosedTrades = computed(() => botStore.activeBot.closedTrades.length > 0);
const selectedTrade = computed(() => botStore.activeBot.tradeDetail);
const selectedPairsLabel = computed(() => {
  const pairs = botStore.activeBot.plotMultiPairs.filter(Boolean);
  if (pairs.length === 0) return 'No pair';
  if (pairs.length === 1) return pairs[0];
  return `${pairs.length} pairs`;
});
const botStatusLabel = computed(() => (botStore.activeBot.isBotOnline ? 'Online' : 'Offline'));
const runModeLabel = computed(() =>
  String(botStore.activeBot.botState?.runmode || 'Unknown').replaceAll('_', ' '),
);
const strategyLabel = computed(() => botStore.activeBot.strategy?.strategy || 'Strategy loading');
const tradeChartHeightStorageKey = 'ftTradeChartHeight';
const sidePanelStorageKey = 'ftTradeSidePanelOpen';
const tradeChartHeight = ref(430);
const tradeChartResizeStart = ref<{ y: number; height: number } | null>(null);
const sidePanelOpen = ref(true);
const isMobileViewport = ref(false);

function clampTradeChartHeight(height: number) {
  return Math.min(1000, Math.max(220, Math.round(height)));
}

function refreshOHLCV(pair: string, columns: string[]) {
  botStore.activeBot.getPairCandles({
    pair: pair,
    timeframe: chartTimeframe.value,
    columns: columns,
  });
}

function startTradeChartResize(event: PointerEvent) {
  tradeChartResizeStart.value = {
    y: event.clientY,
    height: tradeChartHeight.value,
  };
  window.addEventListener('pointermove', resizeTradeChart);
  window.addEventListener('pointerup', stopTradeChartResize, { once: true });
}

function resizeTradeChart(event: PointerEvent) {
  if (!tradeChartResizeStart.value) return;

  tradeChartHeight.value = clampTradeChartHeight(
    tradeChartResizeStart.value.height + event.clientY - tradeChartResizeStart.value.y,
  );
}

function stopTradeChartResize() {
  if (!tradeChartResizeStart.value) return;

  tradeChartResizeStart.value = null;
  window.removeEventListener('pointermove', resizeTradeChart);
  localStorage.setItem(tradeChartHeightStorageKey, String(tradeChartHeight.value));
}

function selectDefaultTrade() {
  if (botStore.activeBot.detailTradeId || !hasOpenTrades.value) return;

  const [firstOpenTrade] = botStore.activeBot.openTrades;
  if (firstOpenTrade) {
    botStore.activeBot.setDetailTrade(firstOpenTrade);
  }
}

watch(
  () => botStore.activeBot.openTrades,
  () => selectDefaultTrade(),
  { deep: true, immediate: true },
);

function syncViewportState() {
  isMobileViewport.value = window.innerWidth < 768;
}

onMounted(() => {
  syncViewportState();
  window.addEventListener('resize', syncViewportState);

  const storedTradeChartHeight = Number(localStorage.getItem(tradeChartHeightStorageKey));
  if (Number.isFinite(storedTradeChartHeight) && storedTradeChartHeight > 0) {
    tradeChartHeight.value = clampTradeChartHeight(storedTradeChartHeight);
  }

  const storedSidePanelOpen = localStorage.getItem(sidePanelStorageKey);
  if (isMobileViewport.value) {
    sidePanelOpen.value = false;
  } else if (storedSidePanelOpen !== null) {
    sidePanelOpen.value = storedSidePanelOpen === '1';
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncViewportState);
});

function setSidePanelOpen(value: boolean) {
  sidePanelOpen.value = value;
  localStorage.setItem(sidePanelStorageKey, value ? '1' : '0');
}
</script>

<template>
  <div class="trade-page flex min-h-full w-full flex-col gap-3 p-3">
    <section class="trade-command-center">
      <div class="trade-command-main">
        <div>
          <div class="trade-kicker">Live Trading Desk</div>
          <h1>{{ selectedPairsLabel }}</h1>
        </div>
        <div class="trade-command-meta">
          <span class="desk-chip" :class="botStore.activeBot.isBotOnline ? 'positive' : 'neutral'">
            {{ botStatusLabel }}
          </span>
          <span class="desk-chip">{{ runModeLabel }}</span>
          <span class="desk-chip">TF {{ chartTimeframe }}</span>
          <span class="desk-chip">Open {{ botStore.activeBot.openTrades.length }}</span>
          <span class="desk-chip">Closed {{ botStore.activeBot.closedTrades.length }}</span>
        </div>
      </div>
      <div class="trade-command-side">
        <div class="trade-strategy-label">{{ strategyLabel }}</div>
        <button
          type="button"
          class="desk-action"
          :aria-pressed="sidePanelOpen"
          @click="setSidePanelOpen(!sidePanelOpen)"
        >
          <i-mdi-view-dashboard-outline />
          <span>{{ sidePanelOpen ? 'Hide Panels' : 'Show Panels' }}</span>
        </button>
      </div>
    </section>

    <div class="trade-workspace flex min-h-0 w-full flex-1 gap-3">
      <aside class="mix-panel" :class="{ closed: !sidePanelOpen }">
      <button
        v-if="!sidePanelOpen"
        type="button"
        class="mix-panel-tab"
        title="Open Multi Pane"
        @click="setSidePanelOpen(true)"
      >
        <i-mdi-chevron-right />
      </button>

      <DraggableContainer v-else header="Multi Pane" class="h-full" content-overflow="auto">
        <template #header>
          <div class="mix-panel-header">
            <span>Multi Pane</span>
            <button
              type="button"
              class="mix-panel-toggle"
              title="Close Multi Pane"
              @click.stop="setSidePanelOpen(false)"
            >
              <i-mdi-chevron-left />
            </button>
          </div>
        </template>

        <div class="mt-1 flex justify-center">
          <BotControls class="mt-1 mb-2" />
        </div>

        <Tabs value="0" scrollable lazy>
          <TabList>
            <Tab value="0" severity="secondary">
              <div title="Pairs combined">
                <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">
                  Pairs combined
                </span>
                <i-mdi-view-list v-else />
              </div>
            </Tab>

            <Tab value="1" severity="secondary">
              <div title="General">
                <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">General</span>
                <i-mdi-information v-else />
              </div>
            </Tab>

            <Tab value="2" severity="secondary">
              <div title="Performance">
                <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">
                  Performance
                </span>
                <i-mdi-chart-line v-else />
              </div>
            </Tab>

            <Tab value="3" severity="secondary">
              <div title="Setups">
                <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">Setups</span>
                <i-mdi-radar v-else />
              </div>
            </Tab>

            <Tab value="4" severity="secondary">
              <div title="Balance">
                <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">Balance</span>
                <i-mdi-bank v-else />
              </div>
            </Tab>

            <Tab value="5" severity="secondary">
              <div title="Time Breakdown">
                <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">
                  Time Breakdown
                </span>
                <i-mdi-folder-clock v-else />
              </div>
            </Tab>

            <Tab value="6" severity="secondary">
              <div title="Pairlist">
                <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">Pairlist</span>
                <i-mdi-format-list-group v-else />
              </div>
            </Tab>

            <Tab value="7" severity="secondary">
              <div title="Pair Locks">
                <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">Pair Locks</span>
                <i-mdi-lock-alert v-else />
              </div>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel value="0">
              <PairSummary
                :pairlist="botStore.activeBot.whitelist"
                :current-locks="botStore.activeBot.activeLocks"
                :trades="botStore.activeBot.openTrades"
              />
            </TabPanel>

            <TabPanel value="1">
              <BotStatus />
            </TabPanel>

            <TabPanel value="2" lazy>
              <BotPerformance />
            </TabPanel>

            <TabPanel value="3" lazy>
              <TradeReadinessPanel :pairlist="botStore.activeBot.whitelist" />
            </TabPanel>

            <TabPanel value="4" lazy>
              <BotBalance />
            </TabPanel>

            <TabPanel value="5" lazy>
              <PeriodBreakdown />
            </TabPanel>

            <TabPanel value="6" lazy>
              <PairListLive />
            </TabPanel>

            <TabPanel value="7" lazy>
              <PairLockList />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </DraggableContainer>
      </aside>

      <div class="trade-main flex min-w-0 flex-1 flex-col gap-2">
      <div
        class="trade-section trade-section-chart"
        :style="{ flexBasis: `${tradeChartHeight}px` }"
      >
        <DraggableContainer header="Chart" class="h-full" content-overflow="hidden">
          <div class="trade-chart-content">
            <div class="chart-timeframe-bar">
              <button
                v-for="timeframe in chartTimeframes"
                :key="timeframe"
                type="button"
                class="timeframe-button"
                :class="{ active: chartTimeframe === timeframe }"
                @click="chartStore.selectedTimeframe = timeframe"
              >
                {{ timeframe }}
              </button>
            </div>
            <div class="trade-chart-body">
              <CandleChartContainer
                :available-pairs="botStore.activeBot.whitelist"
                :historic-view="!!false"
                :timeframe="chartTimeframe"
                :trades="botStore.activeBot.allTrades"
                @refresh-data="refreshOHLCV"
              />
            </div>
            <button
              class="trade-chart-height-handle"
              type="button"
              title="Drag to resize chart height"
              @pointerdown.prevent="startTradeChartResize"
            >
              <span></span>
            </button>
          </div>
        </DraggableContainer>
      </div>

      <div class="trade-section trade-section-open">
        <DraggableContainer header="Open Trades" content-overflow="visible">
          <TradeList
            v-if="hasOpenTrades"
            class="open-trades"
            :trades="botStore.activeBot.openTrades"
            title="Open trades"
            :active-trades="true"
            :page-scroll="true"
            empty-text="Currently no open trades."
          />
          <div v-else class="empty-section">Currently no open trades.</div>
        </DraggableContainer>
      </div>

      <div class="trade-section trade-section-detail">
        <DraggableContainer header="Trade Detail" content-overflow="visible">
          <TradeDetail
            v-if="selectedTrade"
            :trade="selectedTrade"
            :stake-currency="botStore.activeBot.stakeCurrency"
          />
          <div v-else class="empty-section">Select a trade to show details.</div>
        </DraggableContainer>
      </div>

      <div class="trade-section trade-section-closed">
        <DraggableContainer header="Closed Trades" content-overflow="visible">
          <TradeList
            v-if="hasClosedTrades"
            class="trade-history"
            :trades="botStore.activeBot.closedTrades"
            title="Trade history"
            :show-filter="true"
            :page-scroll="true"
            empty-text="No closed trades so far."
          />
          <div v-else class="empty-section">No closed trades so far.</div>
        </DraggableContainer>
      </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trade-page {
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.72), rgba(2, 6, 23, 0.2)),
    #020617;
}

.trade-command-center {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  border: 1px solid rgba(51, 65, 85, 0.82);
  border-radius: 12px;
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(8, 13, 23, 0.96)),
    #0b111a;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.24);
}

.trade-command-main {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.trade-kicker {
  color: var(--p-primary-300);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.trade-command-main h1 {
  margin: 2px 0 0;
  color: var(--p-surface-50);
  font-size: clamp(1.15rem, 2vw, 1.65rem);
  font-weight: 760;
  letter-spacing: 0;
}

.trade-command-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 7px;
}

.desk-chip {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  border: 1px solid rgba(71, 85, 105, 0.78);
  border-radius: 999px;
  padding: 0 10px;
  background: rgba(15, 23, 42, 0.86);
  color: var(--p-surface-300);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
}

.desk-chip.positive {
  border-color: rgba(20, 184, 166, 0.45);
  background: rgba(20, 184, 166, 0.12);
  color: #5eead4;
}

.desk-chip.neutral {
  color: var(--p-surface-400);
}

.trade-command-side {
  display: flex;
  min-width: min(28rem, 42%);
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  text-align: right;
}

.trade-strategy-label {
  max-width: 100%;
  overflow: hidden;
  color: var(--p-surface-400);
  font-size: 0.78rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.desk-action {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(0, 137, 161, 0.52);
  border-radius: 8px;
  padding: 0 12px;
  background: rgba(0, 137, 161, 0.13);
  color: var(--p-primary-100);
  font-size: 0.82rem;
  font-weight: 760;
  cursor: pointer;
}

.desk-action:hover {
  border-color: rgba(46, 224, 255, 0.72);
  background: rgba(0, 137, 161, 0.22);
}

.trade-workspace {
  min-height: 0;
}

.mix-panel {
  position: relative;
  flex: 0 0 316px;
  min-width: 316px;
  transition:
    flex-basis 0.16s ease,
    min-width 0.16s ease;
}

.mix-panel.closed {
  flex-basis: 42px;
  min-width: 42px;
}

.mix-panel-tab {
  position: sticky;
  top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 96px;
  border: 1px solid rgba(51, 65, 85, 0.9);
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.95);
  color: var(--p-surface-200);
  cursor: pointer;
}

.mix-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.mix-panel-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--p-surface-300);
  cursor: pointer;
}

.mix-panel-toggle:hover,
.mix-panel-tab:hover {
  background: var(--p-surface-800);
  color: var(--p-surface-50);
}

.trade-section {
  position: relative;
  min-height: 0;
}

.trade-section-chart {
  flex: 0 0 auto;
}

.trade-section-open {
  flex: 0 0 auto;
  min-height: 40px;
}

.trade-section-detail {
  flex: 0 0 auto;
  min-height: 40px;
}

.trade-section-closed {
  flex: 0 0 auto;
  min-height: 40px;
}

.empty-section {
  display: flex;
  min-height: 32px;
  align-items: center;
  justify-content: center;
  color: var(--p-surface-500);
  font-size: 0.875rem;
}

.chart-timeframe-bar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 4px;
  height: 36px;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 5px 10px;
  border-bottom: 1px solid rgba(30, 41, 59, 0.95);
  background: rgba(2, 6, 23, 0.34);
  scrollbar-width: thin;
}

.timeframe-button {
  flex: 0 0 auto;
  min-width: 34px;
  height: 25px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--p-surface-400);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.timeframe-button:hover {
  background: var(--p-surface-800);
  color: var(--p-surface-100);
}

.timeframe-button.active {
  background: linear-gradient(180deg, var(--p-primary-500), var(--p-primary-700));
  color: var(--p-primary-contrast-color);
}

@media (max-width: 640px) {
  .chart-timeframe-bar {
    height: auto;
    max-height: 64px;
    flex-wrap: wrap;
    overflow-y: auto;
  }
}

.trade-chart-content {
  position: relative;
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
}

.trade-chart-body {
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
}

.trade-chart-body :deep(> .flex) {
  height: 100%;
  min-height: 0;
}

.trade-chart-body :deep(.flex-fill) {
  min-height: 0;
}

.trade-chart-body :deep(.tradingview-chart-shell) {
  height: 100%;
}

.trade-chart-height-handle {
  position: absolute;
  left: 50%;
  bottom: 1px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 8px;
  border: 1px solid var(--p-surface-700);
  border-radius: 2px;
  background: color-mix(in srgb, var(--p-surface-900) 92%, transparent);
  cursor: ns-resize;
  opacity: 0.74;
  transform: translateX(-50%);
}

.trade-chart-height-handle:hover {
  opacity: 1;
}

.trade-chart-height-handle span,
.trade-chart-height-handle span::before,
.trade-chart-height-handle span::after {
  display: block;
  width: 18px;
  height: 1px;
  background: var(--p-surface-400);
  content: '';
}

.trade-chart-height-handle span::before {
  transform: translateY(-3px);
}

.trade-chart-height-handle span::after {
  transform: translateY(2px);
}

@media (max-width: 767px) {
  .trade-page {
    gap: 8px;
    padding: 8px;
  }

  .trade-command-center {
    flex-direction: column;
    gap: 10px;
    padding: 12px;
  }

  .trade-command-main {
    flex-direction: column;
    align-items: flex-start;
  }

  .trade-command-meta {
    justify-content: flex-start;
  }

  .trade-command-side {
    width: 100%;
    min-width: 0;
    align-items: stretch;
    text-align: left;
  }

  .desk-action {
    justify-content: center;
  }

  .trade-workspace {
    flex-direction: column;
    gap: 8px;
  }

  .mix-panel {
    flex: 0 0 auto;
    min-width: 0;
    width: 100%;
    max-height: 42vh;
    overflow: hidden;
  }

  .mix-panel.closed {
    flex-basis: 32px;
    min-width: 0;
    height: 32px;
  }

  .mix-panel-tab {
    position: relative;
    top: 0;
    width: 100%;
    height: 30px;
    border-radius: 8px;
  }

  .trade-main {
    width: 100%;
  }

  .trade-section-chart {
    flex-basis: clamp(420px, 62vh, 680px) !important;
  }

  .trade-chart-height-handle {
    display: none;
  }
}
</style>
