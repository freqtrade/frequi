<template>
  <textarea class="mt-2" v-model="formattedLogs" readonly></textarea>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Logs } from '@/store/types';

const ftbot = namespace('ftbot');

@Component({})
export default class LogViewer extends Vue {
  @ftbot.State lastLogs!: Array<Logs>;

  @ftbot.Action getLogs;

  mounted() {
    this.getLogs();
  }

  get formattedLogs() {
    let result = '';
    for (let i = 0, len = this.lastLogs.length; i < len; i += 1) {
      const log = this.lastLogs[i];
      result += `${log[0]} - ${log[2]} - ${log[3]} - ${log[4]}\n`;
    }
    return result;
  }
}
</script>

<style scoped>
textarea {
  width: 100%;
  min-height: 6em;
}
</style>
