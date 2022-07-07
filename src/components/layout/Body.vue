<template>
  <main>
    <BotAlerts />
    <router-view />
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BotAlerts from '@/components/ftbot/BotAlerts.vue';

export default defineComponent({
  name: 'Body',
  components: { BotAlerts },
});
</script>
<style lang="scss" scoped>
.container-main {
  padding: 0;
}
</style>
