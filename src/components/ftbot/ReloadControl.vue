<template>
  <div>
    <button @click="refreshAll()" class="btn btn-secondary">Refresh all</button>

    <b-form-checkbox class="float-right" v-model="autoRefreshLoc" size="lg" switch
      >AutoRefresh</b-form-checkbox
    >
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';

@Component({})
export default class ReloadControl extends Vue {
  refreshInterval: NodeJS.Timer | null = null;

  refreshIntervalSlow: NodeJS.Timer | null = null;

  created() {
    if (this.loggedIn) {
      this.refreshOnce();
      this.refreshAll();
    }
  }

  mounted() {
    this.startRefresh();
  }

  beforeDestroy() {
    this.stopRefresh();
  }

  @State loggedIn;

  @State autoRefresh!: boolean;

  @Action setAutoRefresh!: (newValue: boolean) => void;

  @Action refreshSlow;

  @Action refreshFrequent;

  @Action refreshAll;

  @Action refreshOnce;

  get autoRefreshLoc() {
    return this.autoRefresh;
  }

  set autoRefreshLoc(newValue: boolean) {
    this.setAutoRefresh(newValue);
  }

  startRefresh() {
    if (this.loggedIn !== true) {
      console.log('Not logged in.');
      return;
    }
    console.log('Starting automatic refresh.');
    this.refreshFrequent();
    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.refreshFrequent();
      }, 5000);
    }
    this.refreshSlow();
    if (this.autoRefresh) {
      this.refreshIntervalSlow = setInterval(() => {
        this.refreshSlow();
      }, 60000);
    }
  }

  stopRefresh() {
    console.log('Stopping automatic refresh.');
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.refreshIntervalSlow) {
      clearInterval(this.refreshIntervalSlow);
    }
  }

  @Watch('autoRefresh')
  watchAutoRefresh(val) {
    if (val) {
      this.startRefresh();
    } else {
      this.stopRefresh();
    }
  }
}
</script>

<style scoped></style>
