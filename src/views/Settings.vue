<template>
  <div class="container mt-3">
    <b-card header="FreqUI Settings">
      <div class="text-left">
        <p>UI Version: {{ settingsStore.uiVersion }}</p>
        <b-form-group
          description="Lock dynamic layouts, so they cannot move anymore. Can also be set from the navbar at the top."
        >
          <b-checkbox v-model="layoutStore.layoutLocked">Lock layout</b-checkbox>
        </b-form-group>
        <b-form-group description="Reset dynamic layouts to how they were.">
          <b-button size="sm" @click="resetDynamicLayout">Reset layout</b-button>
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
          <b-checkbox v-model="settingsStore.backgroundSync">Background sync</b-checkbox>
        </b-form-group>
        <b-form-group description="Use Heikin Ashi candles in your charts">
          <b-checkbox v-model="settingsStore.useHeikinAshiCandles"
            >Use Heikin Ashi candles.</b-checkbox
          >
        </b-form-group>
      </div>
    </b-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { OpenTradeVizOptions, useSettingsStore } from '@/stores/settings';
import { useLayoutStore } from '@/stores/layout';
import { showAlert } from '@/stores/alerts';

export default defineComponent({
  name: 'Settings',
  setup() {
    const settingsStore = useSettingsStore();
    const layoutStore = useLayoutStore();

    const timezoneOptions = ['UTC', Intl.DateTimeFormat().resolvedOptions().timeZone];
    const openTradesOptions = [
      { value: OpenTradeVizOptions.showPill, text: 'Show pill in icon' },
      { value: OpenTradeVizOptions.asTitle, text: 'Show in title' },
      { value: OpenTradeVizOptions.noOpenTrades, text: "Don't show open trades in header" },
    ];

    //
    const resetDynamicLayout = () => {
      layoutStore.resetTradingLayout();
      layoutStore.resetDashboardLayout();
      showAlert('Layouts have been reset.');
    };
    return {
      resetDynamicLayout,
      settingsStore,
      layoutStore,
      timezoneOptions,
      openTradesOptions,
    };
  },
});
</script>

<style scoped></style>
