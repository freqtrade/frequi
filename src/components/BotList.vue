<script setup lang="ts">
import LoginModal from '@/components/LoginModal.vue';

import { useBotStore } from '@/stores/ftbotwrapper';
import type { AuthStorageWithBotId, BotDescriptor } from '@/types';
import { useSortable } from '@vueuse/integrations/useSortable';

defineProps({
  small: { default: false, type: Boolean },
});

const botStore = useBotStore();

const editingBots = ref<string[]>([]);
const loginModal = ref<typeof LoginModal>();
const sortContainer = ref<HTMLElement | null>(null);
const botListComp = computed<BotDescriptor[]>(() => {
  //Convert to array
  return Object.values(botStore.availableBots).sort((a, b) => (a.sortId ?? 0) - (b.sortId ?? 0));
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
  <div v-if="botStore.botCount > 0">
    <h3 v-if="!small" class="font-bold text-2xl mb-2">Available bots</h3>
    <div ref="sortContainer" class="flex flex-col">
      <div
        v-for="(bot, idx) in botListComp"
        :key="bot.botId"
        :active="bot.botId === botStore.selectedBot"
        button
        :title="`${bot.botId} - ${bot.botName} - ${bot.botUrl} - ${
          botStore.botStores[bot.botId].isBotLoggedIn ? '' : 'Login info expired!'
        }`"
        class="flex items-center border border-surface-500 p-2"
        :class="{
          'border-primary': bot.botId === botStore.selectedBot,
          'rounded-t-md': idx === 0,
          'rounded-b-md': idx === botListComp.length - 1,
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
      </div>
    </div>
    <LoginModal v-if="!small" ref="loginModal" class="mt-2" login-text="Add new bot" />
  </div>
</template>
