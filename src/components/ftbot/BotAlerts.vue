<template>
  <div class="bot-alerts">
    <b-alert
      v-for="(alert, index) in alertStore.activeMessages"
      :key="index"
      variant="warning"
      dismissible
      :show="5"
      :value="!!alert.message"
      @dismissed="alertStore.removeAlert"
    >
      {{ alert.message }}
    </b-alert>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { useAlertsStore } from '@/stores/alerts';

export default defineComponent({
  name: 'BotAlerts',
  setup() {
    const alertStore = useAlertsStore();
    return {
      alertStore,
    };
  },
});
</script>
