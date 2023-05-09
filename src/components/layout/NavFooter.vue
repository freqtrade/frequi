<template>
  <footer class="d-md-none">
    <!-- Only visible on xs (phone) viewport! -->
    <hr class="my-0" />
    <div class="d-flex flex-align-center justify-content-between px-2">
      <router-link
        v-if="!botStore.canRunBacktest"
        class="nav-link navbar-nav align-items-center"
        to="/open_trades"
      >
        <OpenTradesIcon height="24" width="24" />
        Trades
      </router-link>
      <router-link
        v-if="!botStore.canRunBacktest"
        class="nav-link navbar-nav align-items-center"
        to="/trade_history"
      >
        <ClosedTradesIcon height="24" width="24" />
        History
      </router-link>
      <router-link
        v-if="!botStore.canRunBacktest"
        class="nav-link navbar-nav align-items-center"
        to="/pairlist"
      >
        <PairListIcon height="24" width="24" />
        Pairlist
      </router-link>
      <router-link
        v-if="!botStore.canRunBacktest"
        class="nav-link navbar-nav align-items-center"
        to="/balance"
      >
        <BalanceIcon height="24" width="24" />
        Balance
      </router-link>
      <router-link
        v-if="!botStore.canRunBacktest"
        class="nav-link navbar-nav align-items-center"
        to="/dashboard"
      >
        <DashboardIcon height="24" width="24" />
        Dashboard
      </router-link>
    </div>
  </footer>
</template>

<script lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { defineComponent } from 'vue';
import BalanceIcon from '~icons/mdi/bank.vue';
import ClosedTradesIcon from '~icons/mdi/folder-lock';
import OpenTradesIcon from '~icons/mdi/folder-open';
import DashboardIcon from '~icons/mdi/view-dashboard-outline';
import PairListIcon from '~icons/mdi/view-list';

export default defineComponent({
  name: 'NavFooter',
  components: { OpenTradesIcon, ClosedTradesIcon, BalanceIcon, PairListIcon, DashboardIcon },
  setup() {
    const botStore = useBotStore();
    return {
      botStore,
    };
  },
});
</script>

<style lang="scss" scoped>
[data-theme='dark'] {
  .router-link-active,
  .nav-link:active {
    color: white !important;
  }
}
</style>
