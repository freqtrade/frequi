<template>
  <!-- TODO We could move the list into a component since we are reusing the same code for both lists. -->
  <div>
    <div>
      <h3>Whitelist Methods</h3>

      <div v-if="pairlistMethods.length" class="list">
        <b-list-group v-for="(method, key) in pairlistMethods" :key="key">
          <b-list-group-item href="#" class="pair white">{{ method }}</b-list-group-item>
        </b-list-group>
      </div>
    </div>
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
import { mapState, mapActions } from 'vuex';

export default {
  name: 'FTBotAPIPairList',
  data() {
    return {};
  },
  created() {
    this.init();
  },
  computed: {
    ...mapState('ftbot', ['whitelist', 'blacklist', 'pairlistMethods']),
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

<style scoped>
.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
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
