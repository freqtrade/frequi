<script setup lang="ts">
import LoginModal from '@/components/LoginModal.vue';

import type { AuthStorageWithBotId, BotDescriptor } from '@/types';
import { useSortable } from '@vueuse/integrations/useSortable';

defineProps<{
  small?: boolean;
}>();

const botStore = useBotStore();

const editingBots = ref<string[]>([]);
const loginModal = ref<typeof LoginModal>();
const sortContainer = ref<HTMLElement | null>(null);
const botListComp = computed<BotDescriptor[]>(() => {
  //Convert to array
  return botStore.availableBotsSorted;
});

useSortable(sortContainer, botListComp, {
  handle: '.handle',
  onUpdate: (e) => {
    const oldBotId = botListComp.value[e.oldIndex].botId;
    const newBotId = botListComp.value[e.newIndex].botId;
    botStore.updateBot(oldBotId, { sortId: e.newIndex });
    botStore.updateBot(newBotId, { sortId: e.oldIndex });
  },
});

const editBot = (botId: string) => {
  if (!editingBots.value.includes(botId)) {
    editingBots.value.push(botId);
  }
};

const editBotLogin = (botId: string) => {
  const loginInfo: AuthStorageWithBotId = {
    ...botStore.botStores[botId].getLoginInfo(),
    botId,
  };
  loginModal.value?.openLoginModal(loginInfo);
};

const stopEditBot = (botId: string) => {
  if (!editingBots.value.includes(botId)) {
    return;
  }

  editingBots.value.splice(editingBots.value.indexOf(botId), 1);
};
</script>

<template>
  <div v-if="botStore.botCount > 0" class="w-full mx-2">
    <h3 v-if="!small" class="font-bold text-2xl mb-2">Available bots</h3>
    <ul
      ref="sortContainer"
      class="flex flex-col divide-y border-x border-surface-500 rounded-sm border-y divide-solid divide-surface-500"
    >
      <li
        v-for="bot in botListComp"
        :key="bot.botId"
        :active="bot.botId === botStore.selectedBot"
        button
        :title="`${bot.botId} - ${bot.botName} - ${bot.botUrl} - ${
          botStore.botStores[bot.botId].isBotLoggedIn ? '' : 'Login info expired!'
        }`"
        class="flex items-center p-2"
        :class="{
          'bg-primary-100 dark:bg-primary-800 underline font-semibold':
            bot.botId === botStore.selectedBot,
        }"
        @click="botStore.selectBot(bot.botId)"
      >
        <i-mdi-reorder-horizontal v-if="!small" class="handle cursor-pointer me-2 fs-4" />
        <BotRename
          v-if="editingBots.includes(bot.botId)"
          :bot="bot"
          @saved="stopEditBot(bot.botId)"
          @cancelled="stopEditBot(bot.botId)"
        />

        <BotEntry
          v-else
          :bot="bot"
          :no-buttons="small"
          @edit="editBot(bot.botId)"
          @edit-login="editBotLogin(bot.botId)"
        />
      </li>
    </ul>
    <LoginModal v-if="!small" ref="loginModal" class="mt-2" login-text="Add new bot" />
  </div>
</template>
