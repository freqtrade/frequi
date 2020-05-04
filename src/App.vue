<template>
  <div id="app">
    <header class="bg-secondary">
      <nav class="navbar navbar-expand navbar-dark flex-column flex-md-row bd-navbar">
        <ul>
          <li class="nav-item text-white">
            <img class="logo" src="./assets/freqtrade-logo.png" alt />
            Freqtrade UI
          </li>
        </ul>
        <li>
          <button class="btn-primary pull-right" @click="refresh_data()">Refresh</button>
        </li>
      </nav>
      <div class="text-white">{{ ping }}</div>
    </header>
    <main class="container-fluid">
      <TradeView />
    </main>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import TradeView from './ftbot/TradeView.vue';

export default {
  name: 'App',
  components: {
    TradeView,
  },
  computed: {
    ...mapState({ ping: 'ping' }),
  },
  methods: {
    ...mapActions(['refresh_all']),
    refresh_data() {
      this.refresh_all();
    },
  },
  mounted() {
    setInterval(() => {
      this.refresh_all();
    }, 5000);
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

main {
  margin: 0 auto;
  /* padding: 30px; */
  background-color: white;
  width: 964px;
  min-height: 300px;
}
ul {
  padding: 3px;
  display: flex;
}
.logo {
  vertical-align: middle;
  height: 30px;
}
.nav-item {
  display: inline-block;
  padding: 5px 10px;
  font-size: 22px;
  /* border-right: 1px solid #bbb; */
}
</style>
