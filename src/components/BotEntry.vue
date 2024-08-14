<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { BotDescriptor } from '@/types';
import type { CheckboxValue } from 'bootstrap-vue-next';

const props = defineProps({
  bot: { required: true, type: Object as () => BotDescriptor },
  noButtons: { default: false, type: Boolean },
});
defineEmits<{ edit: []; editLogin: [] }>();
const botStore = useBotStore();

const changeEvent = (v: CheckboxValue) => {
  botStore.botStores[props.bot.botId].setAutoRefresh(v as boolean);
};
const botRemoveModalVisible = ref(false);

const confirmRemoveBot = () => {
  botRemoveModalVisible.value = false;
  botStore.removeBot(props.bot.botId);
  console.log('removing bot.');
};
const autoRefreshLoc = computed({
  get() {
    return botStore.botStores[props.bot.botId].autoRefresh;
  },
  set() {
    // pass
  },
});
</script>

<template>
  <div v-if="bot" class="d-flex align-items-center justify-content-between w-100">
    <span class="me-2">{{ bot.botName || bot.botId }}</span>

    <div class="d-flex align-items-center">
      <BFormCheckbox
        v-model="autoRefreshLoc"
        input-class="ms-auto my-auto"
        title="AutoRefresh"
        variant="secondary"
        switch
        @update:model-value="changeEvent"
      >
        <div
          v-if="botStore.botStores[bot.botId].isBotLoggedIn"
          :title="botStore.botStores[bot.botId].isBotOnline ? 'Online' : 'Offline'"
        >
          <i-mdi-circle
            class="ms-2 me-1 align-middle"
            :class="botStore.botStores[bot.botId].isBotOnline ? 'online' : 'offline'"
          />
        </div>
        <div v-else title="Login info expired, please login again.">
          <i-mdi-cancel class="offline" />
        </div>
      </BFormCheckbox>

      <div v-if="!noButtons" class="float-end d-flex flex-align-center">
        <BButton
          v-if="botStore.botStores[bot.botId].isBotLoggedIn"
          class="ms-1"
          size="sm"
          title="Edit bot"
          @click="$emit('edit')"
        >
          <i-mdi-pencil />
        </BButton>
        <BButton v-else class="ms-1" size="sm" title="Login again" @click="$emit('editLogin')">
          <i-mdi-login />
        </BButton>
        <BButton class="ms-1" size="sm" title="Delete bot" @click="botRemoveModalVisible = true">
          <i-mdi-delete />
        </BButton>
      </div>
    </div>
    <BModal
      v-if="!noButtons"
      id="removeBotModal"
      v-model="botRemoveModalVisible"
      title="Logout confirmation"
      @ok="confirmRemoveBot"
    >
      Really remove (logout) from {{ bot.botName }} ({{ bot.botId }})?
    </BModal>
  </div>
</template>

<style scoped lang="scss">
.form-switch {
  padding-left: 0;
  display: flex;
  flex-wrap: nowrap;
}
.online {
  color: #1aa903;
}
.offline {
  color: #e01515;
}
</style>
