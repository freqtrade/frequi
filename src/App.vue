<template>
  <div id="app">
    <Header/>

    <main class="container-fluid">
      <div class="container">
        <BotAlerts />
      </div>

      <router-view />
    </main>
  </div>
</template>

<script>
import BotAlerts from '@/components/ftbot/BotAlerts.vue';

export default {
  components: { BotAlerts },
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
.card-body {
  overflow: auto;
}
</style>
