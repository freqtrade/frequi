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
      </div>
    </b-card>
  </div>
</template>

<script lang="ts">
import { LayoutActions, LayoutGetters } from '@/store/modules/layout';
import { SettingsActions, SettingsGetters } from '@/store/modules/settings';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const layoutNs = namespace('layout');
const uiSettingsNs = namespace('uiSettings');

@Component({})
export default class Template extends Vue {
  @layoutNs.Getter [LayoutGetters.getLayoutLocked]: boolean;

  @layoutNs.Action [LayoutActions.setLayoutLocked];

  @uiSettingsNs.Getter [SettingsGetters.openTradesInTitle]: string;

  @uiSettingsNs.Action [SettingsActions.setOpenTradesInTitle];

  openTradesOptions = [
    { value: 'showPill', text: 'Show pill in icon' },
    { value: 'asTitle', text: 'Show in title' },
    { value: 'noOpenTrades', text: "Don't show open trades in header" },
  ];

  get openTradesVisualization() {
    return this.openTradesInTitle;
  }

  set openTradesVisualization(value: string) {
    console.log('show_open_trades', value);
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
