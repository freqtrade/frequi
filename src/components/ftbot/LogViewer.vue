<template>
  <div class="d-flex h-100 p-0 align-items-start">
    <textarea v-model="formattedLogs" class="h-100" readonly></textarea>
    <b-button size="sm" @click="getLogs">&#x21bb;</b-button>
  </div>
</template>

<script lang="ts">
import { BotStoreGetters } from '@/store/modules/ftbot';
import StoreModules from '@/store/storeSubModules';
import { defineComponent, onMounted, computed } from '@vue/composition-api';
import { useNamespacedActions, useNamespacedGetters } from 'vuex-composition-helpers';

export default defineComponent({
  name: 'LogViewer',
  setup() {
    const { lastLogs } = useNamespacedGetters(StoreModules.ftbot, [BotStoreGetters.lastLogs]);
    const { getLogs } = useNamespacedActions(StoreModules.ftbot, ['getLogs']);

    onMounted(() => getLogs());
    const formattedLogs = computed(() => {
      let result = '';
      for (let i = 0, len = lastLogs.value.length; i < len; i += 1) {
        const log = lastLogs.value[i];
        result += `${log[0]} - ${log[2]} - ${log[3]} - ${log[4]}\n`;
      }
      return result;
    });

    return {
      getLogs,
      lastLogs,
      formattedLogs,
    };
  },
});
</script>

<style lang="scss" scoped>
textarea {
  width: 100%;
  min-height: 6em;
  resize: none;
  font-size: $fontsize-small;
}
</style>
