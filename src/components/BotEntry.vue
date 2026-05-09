<script setup lang="ts">
import type { BotDescriptor } from '@/types';
import type MessageBox from './general/MessageBox.vue';
const msgBox = ref<typeof MessageBox>();

const props = defineProps<{
  bot: BotDescriptor;
  noButtons?: boolean;
  noRefreshSwitch?: boolean;
  noText?: boolean;
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

const selectedBotStore = computed<BotSubStore>(() => {
  return botStore.botStores[props.bot.botId]!;
});

const autoRefreshLoc = computed({
  get() {
    return selectedBotStore.value.autoRefresh;
  },
  set(newValue) {
    selectedBotStore.value.setAutoRefresh(newValue);
  },
});
</script>

<template>
  <div v-if="bot" class="flex items-center justify-between w-full">
    <span v-if="!noText" class="me-2">{{ bot.botName || bot.botId }}</span>

    <div class="flex items-center gap-2">
      <div class="flex items-center">
        <USwitch
          v-if="!noRefreshSwitch"
          v-model="autoRefreshLoc"
          class="mr-2"
          :title="`Auto refresh for ${bot.botName || bot.botId}`"
        />
        <div
          v-if="selectedBotStore.isBotLoggedIn"
          :title="selectedBotStore.isBotOnline ? 'Online' : 'Offline'"
        >
          <i-mdi-circle
            class="mx-1"
            :class="selectedBotStore.isBotOnline ? 'text-green-500' : 'text-red-500'"
          />
        </div>
        <div v-else title="Login info expired, please login again.">
          <i-mdi-cancel class="text-red-500 mx-1" />
        </div>
      </div>

      <div class="flex items-center gap-1">
        <UButton
          v-if="!noButtons && selectedBotStore.isBotLoggedIn"
          color="neutral"
          variant="soft"
          title="Edit bot"
          @click="$emit('edit')"
          icon="mdi:pencil"
        />
        <UButton
          v-if="!noRefreshSwitch && !selectedBotStore.isBotLoggedIn"
          variant="soft"
          color="neutral"
          title="Login again"
          @click="$emit('editLogin')"
          icon="mdi:login"
        />
        <UButton
          v-if="!noButtons"
          variant="soft"
          color="neutral"
          title="Delete bot"
          @click="removeBotQuestion"
          icon="mdi:delete"
        />
      </div>
    </div>
    <MessageBox ref="msgBox" />
  </div>
</template>
