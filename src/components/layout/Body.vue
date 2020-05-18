<template>
  <main class="container-fluid">
    <BotAlerts />
    <router-view />
  </main>
</template>

<script>
import BotAlerts from '@/components/ftbot/BotAlerts.vue';

export default {
  name: 'Body',
  components: {
    BotAlerts,
  },
};
</script>
