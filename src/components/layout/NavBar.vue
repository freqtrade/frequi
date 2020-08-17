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
          <b-nav-item to="/about">About</b-nav-item>
          <BootswatchThemeSelect />
        </b-navbar-nav>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <li class="nav-item text-secondary mr-2">
            <b-nav-text class="verticalCenter">
              {{ isBotOnline ? 'Online' : 'Offline' }}
            </b-nav-text>
          </li>
          <li class="nav-item" v-if="loggedIn">
            <b-nav-item-dropdown right>
              <template v-slot:button-content>
                <b-avatar button>FT</b-avatar>
              </template>
              <b-dropdown-item to="/settings">Settings</b-dropdown-item>
              <b-dropdown-item to="/" v-on:click.native="logout()">Sign Out</b-dropdown-item>
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
import { State, Mutation, namespace } from 'vuex-class';
import userService from '@/shared/userService';
import BootswatchThemeSelect from '@/components/BootswatchThemeSelect.vue';

const ftbot = namespace('ftbot');

@Component({
  components: { LoginModal, BootswatchThemeSelect },
})
export default class NavBar extends Vue {
  pingInterval: NodeJS.Timer | null = null;

  @State loggedIn!: boolean;

  @State isBotOnline!: boolean;

  @Mutation setLoggedIn;

  @ftbot.Action ping;

  mounted() {
    this.ping();
    this.pingInterval = setInterval(this.ping, 60000);
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

.nav-link:active {
  color: white;
}
.verticalCenter {
  align-items: center;
  display: inline-flex;
  height: 100%;
}
</style>
