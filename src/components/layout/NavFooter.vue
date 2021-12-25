<template>
  <footer class="d-sm-none">
    <hr class="my-0" />
    <div class="d-flex flex-align-center justify-content-center">
      <router-link v-if="!canRunBacktest" class="nav-link navbar-nav" to="/open_trades">
        Open Trades
      </router-link>
      <router-link v-if="!canRunBacktest" class="nav-link navbar-nav" to="/trade_history">
        Trade History
      </router-link>
      <router-link v-if="!canRunBacktest" class="nav-link navbar-nav" to="/balance">
        Balance
      </router-link>
      <router-link v-if="!canRunBacktest" class="nav-link navbar-nav" to="/dashboard">
        Dashboard
      </router-link>
    </div>
  </footer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { BotStoreGetters } from '@/store/modules/ftbot';

const ftbot = namespace('ftbot');

@Component({})
export default class NavFooter extends Vue {
  @ftbot.Getter [BotStoreGetters.canRunBacktest]!: boolean;
}
</script>

<style lang="scss" scoped></style>
