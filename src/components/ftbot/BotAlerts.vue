<template>
  <div class="bot-alerts">
    <b-alert
      v-for="(alert, index) in alertStore.activeMessages"
      :key="index"
      v-model="alert.timeout"
      variant="warning"
      dismissible
      @closed="alertStore.removeAlert(alert)"
      >{{ alert.message }}</b-alert
    >
  </div>
</template>

<script setup lang="ts">
import { useAlertsStore } from '@/stores/alerts';
const alertStore = useAlertsStore();
</script>
