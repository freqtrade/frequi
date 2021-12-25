<template>
  <footer class="d-sm-none">
    <!-- Only visible on xs (phone) viewport! -->
    <hr class="my-0" />
    <div class="d-flex flex-align-center justify-content-center">
      <router-link v-if="!canRunBacktest" class="nav-link navbar-nav" to="/open_trades">
        <OpenTradesIcon />
        Open Trades
      </router-link>
      <router-link v-if="!canRunBacktest" class="nav-link navbar-nav" to="/trade_history">
        <ClosedTradesIcon />
        Trade History
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
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { BotStoreGetters } from '@/store/modules/ftbot';
import OpenTradesIcon from 'vue-material-design-icons/FolderOpen.vue';
import ClosedTradesIcon from 'vue-material-design-icons/FolderLock.vue';
import BalanceIcon from 'vue-material-design-icons/Bank.vue';
import DashboardIcon from 'vue-material-design-icons/ViewDashboardOutline.vue';

const ftbot = namespace('ftbot');

@Component({ components: { OpenTradesIcon, ClosedTradesIcon, BalanceIcon, DashboardIcon } })
export default class NavFooter extends Vue {
  @ftbot.Getter [BotStoreGetters.canRunBacktest]!: boolean;
}
</script>

<style lang="scss" scoped></style>
