<template>
  <div v-if="bot" class="d-flex align-items-center justify-content-between w-100">
    <span class="me-2">{{ bot.botName || bot.botId }}</span>

    <div class="align-items-center d-flex">
      <b-form-checkbox
        v-model="autoRefreshLoc"
        class="ms-auto float-end me-2 my-auto mt-1"
        title="AutoRefresh"
        variant="secondary"
        switch
        @change="changeEvent"
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
      </b-form-checkbox>
      <div v-if="!noButtons" class="float-end d-flex flex-align-center">
        <b-button
          v-if="botStore.botStores[bot.botId].isBotLoggedIn"
          class="ms-1"
          size="sm"
          title="Edit bot"
          @click="$emit('edit')"
        >
          <i-mdi-pencil />
        </b-button>
        <b-button v-else class="ms-1" size="sm" title="Login again" @click="$emit('editLogin')">
          <i-mdi-login />
        </b-button>
        <b-button class="ms-1" size="sm" title="Delete bot" @click="botRemoveModalVisible = true">
          <i-mdi-delete />
        </b-button>
      </div>
    </div>
    <b-modal
      v-if="!noButtons"
      id="removeBotModal"
      v-model="botRemoveModalVisible"
      title="Logout confirmation"
      @ok="confirmRemoveBot"
    >
      Really remove (logout) from {{ bot.botName }} ({{ bot.botId }})?
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { BotDescriptor } from '@/types';
import { computed, ref } from 'vue';

const props = defineProps({
  bot: { required: true, type: Object as () => BotDescriptor },
  noButtons: { default: false, type: Boolean },
});
defineEmits(['edit', 'editLogin']);
const botStore = useBotStore();

const changeEvent = (v) => {
  botStore.botStores[props.bot.botId].setAutoRefresh(v);
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
