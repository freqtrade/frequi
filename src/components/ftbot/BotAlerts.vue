<template>
  <div>
    <b-alert
      v-for="(alert, index) in activeMessages"
      :key="index"
      variant="warning"
      dismissible
      :show="5"
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
import { AlertActions } from '@/store/modules/alerts';

const alerts = namespace('alerts');

@Component({})
export default class BotAlerts extends Vue {
  @alerts.State activeMessages;

  @alerts.Action [AlertActions.removeAlert];

  closeAlert() {
    this[AlertActions.removeAlert]();
  }
}
</script>
