<script setup lang="ts">
import { FtWsMessageTypes } from '@/types/wsMessageTypes';

const settingsStore = useSettingsStore();
const colorStore = useColorStore();
const layoutStore = useLayoutStore();
const botStore = useBotStore();

const timezoneOptions = ['UTC', Intl.DateTimeFormat().resolvedOptions().timeZone];
const openTradesOptions = [
  { value: OpenTradeVizOptions.showPill, text: 'Show pill in icon' },
  { value: OpenTradeVizOptions.asTitle, text: 'Show in title' },
  { value: OpenTradeVizOptions.noOpenTrades, text: "Don't show open trades in header" },
];
const maxTradesOptions = [
  { value: 500, text: '500 trades' },
  { value: 1000, text: '1000 trades' },
  { value: 2000, text: '2000 trades' },
  { value: 5000, text: '5000 trades' },
  { value: 0, text: 'Unlimited' },
];
const colorPreferenceOptions = [
  { value: ColorPreferences.GREEN_UP, text: 'Green Up/Red Down' },
  { value: ColorPreferences.RED_UP, text: 'Green Down/Red Up' },
];

const resetDynamicLayout = () => {
  layoutStore.resetTradingLayout();
  layoutStore.resetDashboardLayout();
  showAlert('Layouts have been reset.');
};

// Timers need to be re-created when the intervals change.
watch(
  () => [settingsStore.frequentRefreshInterval, settingsStore.slowRefreshInterval],
  () => botStore.restartRefreshTimers(),
);
</script>

