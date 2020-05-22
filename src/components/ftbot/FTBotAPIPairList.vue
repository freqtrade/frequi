<template>
  <!-- TODO We could move the list into a component since we are reusing the same code for both lists. -->
  <div>
    <!-- Show Whitelist -->
    <h3>Whitelist</h3>
    <div v-if="whitelist.length" class="list">
      <b-list-group v-for="(pair, key) in whitelist" :key="key">
        <b-list-group-item href="#" class="pair white">{{ pair }}</b-list-group-item>
      </b-list-group>
    </div>
    <p v-else>List Unavailable. Please Login and make sure server is running.</p>
    <hr />

    <!-- Blacklsit -->
    <h3>Blacklist</h3>
    <div v-if="blacklist.length" class="list">
      <b-list-group v-for="(pair, key) in blacklist" :key="key">
        <b-list-group-item href="#" class="pair black">{{ pair }}</b-list-group-item>
      </b-list-group>
    </div>
    <p v-else>BlackList Unavailable. Please Login and make sure server is running.</p>
    <!-- Pagination -->
    <!-- TODO Add pagination support -->
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'FTBotAPIPairList',
  data() {
    return {};
  },
  created() {
    this.init();
  },
  computed: {
    ...mapGetters('ftbot', ['whitelist', 'blacklist']),
  },
  methods: {
    ...mapActions('ftbot', ['getWhitelist', 'getBlacklist']),
    init() {
      if (this.whitelist.length === 0) {
        this.getWhitelist();
      }
      if (this.blacklist.length === 0) {
        this.getBlacklist();
      }
    },
  },
};
</script>

<style>
.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  grid-gap: 0.5rem;
  padding-bottom: 1rem;
}
.pair {
  border: 1px solid #ccc;
  background: #41b883;
  padding: 0.5rem;
  border-radius: 5px;
  text-align: center;
  position: relative;
  cursor: pointer;
}
.white {
  /* border: 1px solid black; */
  background: white;
  color: black;
}

.black {
  /* border: 1px solid white; */
  background: black;
  color: white;
}
</style>
