<template>
  <header class="bg-secondary">
      <nav class="navbar navbar-expand navbar-dark flex-column flex-md-row bd-navbar">
        <h3 class="text-white header-title">
          <img class="logo" src="@/assets/freqtrade-logo.png" alt />
          Freqtrade UI
        </h3>
        <ul class="navbar-nav mr-auto">
          <li>
            <router-link to="/" exact>Home</router-link>
          </li>
          <li>
            <router-link to="/trade">Trade</router-link>
          </li>
          <li>
            <router-link to="/about">About</router-link>
          </li>
        </ul>
        <ul class="navbar-nav ">
          <li class="nav-item" v-if="loggedIn">
            <router-link to="/" v-on:click.native="logout()">Logout</router-link>
          </li>
          <li class="nav-item" v-else>
            <!-- should open Modal window! -->
            <Login />
          </li>
        </ul>
      </nav>
    </header>
</template>

<script>

import { mapActions, mapState } from 'vuex';

import Login from '@/views/Login.vue';

export default {
    name: "Header",
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

</style>