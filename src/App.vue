<template>
  <div id="app">
    <header class="bg-secondary">
      <nav class="navbar navbar-expand navbar-dark flex-column flex-md-row bd-navbar">
        <h3 class="text-white header-title">
          <img class="logo" src="./assets/freqtrade-logo.png" alt />
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
            <router-link to="/login">login</router-link>
          </li>
        </ul>
      </nav>
    </header>
    <main class="container-fluid">
      <router-view />
    </main>
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex';

export default {
  computed: {
    ...mapState('user', ['loggedIn']),
  },
  methods: {
    ...mapActions('user', ['logout']),
  },
};
</script>
<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.logo {
  vertical-align: middle;
  height: 30px;
}
.header-title {
  margin-right: 2em;
}

#nav {
  padding: 30px;
}

ul {
  padding: 3px;
  display: flex;
  list-style-type: none;
}
li {
  margin-right: 15px;
}
.router-link-active {
  color: white;
}
nav a {
  color: #ccc;
}
</style>

<style>
/* Global styles - populating to child elementes */
.card-header {
  font-size: 1.3em;
}
</style>
