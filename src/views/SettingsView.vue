<script setup lang="ts">
import { OpenTradeVizOptions, useSettingsStore } from '@/stores/settings';
import { useLayoutStore } from '@/stores/layout';
import { FtWsMessageTypes } from '@/types/wsMessageTypes';
import { ColorPreferences, useColorStore } from '@/stores/colors';

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
  <div class="container mt-3">
    <BCard header="FreqUI Settings">
      <div class="text-start d-flex flex-column gap-2">
        <p>UI Version: {{ settingsStore.uiVersion }}</p>
        <div class="d-flex flex-column border rounded p-2 mb-2 gap-2">
          <h4>UI settings</h4>
          <BFormGroup
            description="Lock dynamic layouts, so they cannot move anymore. Can also be set from the navbar at the top."
          >
            <BFormCheckbox v-model="layoutStore.layoutLocked">Lock layout</BFormCheckbox>
          </BFormGroup>
          <BFormGroup description="Reset dynamic layouts to how they were.">
            <BButton size="sm" class="me-1" @click="resetDynamicLayout">Reset layout</BButton>
          </BFormGroup>
          <BFormGroup
            label="Show open trades in header"
            description="Decide if open trades should be visualized"
          >
            <BFormSelect
              v-model="settingsStore.openTradesInTitle"
              :options="openTradesOptions"
            ></BFormSelect>
          </BFormGroup>
          <BFormGroup
            label="UTC Timezone"
            description="Select timezone (we recommend UTC is recommended as exchanges usually work in UTC)"
          >
            <BFormSelect v-model="settingsStore.timezone" :options="timezoneOptions"></BFormSelect>
          </BFormGroup>
          <BFormGroup description="Keep background sync running while other bots are selected.">
            <BFormCheckbox v-model="settingsStore.backgroundSync">Background sync</BFormCheckbox>
          </BFormGroup>
          <BFormGroup description="Use confirmation dialogs when force-exiting a trade.">
            <BFormCheckbox v-model="settingsStore.confirmDialog"
              >Show Confirm Dialog for Trade Exits</BFormCheckbox
            >
          </BFormGroup>
        </div>

        <div class="d-flex flex-column border rounded p-2 mb-2 gap-2">
          <h4>Chart settings</h4>
          <BFormGroup
            description="Chart scale Side (Should the scale be displayed on the right or left?)"
          >
            <BFormRadioGroup
              v-model="settingsStore.chartLabelSide"
              name="chart-preference-options"
              :options="[
                { value: 'left', text: 'Left' },
                { value: 'right', text: 'Right' },
              ]"
            ></BFormRadioGroup>
          </BFormGroup>

          <BFormGroup description="Use Heikin Ashi candles in your charts">
            <BFormCheckbox v-model="settingsStore.useHeikinAshiCandles"
              >Use Heikin Ashi candles.</BFormCheckbox
            >
          </BFormGroup>
          <BFormGroup
            description="Can reduce the transfer size for large dataframes. May require additional calls if the plot config changes."
          >
            <BFormCheckbox v-model="settingsStore.useReducedPairCalls"
              >Only request necessary columns (recommended to be checked).</BFormCheckbox
            >
          </BFormGroup>
          <BFormGroup description="Candle Color Preference">
            <BFormRadioGroup
              id="settings-color-preference-radio-group"
              v-model="colorStore.colorPreference"
              name="color-preference-options"
              @change="colorStore.updateProfitLossColor"
            >
              <BFormRadio
                v-for="option in colorPreferenceOptions"
                :key="option.value"
                :value="option.value"
              >
                <div class="d-flex">
                  <span class="me-2">{{ option.text }}</span>
                  <i-mdi-arrow-up-thin
                    :color="
                      option.value === ColorPreferences.GREEN_UP
                        ? colorStore.colorProfit
                        : colorStore.colorLoss
                    "
                    class="color-candle-arrows"
                  />
                  <i-mdi-arrow-down-thin
                    :color="
                      option.value === ColorPreferences.GREEN_UP
                        ? colorStore.colorLoss
                        : colorStore.colorProfit
                    "
                    class="color-candle-arrows"
                  />
                </div>
              </BFormRadio>
            </BFormRadioGroup>
          </BFormGroup>
        </div>
        <div class="d-flex flex-column border rounded p-2 mb-2 gap-2">
          <BFormGroup description="Notifications">
            <h4>Notification Settings</h4>
            <BFormCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.entryFill]"
              >Entry notifications</BFormCheckbox
            >
            <BFormCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.exitFill]"
              >Exit notifications</BFormCheckbox
            >
            <BFormCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.entryCancel]"
              >Entry Cancel notifications</BFormCheckbox
            >
            <BFormCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.exitCancel]"
              >Exit Cancel notifications</BFormCheckbox
            >
          </BFormGroup>
        </div>
      </div>
    </BCard>
  </div>
</template>

<style lang="scss" scoped>
.color-candle-arrows {
  margin-left: -0.5rem;
  margin-top: 2px;
}
</style>
