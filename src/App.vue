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
      </nav>
    </header>
    <main>
      <TradeView />
    </main>
  </div>
</template>

<script>
import TradeView from './ftbot/TradeView.vue';

export default {
  name: 'App',
  components: {
    'TradeView': TradeView,
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
