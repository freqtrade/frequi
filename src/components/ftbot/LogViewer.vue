<template>
  <div class="d-flex h-100 p-0 align-items-start">
    <textarea v-model="formattedLogs" class="h-100" readonly></textarea>
    <b-button size="sm" @click="getLogs">&#x21bb;</b-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { LogLine } from '@/types';
import { BotStoreGetters } from '@/store/modules/ftbot';
import StoreModules from '@/store/storeSubModules';

const ftbot = namespace(StoreModules.ftbot);

@Component({})
export default class LogViewer extends Vue {
  @ftbot.Getter [BotStoreGetters.lastLogs]!: LogLine[];

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

<style lang="scss" scoped>
textarea {
  width: 100%;
  min-height: 6em;
  resize: none;
  font-size: $fontsize-small;
}
</style>
