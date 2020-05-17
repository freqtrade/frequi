<template>
 <div>
  <b-navbar toggleable="lg" type="dark" variant="info">
    <b-navbar-brand exact to="/">
    <img class="logo" src="@/assets/freqtrade-logo.png" alt="Home Logo" />
          <span>Freqtrade UI</span>
    </b-navbar-brand>

    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item to="/trade">Trade</b-nav-item>
        <b-nav-item to="/about">About</b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <!-- <b-nav-form>
          <b-form-input size="sm" class="mr-sm-2" placeholder="Search"></b-form-input>
          <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
        </b-nav-form>

        <b-nav-item-dropdown disabled text="Lang" right>
          <b-dropdown-item href="#">EN</b-dropdown-item>
          <b-dropdown-item href="#">ES</b-dropdown-item>
          <b-dropdown-item href="#">RU</b-dropdown-item>
          <b-dropdown-item href="#">FA</b-dropdown-item>
        </b-nav-item-dropdown> -->

      
          <li class="nav-item" v-if="loggedIn">
            <b-nav-item-dropdown right>
                <template v-slot:button-content>
                  <b-avatar button @click="onClick" src="https://placekitten.com/300/300"></b-avatar>
            <!-- <em>User</em> -->
          </template>
             <b-dropdown-item to="/settings">Settings</b-dropdown-item>
            <b-dropdown-item to="/" v-on:click.native="logout()">Sign Out</b-dropdown-item>
            </b-nav-item-dropdown>
          </li>
          <li v-else>
            <!-- should open Modal window! -->
            <Login />
          </li>
          
          
        <!-- <b-nav-item-dropdown right> -->
          <!-- Using 'button-content' slot -->
          <!-- <template v-slot:button-content> -->
              <!-- <b-spinner type="grow" small></b-spinner> I'm <i>custom</i> <strong>title</strong> -->
            <!-- <em>User</em>
          </template>
          <li class="nav-item" v-if="loggedIn">
            <b-dropdown-item to="/" v-on:click.native="logout()">Sign Out</b-dropdown-item>
          </li>
          <li v-else>
            <Login />
          </li> 
        </b-nav-item-dropdown> -->

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
.header-title {
  margin-right: 2em;
}

#nav {
  padding: 30px;
}
.dropdown-toggle::after {
    display:none;
}

/* ul {
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
} */

</style>