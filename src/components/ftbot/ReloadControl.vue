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
import { Component, Vue } from 'vue-property-decorator';
import { Getter, namespace } from 'vuex-class';
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

  @ftbot.Action refreshAll;

  @ftbot.Action refreshOnce;

  @ftbot.Action startRefresh;

  @ftbot.Action stopRefresh;

  get autoRefreshLoc() {
    return this.autoRefresh;
  }

  set autoRefreshLoc(newValue: boolean) {
    this.setAutoRefresh(newValue);
  }
}
</script>

<style scoped></style>
