<template>
  <div class="d-flex flex-align-center ml-2">
    <b-form-checkbox
      v-model="autoRefreshLoc"
      class="ml-auto float-right my-auto"
      title="AutoRefresh"
    ></b-form-checkbox>
    <b-button
      class="m-1"
      variant="secondary"
      size="sm"
      title="Auto Refresh All bots"
      @click="allRefreshFull"
    >
      <RefreshIcon :size="16" />
    </b-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import RefreshIcon from 'vue-material-design-icons/Refresh.vue';
import { MultiBotStoreGetters } from '@/store/modules/botStoreWrapper';
import StoreModules from '@/store/storeSubModules';

const ftbot = namespace(StoreModules.ftbot);

@Component({ components: { RefreshIcon } })
export default class ReloadControl extends Vue {
  refreshInterval: number | null = null;

  refreshIntervalSlow: number | null = null;

  @ftbot.Getter [MultiBotStoreGetters.globalAutoRefresh]!: boolean;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action setGlobalAutoRefresh!: (newValue: boolean) => void;

  @ftbot.Action allRefreshFull;

  get autoRefreshLoc() {
    return this.globalAutoRefresh;
  }

  set autoRefreshLoc(newValue: boolean) {
    this.setGlobalAutoRefresh(newValue);
  }
}
</script>

<style scoped></style>
