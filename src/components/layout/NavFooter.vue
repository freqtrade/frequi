<template>
  <footer class="d-md-none">
    <!-- Only visible on xs (phone) viewport! -->
    <hr class="my-0" />
    <div class="d-flex flex-align-center justify-content-center">
      <router-link v-if="!canRunBacktest" class="nav-link navbar-nav" to="/open_trades">
        <OpenTradesIcon />
        Trades
      </router-link>
      <router-link v-if="!canRunBacktest" class="nav-link navbar-nav" to="/trade_history">
        <ClosedTradesIcon />
        History
      </router-link>
      <router-link v-if="!canRunBacktest" class="nav-link navbar-nav" to="/pairlist">
        <PairListIcon />
        Pairlist
      </router-link>
      <router-link v-if="!canRunBacktest" class="nav-link navbar-nav" to="/balance">
        <BalanceIcon />
        Balance
      </router-link>
      <router-link v-if="!canRunBacktest" class="nav-link navbar-nav" to="/dashboard">
        <DashboardIcon />
        Dashboard
      </router-link>
    </div>
  </footer>
</template>

<script lang="ts">
import { BotStoreGetters } from '@/store/modules/ftbot';
import OpenTradesIcon from 'vue-material-design-icons/FolderOpen.vue';
import ClosedTradesIcon from 'vue-material-design-icons/FolderLock.vue';
import BalanceIcon from 'vue-material-design-icons/Bank.vue';
import PairListIcon from 'vue-material-design-icons/ViewList.vue';
import DashboardIcon from 'vue-material-design-icons/ViewDashboardOutline.vue';
import { defineComponent } from '@vue/composition-api';
import { useNamespacedGetters } from 'vuex-composition-helpers';
import StoreModules from '@/store/storeSubModules';

export default defineComponent({
  name: 'NavFooter',
  components: { OpenTradesIcon, ClosedTradesIcon, BalanceIcon, PairListIcon, DashboardIcon },
  setup() {
    const { canRunBacktest } = useNamespacedGetters(StoreModules.ftbot, [
      BotStoreGetters.canRunBacktest,
    ]);
    return {
      canRunBacktest,
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
