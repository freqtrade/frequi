<template>
  <div id="app">
     <header>
      <nav class="navbar navbar-expand-lg">
        <ul>
          <li class="nav-item">
              <!-- <img class="logo" src="./assets/build-a-bot-logo.png" alt /> -->
              Build-a-Bot
          </li>
          <li class="nav-item">

          </li>
        </ul>
      </nav>
    </header>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
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
header {
  background-color: #999;
  margin-top: 0px;
  /* width: 1184px; */
}
ul {
  padding: 3px;
  display: flex;
}
.logo {
  vertical-align: middle;
  height: 30px;
}
.nav-link {
  text-decoration: none;
  color: inherit;
}
.router-link-active {
  color: white;
}
.container {
  display: flex;
  margin: 10px auto 0 auto;
  justify-content: center;
}
.aside {
  padding: 30px;
  background-color: #aaa;
  width: 100px;
  min-height: 300px;
}
.cart-items {
  position: absolute;
  top: -5px;
  right: -9px;
  font-size: 18px;
  width: 20px;
  text-align: center;
  display: inline-block;
  border-radius: 100px;
  background-color: mediumseagreen;
}
</style>
