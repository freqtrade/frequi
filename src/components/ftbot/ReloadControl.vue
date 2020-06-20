<template>
  <div>
    <button @click="refreshAll()" class="btn btn-secondary">
      Refresh all
    </button>

    <b-form-checkbox class="float-right" v-model="autoRefresh" size="lg" switch
      >AutoRefresh</b-form-checkbox
    >
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'reloadcontrol',
  data() {
    return {
      autoRefresh: true,
      refresh_interval: null,
      refresh_interval_slow: null,
    };
  },
  created() {
    this.refreshOnce();
    this.refreshAll();
  },
  methods: {
    ...mapActions(['refreshSlow', 'refreshFrequent', 'refreshAll', 'refreshOnce']),
    startRefresh() {
      console.log('Starting automatic refresh.');
      this.refreshFrequent();
      this.refresh_interval = setInterval(() => {
        this.refreshFrequent();
      }, 5000);
      this.refreshSlow();
      this.refresh_interval_slow = setInterval(() => {
        this.refreshSlow();
      }, 60000);
    },
    stopRefresh() {
      console.log('Stopping automatic refresh.');
      clearInterval(this.refresh_interval);
      clearInterval(this.refresh_interval_slow);
    },
  },
  mounted() {
    this.startRefresh();
  },
  beforeDestroy() {
    this.stopRefresh();
  },
  watch: {
    autoRefresh(val) {
      if (val) {
        this.startRefresh();
      } else {
        this.stopRefresh();
      }
    },
  },
};
</script>

<style>
</style>
