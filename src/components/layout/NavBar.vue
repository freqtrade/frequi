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
          <b-nav-item to="/about">About</b-nav-item>
          <BootswatchThemeSelect />
        </b-navbar-nav>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
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
            <Login />
          </li>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Login from '@/views/Login.vue';
import userService from '../../shared/userService';
import BootswatchThemeSelect from '../BootswatchThemeSelect.vue';

@Component({
  components: { Login, BootswatchThemeSelect },
})
export default class NavBar extends Vue {
  get loggedIn(): boolean {
    console.log(userService.loggedIn());
    return userService.loggedIn();
  }

  logout(): void {
    userService.logout();
  }
}
</script>

<style scoped>
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
</style>
