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
      @click="botStore.allRefreshFull"
    >
      <RefreshIcon :size="16" />
    </b-button>
  </div>
</template>

<script lang="ts">
import RefreshIcon from 'vue-material-design-icons/Refresh.vue';
import { defineComponent, computed } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';

export default defineComponent({
  name: 'ReloadControl',
  components: { RefreshIcon },
  setup() {
    const botStore = useBotStore();
    const autoRefreshLoc = computed({
      get() {
        return botStore.globalAutoRefresh;
      },
      set(newValue: boolean) {
        botStore.setGlobalAutoRefresh(newValue);
      },
    });

    return {
      botStore,
      autoRefreshLoc,
    };
  },
});
</script>

<style scoped></style>
