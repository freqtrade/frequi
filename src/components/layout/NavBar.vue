<template>
 <div>
  <b-navbar toggleable="lg" type="dark" variant="info">
    <b-navbar-brand exact to="/" >
    <img class="logo" src="@/assets/freqtrade-logo.png" alt="Home Logo" />
          <span class="navbar-brand-title">Freqtrade UI</span>
    </b-navbar-brand>

    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item to="/trade">Trade</b-nav-item>
        <b-nav-item to="/about">About</b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">      
          <li class="nav-item" v-if="loggedIn">
            <b-nav-item-dropdown right>
                <template v-slot:button-content>
                  <b-avatar button @click="onClick" src="https://placekitten.com/300/300"></b-avatar>
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

<script>
import { mapActions, mapState } from 'vuex';
import Login from '@/views/Login.vue';

export default {
    name: "NavBar",
    components: {Login},
    computed: {
    ...mapState('user', ['loggedIn']),
  },
  methods: {
    ...mapActions('user', ['logout']),
  }
}
</script>

<style>
.logo {
  vertical-align: middle;
  height: 30px;
}

.dropdown-toggle::after {
    display:none;
}

.navbar-brand-title{
  padding-left: .5em;
}

.nav-link:active {
  color: white;
}
 
</style>