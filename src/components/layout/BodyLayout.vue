<template>
  <main>
    <BotAlerts style="position: absolute; top: 10px; right: 10px; width: 480px; z-index: 100" />
    <router-view />
  </main>
</template>

<script setup lang="ts">
import BotAlerts from '@/components/ftbot/BotAlerts.vue';
</script>
<style lang="scss" scoped>
.container-main {
  padding: 0;
}
</style>
