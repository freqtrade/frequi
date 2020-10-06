<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand exact to="/">
        <img class="logo" src="@/assets/freqtrade-logo.png" alt="Home Logo" />
        <span class="navbar-brand-title">Freqtrade UI</span>
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item to="/trade">Trade</b-nav-item>
          <b-nav-item to="/dashboard">Dashboard</b-nav-item>
          <!-- <b-nav-item to="/graph">Graph</b-nav-item> -->
          <BootswatchThemeSelect />
        </b-navbar-nav>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <li class="nav-item text-secondary mr-2">
            <b-nav-text class="verticalCenter">
              {{ isBotOnline ? 'Online' : 'Offline' }}
            </b-nav-text>
          </li>
          <li v-if="loggedIn" class="nav-item">
            <b-nav-item-dropdown right>
              <template #button-content>
                <b-avatar size="2em" button>FT</b-avatar>
              </template>
              <b-dropdown-item to="/settings">Settings</b-dropdown-item>
              <b-dropdown-item @click="resetDynamicLayout">Reset Layout</b-dropdown-item>
              <b-dropdown-item to="/" @click.native="logout()">Sign Out</b-dropdown-item>
            </b-nav-item-dropdown>
          </li>
          <li v-else>
            <!-- should open Modal window! -->
            <LoginModal />
          </li>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LoginModal from '@/views/LoginModal.vue';
import { State, Action, namespace } from 'vuex-class';
import userService from '@/shared/userService';
import BootswatchThemeSelect from '@/components/BootswatchThemeSelect.vue';
import { LayoutActions } from '@/store/modules/layout';

const ftbot = namespace('ftbot');
const layoutNs = namespace('layout');

@Component({
  components: { LoginModal, BootswatchThemeSelect },
})
export default class NavBar extends Vue {
  pingInterval: number | null = null;

  @State loggedIn!: boolean;

  @State isBotOnline!: boolean;

  @Action setLoggedIn;

  @ftbot.Action ping;

  @layoutNs.Action [LayoutActions.resetDashboardLayout];

  @layoutNs.Action [LayoutActions.resetTradingLayout];

  mounted() {
    this.ping();
    this.pingInterval = window.setInterval(this.ping, 60000);
  }

  beforeDestroy() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }

  logout(): void {
    userService.logout();
    this.setLoggedIn(false);
  }

  resetDynamicLayout(): void {
    const route = this.$router.currentRoute.path;
    console.log(`resetLayout called for ${route}`);
    switch (route) {
      case '/trade':
        this.resetTradingLayout();
        break;
      case '/dashboard':
        this.resetDashboardLayout();
        break;
      default:
    }
  }
}
</script>

<style lang="scss" scoped>
.logo {
  vertical-align: middle;
  height: 30px;
}

.dropdown-toggle::after {
  display: none;
}

.navbar-brand-title {
  padding-left: 0.5em;
}
.navbar {
  padding: 0.2rem 1rem;
}

.nav-link:active {
  color: white;
}
.verticalCenter {
  align-items: center;
  display: inline-flex;
  height: 100%;
}
</style>
