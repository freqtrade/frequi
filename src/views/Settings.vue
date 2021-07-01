<template>
  <div class="container mt-3">
    <b-card header="FreqUI Settings">
      <div class="text-left">
        <b-form-group
          description="Lock dynamic layouts, so they cannot move anymore.\nCan also be set from the navbar at the top."
        >
          <b-checkbox v-model="layoutLockedLocal">Lock layout</b-checkbox>
        </b-form-group>
        <b-form-group
          label="Show open trades in header"
          description="Decide if open trades should be visualized"
        >
          <b-form-select
            v-model="openTradesVisualization"
            :options="openTradesOptions"
          ></b-form-select>
        </b-form-group>
        <b-form-group
          label="UTC Timezone"
          description="Select timezone (we recommend UTC is recommended as exchanges usually work in UTC)"
        >
          <b-form-select v-model="timezoneLoc" :options="timezoneOptions"></b-form-select>
        </b-form-group>
      </div>
    </b-card>
  </div>
</template>

<script lang="ts">
import { LayoutActions, LayoutGetters } from '@/store/modules/layout';
import { OpenTradeVizOptions, SettingsActions, SettingsGetters } from '@/store/modules/settings';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const layoutNs = namespace('layout');
const uiSettingsNs = namespace('uiSettings');

@Component({})
export default class Template extends Vue {
  @layoutNs.Getter [LayoutGetters.getLayoutLocked]: boolean;

  @layoutNs.Action [LayoutActions.setLayoutLocked];

  @uiSettingsNs.Getter [SettingsGetters.openTradesInTitle]: string;

  @uiSettingsNs.Getter [SettingsGetters.timezone]: string;

  @uiSettingsNs.Action [SettingsActions.setOpenTradesInTitle];

  @uiSettingsNs.Action [SettingsActions.setTimeZone];

  openTradesOptions = [
    { value: OpenTradeVizOptions.showPill, text: 'Show pill in icon' },
    { value: OpenTradeVizOptions.asTitle, text: 'Show in title' },
    { value: OpenTradeVizOptions.noOpenTrades, text: "Don't show open trades in header" },
  ];

  // Careful when adding new timezones here - eCharts only supports UTC or user timezone
  timezoneOptions = ['UTC', Intl.DateTimeFormat().resolvedOptions().timeZone];

  get timezoneLoc() {
    return this.timezone;
  }

  set timezoneLoc(value: string) {
    this[SettingsActions.setTimeZone](value);
  }

  get openTradesVisualization() {
    return this.openTradesInTitle;
  }

  set openTradesVisualization(value: string) {
    this.setOpenTradesInTitle(value);
  }

  get layoutLockedLocal() {
    return this.getLayoutLocked;
  }

  set layoutLockedLocal(value: boolean) {
    this.setLayoutLocked(value);
  }
}
</script>

<style scoped></style>
