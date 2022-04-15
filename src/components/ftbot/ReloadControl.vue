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
import RefreshIcon from 'vue-material-design-icons/Refresh.vue';
import { MultiBotStoreGetters } from '@/store/modules/botStoreWrapper';
import StoreModules from '@/store/storeSubModules';
import { defineComponent, computed } from '@vue/composition-api';
import { useNamespacedActions, useNamespacedGetters } from 'vuex-composition-helpers';

export default defineComponent({
  name: 'ReloadControl',
  components: { RefreshIcon },
  setup() {
    const { globalAutoRefresh } = useNamespacedGetters(StoreModules.ftbot, [
      MultiBotStoreGetters.globalAutoRefresh,
    ]);
    const { setGlobalAutoRefresh, allRefreshFull } = useNamespacedActions(StoreModules.ftbot, [
      'setGlobalAutoRefresh',
      'allRefreshFull',
    ]);
    const autoRefreshLoc = computed({
      get() {
        return globalAutoRefresh.value;
      },
      set(newValue: boolean) {
        setGlobalAutoRefresh(newValue);
      },
    });

    return {
      globalAutoRefresh,
      setGlobalAutoRefresh,
      allRefreshFull,
      autoRefreshLoc,
    };
  },
});
</script>

<style scoped></style>
