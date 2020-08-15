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

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const alerts = namespace('alerts');

@Component({})
export default class BotAlerts extends Vue {
  @alerts.State activeMessages;

  @alerts.Mutation removeAlert;

  closeAlert() {
    this.removeAlert();
  }
}
</script>
