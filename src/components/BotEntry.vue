<script setup lang="ts">
import type { BotDescriptor } from '@/types';
import type MessageBox from './general/MessageBox.vue';
const msgBox = ref<typeof MessageBox>();

const props = defineProps<{
  bot: BotDescriptor;
  noButtons?: boolean;
}>();
defineEmits<{ edit: []; editLogin: [] }>();
const botStore = useBotStore();

function confirmRemoveBot() {
  botStore.removeBot(props.bot.botId);
}

function removeBotQuestion() {
  msgBox.value?.show({
    title: 'Logout confirmation',
    message: `Really remove (logout) from ${props.bot.botName} (${props.bot.botId})?`,
    accept: () => {
      confirmRemoveBot();
    },
  });
}

const autoRefreshLoc = computed({
  get() {
    return botStore.botStores[props.bot.botId].autoRefresh;
  },
  set(newValue) {
    botStore.botStores[props.bot.botId].setAutoRefresh(newValue);
  },
});
</script>

<template>
  <div v-if="bot" class="flex items-center justify-between w-full">
    <span class="me-2">{{ bot.botName || bot.botId }}</span>

    <div class="flex items-center gap-2">
      <div class="flex items-center">
        <ToggleSwitch v-model="autoRefreshLoc" class="mr-2" />
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
          <i-mdi-cancel class="text-red-500 mx-1" />
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
        <Button size="small" severity="secondary" title="Delete bot" @click="removeBotQuestion">
          <i-mdi-delete />
        </Button>
      </div>
    </div>
    <MessageBox ref="msgBox" />
  </div>
</template>
