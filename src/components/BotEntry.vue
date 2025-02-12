<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import type { BotDescriptor } from '@/types';
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
  <div v-if="bot" class="flex items-center justify-between w-full">
    <span class="me-2">{{ bot.botName || bot.botId }}</span>

    <div class="flex items-center gap-2">
      <div class="flex items-center">
        <ToggleSwitch v-model="autoRefreshLoc" class="mr-2" @update:model-value="changeEvent" />
        <div
          v-if="botStore.botStores[bot.botId].isBotLoggedIn"
          :title="botStore.botStores[bot.botId].isBotOnline ? 'Online' : 'Offline'"
        >
          <i-mdi-circle
            class="mx-1"
            :class="botStore.botStores[bot.botId].isBotOnline ? 'text-green-500' : 'text-red-500'"
          />
        </div>
        <div v-else title="Login info expired, please login again.">
          <i-mdi-cancel class="text-red-500" />
        </div>
      </div>

      <div v-if="!noButtons" class="flex items-center gap-1">
        <Button
          v-if="botStore.botStores[bot.botId].isBotLoggedIn"
          size="small"
          severity="secondary"
          title="Edit bot"
          @click="$emit('edit')"
        >
          <i-mdi-pencil />
        </Button>
        <Button
          v-else
          size="small"
          severity="secondary"
          title="Login again"
          @click="$emit('editLogin')"
        >
          <i-mdi-login />
        </Button>
        <Button
          size="small"
          severity="secondary"
          title="Delete bot"
          @click="botRemoveModalVisible = true"
        >
          <i-mdi-delete />
        </Button>
      </div>
    </div>

    <BModal
      v-if="!noButtons"
      id="removeBotModal"
      v-model="botRemoveModalVisible"
      class="hidden"
      title="Logout confirmation"
      @ok="confirmRemoveBot"
    >
      Really remove (logout) from {{ bot.botName }} ({{ bot.botId }})?
    </BModal>
  </div>
</template>
