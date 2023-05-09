<template>
  <div v-if="botStore.botCount > 0">
    <h3 v-if="!small">Available bots</h3>
    <b-list-group ref="sortContainer">
      <b-list-group-item
        v-for="bot in botListComp"
        :key="bot.botId"
        :active="bot.botId === botStore.selectedBot"
        button
        :title="`${bot.botId} - ${bot.botName} - ${bot.botUrl} - ${
          botStore.botStores[bot.botId].isBotLoggedIn ? '' : 'Login info expired!'
        }`"
        class="d-flex"
        @click="botStore.selectBot(bot.botId)"
      >
        <i-mdi-reorder-horizontal v-if="!small" class="handle me-2 fs-4" />
        <bot-rename
          v-if="editingBots.includes(bot.botId)"
          :bot="bot"
          @saved="stopEditBot(bot.botId)"
          @cancelled="stopEditBot(bot.botId)"
        />

        <bot-entry
          v-else
          :bot="bot"
          :no-buttons="small"
          @edit="editBot(bot.botId)"
          @edit-login="editBotLogin(bot.botId)"
        />
      </b-list-group-item>
    </b-list-group>
    <LoginModal v-if="!small" ref="loginModal" class="mt-2" login-text="Add new bot" />
  </div>
</template>

<script setup lang="ts">
import BotEntry from '@/components/BotEntry.vue';
import BotRename from '@/components/BotRename.vue';
import LoginModal from '@/views/LoginModal.vue';

import { useBotStore } from '@/stores/ftbotwrapper';
import { AuthStorageWithBotId, BotDescriptor } from '@/types';
import { useSortable } from '@vueuse/integrations/useSortable';
import { computed, ref } from 'vue';

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
