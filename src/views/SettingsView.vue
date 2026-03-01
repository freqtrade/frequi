<script setup lang="ts">
import { FtWsMessageTypes } from '@/types/wsMessageTypes';

const settingsStore = useSettingsStore();
const colorStore = useColorStore();
const layoutStore = useLayoutStore();

const timezoneOptions = ['UTC', Intl.DateTimeFormat().resolvedOptions().timeZone];
const openTradesOptions = [
  { value: OpenTradeVizOptions.showPill, text: 'Show pill in icon' },
  { value: OpenTradeVizOptions.asTitle, text: 'Show in title' },
  { value: OpenTradeVizOptions.noOpenTrades, text: "Don't show open trades in header" },
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
</script>

<template>
  <UCard class="mx-auto mt-3 p-4 max-w-4xl">
    <template #header>FreqUI Settings</template>
    <div class="flex flex-col gap-4 text-start dark:text-neutral-300">
      <p class="text-left">UI Version: {{ settingsStore.uiVersion }}</p>

      <div class="border border-neutral-400 rounded-sm p-4 space-y-4">
        <h4 class="text-xl font-semibold">UI settings</h4>

        <BaseCheckbox v-model="layoutStore.layoutLocked" class="space-y-1">
          Lock dynamic layouts
          <template #hint>
            Lock dynamic layouts, so they cannot move anymore. Can also be set from the navbar at
            the top.
          </template>
        </BaseCheckbox>

        <div class="flex flex-row items-center gap-2 space-y-2">
          <UButton color="neutral" size="md" class="mb-0" @click="resetDynamicLayout"
            >Reset layout</UButton
          >
          <small class="text-sm block text-neutral-600 dark:text-neutral-400"
            >Reset dynamic layouts to how they were.</small
          >
        </div>

        <USeparator />

        <div class="space-y-1">
          <label class="block text-sm">Show open trades in header</label>
          <USelect
            v-model="settingsStore.openTradesInTitle"
            :items="openTradesOptions"
            label-key="text"
            value-key="value"
            class="w-full"
          />
          <small class="text-sm text-neutral-600 dark:text-neutral-400"
            >Decide if open trades should be visualized</small
          >
        </div>

        <div class="space-y-1">
          <label class="block text-sm">UTC Timezone</label>
          <USelect v-model="settingsStore.timezone" :items="timezoneOptions" class="w-full" />
          <small class="text-sm text-neutral-600 dark:text-neutral-400"
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

      <div class="border border-neutral-400 rounded-sm p-4 space-y-4">
        <h4 class="text-lg font-semibold">Chart settings</h4>

        <div class="space-y-1">
          <label class="block text-sm">Chart scale Side</label>
          <URadioGroup
            v-model="settingsStore.chartLabelSide"
            :items="[
              { label: 'Left', value: 'left' },
              { label: 'Right', value: 'right' },
            ]"
            orientation="horizontal"
          />
          <small class="text-sm text-neutral-600 dark:text-neutral-400">
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
            >Can reduce the transfer size for large dataframes. May require additional calls if the
            plot config changes.</template
          >
        </BaseCheckbox>

        <div>
          <p>Default number of candles to display (defaults to 250)</p>
          <div class="flex flex-row gap-5 w-full items-center">
            <USlider
              v-model="settingsStore.chartDefaultCandleCount"
              class="flex-1"
              :step="50"
              :min="100"
              :max="2000"
            />
            <UInputNumber
              v-model="settingsStore.chartDefaultCandleCount"
              :step="50"
              :min="100"
              :max="2000"
              size="sm"
            />
          </div>
        </div>

        <div class="space-y-1">
          <label class="block">Candle Color Preference</label>
          <div class="flex flex-row gap-5 items-center">
            <URadioGroup
              v-model="colorStore.colorPreference"
              :items="colorPreferenceOptions"
              label-key="text"
              value-key="value"
              orientation="horizontal"
            >
              <template #label="{ item }">
                <div class="flex items-center">
                  <span class="mr-2">{{ item.text }}</span>
                  <UIcon
                    :name="
                      item.value === ColorPreferences.GREEN_UP
                        ? 'mdi:arrow-up-thin'
                        : 'mdi:arrow-down-thin'
                    "
                    :color="
                      item.value === ColorPreferences.GREEN_UP
                        ? colorStore.colorProfit
                        : colorStore.colorLoss
                    "
                    class="-ml-2 size-5"
                  />
                  <UIcon
                    :name="
                      item.value === ColorPreferences.GREEN_UP
                        ? 'mdi:arrow-down-thin'
                        : 'mdi:arrow-up-thin'
                    "
                    :color="
                      item.value === ColorPreferences.GREEN_UP
                        ? colorStore.colorLoss
                        : colorStore.colorProfit
                    "
                    class="-ml-2 size-5"
                  />
                </div>
              </template>
            </URadioGroup>
          </div>
        </div>
      </div>

      <div class="border rounded-sm border-neutral-400 p-4 space-y-4">
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

      <div class="border rounded-sm border-neutral-400 p-4 space-y-4">
        <h4 class="text-lg font-semibold">Backtesting settings</h4>
        <div>
          <label for="backtestMetrics" class="block">Backtesting metrics</label>
          <USelectMenu
            multiple
            id="backtestMetrics"
            v-model="settingsStore.backtestAdditionalMetrics"
            :items="availableBacktestMetrics"
            label-key="header"
            value-key="field"
            class="w-full"
            display="chip"
          />
          <small class="text-sm text-neutral-600 dark:text-neutral-400"
            >Select which metrics should be shown on a per pair / tag basis.</small
          >
        </div>
      </div>
    </div>
  </UCard>
</template>
