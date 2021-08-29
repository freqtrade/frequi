<template>
  <div class="d-flex flex-align-center">
    <b-button class="m-1 mr-3" variant="secondary" size="sm" @click="refreshAll(true)">
      <RefreshIcon :size="16" />
    </b-button>

    <b-form-checkbox
      v-model="autoRefreshLoc"
      class="ml-auto float-right mr-2 my-auto"
      title="AutoRefresh"
      variant="secondary"
      >AutoRefresh</b-form-checkbox
    >
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Getter, State, namespace } from 'vuex-class';
import RefreshIcon from 'vue-material-design-icons/Refresh.vue';

const ftbot = namespace('ftbot');

@Component({ components: { RefreshIcon } })
export default class ReloadControl extends Vue {
  refreshInterval: number | null = null;

  refreshIntervalSlow: number | null = null;

  created() {
    if (this.loggedIn) {
      this.refreshOnce();
      this.refreshAll(true);
    }
  }

  mounted() {
    this.startRefresh(false);
  }

  beforeDestroy() {
    this.stopRefresh();
  }

  // TODO-multi: This should be per bot!
  @Getter loggedIn;

  @ftbot.Getter autoRefresh!: boolean;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action setAutoRefresh!: (newValue: boolean) => void;

  @ftbot.Action refreshSlow;

  @ftbot.Action refreshFrequent;

  @ftbot.Action refreshAll;

  @ftbot.Action refreshOnce;

  get autoRefreshLoc() {
    return this.autoRefresh;
  }

  set autoRefreshLoc(newValue: boolean) {
    this.setAutoRefresh(newValue);
  }

  startRefresh(runNow: boolean) {
    if (this.loggedIn !== true) {
      console.log('Not logged in.');
      return;
    }
    console.log('Starting automatic refresh.');
    if (runNow) {
      this.refreshFrequent(false);
    }
    if (this.autoRefresh) {
      this.refreshInterval = window.setInterval(() => {
        this.refreshFrequent();
      }, 5000);
    }
    if (runNow) {
      this.refreshSlow(true);
    }
    if (this.autoRefresh) {
      this.refreshIntervalSlow = window.setInterval(() => {
        this.refreshSlow(false);
      }, 60000);
    }
  }

  stopRefresh() {
    console.log('Stopping automatic refresh.');
    if (this.refreshInterval) {
      window.clearInterval(this.refreshInterval);
    }
    if (this.refreshIntervalSlow) {
      window.clearInterval(this.refreshIntervalSlow);
    }
  }

  @Watch('autoRefresh')
  watchAutoRefresh(val) {
    if (val) {
      this.startRefresh(true);
    } else {
      this.stopRefresh();
    }
  }
}
</script>

<style scoped></style>