<template>
  <Card class="mx-auto mt-3 p-4 max-w-4xl">
    <template #title>FreqUI Settings</template>
    <template #content>
      <div class="flex flex-col gap-4 text-start dark:text-surface-300">
        <p class="text-left">UI Version: {{ settingsStore.uiVersion }}</p>

        <div class="border border-surface-400 rounded-sm p-4 space-y-4">
          <h4 class="text-xl font-semibold">UI settings</h4>

          <BaseCheckbox v-model="layoutStore.layoutLocked" class="space-y-1">
            Lock dynamic layouts
            <template #hint>
              Lock dynamic layouts, so they cannot move anymore. Can also be set from the navbar at
              the top.
            </template>
          </BaseCheckbox>

          <div class="flex flex-row items-center gap-2 space-y-2">
            <Button severity="secondary" size="small" class="mb-0" @click="resetDynamicLayout"
              >Reset layout</Button
            >
            <small class="block text-surface-600 dark:text-surface-400"
              >Reset dynamic layouts to how they were.</small
            >
          </div>

          <Divider />

          <div class="space-y-1">
            <label class="block text-sm">Show open trades in header</label>
            <Select
              v-model="settingsStore.openTradesInTitle"
              :options="openTradesOptions"
              option-label="text"
              option-value="value"
              size="small"
              class="w-full"
            />
            <small class="text-surface-600 dark:text-surface-400"
              >Decide if open trades should be visualized</small
            >
          </div>

          <div class="space-y-1">
            <label class="block text-sm">UTC Timezone</label>
            <Select
              v-model="settingsStore.timezone"
              :options="timezoneOptions"
              class="w-full"
              size="small"
            />
            <small class="text-surface-600 dark:text-surface-400"
              >Select timezone (UTC is recommended as exchanges usually work in UTC)</small
            >
          </div>

          <BaseCheckbox v-model="settingsStore.backgroundSync" class="space-y-1">
            Background sync
            <template #hint> Keep background sync running while other bots are selected. </template>
          </BaseCheckbox>

          <BaseCheckbox v-model="settingsStore.confirmDialog" class="space-y-1">
            Show Confirm Dialog for Trade Exits
            <template #hint
              >Use confirmation dialogs when force-exiting a trade.<br />
              This will also show <i-mdi-run-fast class="text-yellow-300 inline" />
              <i-mdi-alert class="text-yellow-300 inline" />
              in the title bar.
            </template>
          </BaseCheckbox>

          <BaseCheckbox v-model="settingsStore.multiPaneButtonsShowText" class="space-y-1">
            Show Text on Multi Pane Buttons
            <template #hint
              >Show text on multi pane buttons. If disabled, only shows images.</template
            >
          </BaseCheckbox>
        </div>

        <div class="border border-surface-400 rounded-sm p-4 space-y-4">
          <h4 class="text-lg font-semibold">Chart settings</h4>

          <div class="space-y-1">
            <label class="block text-sm">Chart scale Side</label>
            <div class="flex gap-4">
              <div class="flex items-center">
                <RadioButton v-model="settingsStore.chartLabelSide" value="left" size="small" />
                <label class="ml-2">Left</label>
              </div>
              <div class="flex items-center">
                <RadioButton v-model="settingsStore.chartLabelSide" value="right" size="small" />
                <label class="ml-2">Right</label>
              </div>
            </div>
            <small class="text-surface-600 dark:text-surface-400">
              Should the scale be displayed on the right or left?
            </small>
          </div>

          <BaseCheckbox v-model="settingsStore.useHeikinAshiCandles" class="space-y-1">
            Use Heikin Ashi candles
            <template #hint>Use Heikin Ashi candles in your charts</template>
          </BaseCheckbox>

          <BaseCheckbox v-model="settingsStore.useReducedPairCalls" class="space-y-1">
            Only request necessary columns
            <template #hint
              >Can reduce the transfer size for large dataframes. May require additional calls if
              the plot config changes.</template
            >
          </BaseCheckbox>

          <div class="space-y-1">
            <label class="block text-sm">Maximum number of trades to load</label>
            <Select
              v-model="settingsStore.maxTradesLoaded"
              :options="maxTradesOptions"
              option-label="text"
              option-value="value"
              class="w-full md:w-64"
            />
            <small class="text-surface-600 dark:text-surface-400">
              Trade history can easily be several MB for long running bots. Limiting the number of
              trades loaded will speed up the UI, but older trades won't be available in the trade
              list.
            </small>
          </div>

          <div>
            <p>Automatic refresh intervals (in ms)</p>
            <div class="flex flex-row gap-5 w-full items-center">
              <span class="w-56">Open trades / locks</span>
              <InputNumber
                v-model="settingsStore.frequentRefreshInterval"
                :step="1000"
                :min="1000"
                :max="600000"
                size="small"
              />
            </div>
            <div class="flex flex-row gap-5 w-full items-center mt-2">
              <span class="w-56">Trade history / balance</span>
              <InputNumber
                v-model="settingsStore.slowRefreshInterval"
                :step="5000"
                :min="5000"
                :max="3600000"
                size="small"
              />
            </div>
            <small class="text-surface-600 dark:text-surface-400">
              Increase these values to reduce the load on the bot, at the cost of slower updates.
            </small>
          </div>

          <div>
            <p>Default number of candles to display (defaults to 250)</p>
            <div class="flex flex-row gap-5 w-full items-center">
              <Slider
                v-model="settingsStore.chartDefaultCandleCount"
                class="flex-1"
                :step="50"
                :min="100"
                :max="2000"
              />
              <InputNumber
                v-model="settingsStore.chartDefaultCandleCount"
                :step="50"
                :min="100"
                :max="2000"
                size="small"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block">Candle Color Preference</label>
            <div class="flex flex-row gap-5 items-center">
              <div
                v-for="option in colorPreferenceOptions"
                :key="option.value"
                class="flex items-center"
              >
                <RadioButton
                  v-model="colorStore.colorPreference"
                  :value="option.value"
                  :input-id="`input-id${option.value}`"
                  size="small"
                  @change="colorStore.updateProfitLossColor"
                />
                <label :for="`input-id${option.value}`" class="ml-2 flex items-center">
                  <span class="mr-2">{{ option.text }}</span>
                  <i-mdi-arrow-up-thin
                    :color="
                      option.value === ColorPreferences.GREEN_UP
                        ? colorStore.colorProfit
                        : colorStore.colorLoss
                    "
                    class="-ml-2"
                  />
                  <i-mdi-arrow-down-thin
                    :color="
                      option.value === ColorPreferences.GREEN_UP
                        ? colorStore.colorLoss
                        : colorStore.colorProfit
                    "
                    class="-ml-2"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="border rounded-sm p-4 space-y-4">
          <h4 class="text-lg font-semibold">Notification Settings</h4>
          <div class="space-y-2">
            <BaseCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.entryFill]">
              Entry notifications
            </BaseCheckbox>
            <BaseCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.exitFill]">
              Exit notifications
            </BaseCheckbox>
            <BaseCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.entryCancel]">
              Entry Cancel notifications
            </BaseCheckbox>
            <BaseCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.exitCancel]">
              Exit Cancel notifications
            </BaseCheckbox>
          </div>
        </div>

        <div class="border rounded-sm p-4 space-y-4">
          <h4 class="text-lg font-semibold">Backtesting settings</h4>
          <div>
            <label for="backtestMetrics" class="block text-sm">Backtesting metrics</label>
            <MultiSelect
              id="backtestMetrics"
              v-model="settingsStore.backtestAdditionalMetrics"
              :options="availableBacktestMetrics"
              option-label="header"
              option-value="field"
              class="w-full"
              size="small"
              display="chip"
            />
            <small class="text-surface-600 dark:text-surface-400"
              >Select which metrics should be shown on a per pair / tag basis.</small
            >
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
