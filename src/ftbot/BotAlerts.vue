<template>
  <div>
    <b-alert
      variant="warning"
      dismissible
      :show="5"
      v-for="(alert, index) in activeMessages"
      :key="index"
      :value="!!alert.message"
      @dismissed="closeAlert"
    >
      {{ alert.message }}
    </b-alert>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'BotAlerts',
  computed: {
    ...mapState('alerts', ['activeMessages']),
  },
  data() {
    return {};
  },
  methods: {
    ...mapMutations('alerts', ['removeAlert']),
    closeAlert() {
      this.removeAlert();
    },
  },
};
</script>
