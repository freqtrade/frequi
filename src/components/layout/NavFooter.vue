<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';

const botStore = useBotStore();
</script>

<template>
  <footer class="d-md-none">
    <!-- Only visible on xs (phone) viewport! -->
    <hr class="my-0" />
    <div class="d-flex flex-align-center justify-content-between px-2">
      <RouterLink
        v-if="!botStore.canRunBacktest"
        class="nav-link navbar-nav align-items-center"
        to="/open_trades"
      >
        <i-mdi-folder-open height="24" width="24" />
        Trades
      </RouterLink>
      <RouterLink
        v-if="!botStore.canRunBacktest"
        class="nav-link navbar-nav align-items-center"
        to="/trade_history"
      >
        <i-mdi-folder-lock height="24" width="24" />
        History
      </RouterLink>
      <RouterLink
        v-if="!botStore.canRunBacktest"
        class="nav-link navbar-nav align-items-center"
        to="/pairlist"
      >
        <i-mdi-view-list height="24" width="24" />
        Pairlist
      </RouterLink>
      <RouterLink
        v-if="!botStore.canRunBacktest"
        class="nav-link navbar-nav align-items-center"
        to="/balance"
      >
        <i-mdi-bank height="24" width="24" />
        Balance
      </RouterLink>
      <RouterLink
        v-if="!botStore.canRunBacktest"
        class="nav-link navbar-nav align-items-center"
        to="/dashboard"
      >
        <i-mdi-view-dashboard-outline height="24" width="24" />
        Dashboard
      </RouterLink>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
[data-theme='dark'] {
  .router-link-active,
  .nav-link:active {
    color: white !important;
  }
}
</style>
