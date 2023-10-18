<template>
  <div class="container mt-3">
    <b-card header="FreqUI Settings">
      <div class="text-start">
        <p>UI Version: {{ settingsStore.uiVersion }}</p>
        <b-form-group
          description="Lock dynamic layouts, so they cannot move anymore. Can also be set from the navbar at the top."
        >
          <b-form-checkbox v-model="layoutStore.layoutLocked">Lock layout</b-form-checkbox>
        </b-form-group>
        <b-form-group description="Reset dynamic layouts to how they were.">
          <b-button size="sm" class="me-1" @click="resetDynamicLayout">Reset layout</b-button>
        </b-form-group>
        <b-form-group description="Color Preference">
          <b-form-radio-group
            id="settings-color-preference-radio-group"
            v-model="settingsStore.colorPreference"
            :options="colorPreferenceOptions"
            name="color-preference-options"
          ></b-form-radio-group>
        </b-form-group>
        <b-form-group
          label="Show open trades in header"
          description="Decide if open trades should be visualized"
        >
          <b-form-select
            v-model="settingsStore.openTradesInTitle"
            :options="openTradesOptions"
          ></b-form-select>
        </b-form-group>
        <b-form-group
          label="UTC Timezone"
          description="Select timezone (we recommend UTC is recommended as exchanges usually work in UTC)"
        >
          <b-form-select
            v-model="settingsStore.timezone"
            :options="timezoneOptions"
          ></b-form-select>
        </b-form-group>
        <b-form-group description="Keep background sync running while other bots are selected.">
          <b-form-checkbox v-model="settingsStore.backgroundSync">Background sync</b-form-checkbox>
        </b-form-group>
        <b-form-group description="Use Heikin Ashi candles in your charts">
          <b-form-checkbox v-model="settingsStore.useHeikinAshiCandles"
            >Use Heikin Ashi candles.</b-form-checkbox
          >
        </b-form-group>
        <b-form-group description="Notifications">
          <b-form-checkbox v-model="settingsStore.notifications[FtWsMessageTypes.entryFill]"
            >Entry notifications</b-form-checkbox
          >
          <b-form-checkbox v-model="settingsStore.notifications[FtWsMessageTypes.exitFill]"
            >Exit notifications</b-form-checkbox
          >
          <b-form-checkbox v-model="settingsStore.notifications[FtWsMessageTypes.entryCancel]"
            >Entry Cancel notifications</b-form-checkbox
          >
          <b-form-checkbox v-model="settingsStore.notifications[FtWsMessageTypes.exitCancel]"
            >Exit Cancel notifications</b-form-checkbox
          >
        </b-form-group>
      </div>
    </b-card>
  </div>
</template>

<script setup lang="ts">
import { OpenTradeVizOptions, useSettingsStore } from '@/stores/settings';
import { useLayoutStore } from '@/stores/layout';
import { showAlert } from '@/shared/alerts';
import { FtWsMessageTypes } from '@/types/wsMessageTypes';

const settingsStore = useSettingsStore();
const layoutStore = useLayoutStore();

const timezoneOptions = ['UTC', Intl.DateTimeFormat().resolvedOptions().timeZone];
const openTradesOptions = [
  { value: OpenTradeVizOptions.showPill, text: 'Show pill in icon' },
  { value: OpenTradeVizOptions.asTitle, text: 'Show in title' },
  { value: OpenTradeVizOptions.noOpenTrades, text: "Don't show open trades in header" },
];
const colorPreferenceOptions = [
  { value: 'greenUp', text: 'Green Up/Red Down' },
  { value: 'redUp', text: 'Green Down/Red Up' },
];

//
const resetDynamicLayout = () => {
  layoutStore.resetTradingLayout();
  layoutStore.resetDashboardLayout();
  showAlert('Layouts have been reset.');
};
</script>

<style scoped></style>
