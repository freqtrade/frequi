<template>
  <main class="container-fluid">
    <BotAlerts />
    <router-view />
  </main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BotAlerts from '@/components/ftbot/BotAlerts.vue';

@Component({
  components: { BotAlerts },
})
export default class Body extends Vue {}
</script>
