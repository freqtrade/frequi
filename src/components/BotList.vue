<template>
  <div v-if="botStore.botCount > 0">
    <h3 v-if="!small">Available bots</h3>
    <b-list-group>
      <b-list-group-item
        v-for="bot in botStore.availableBots"
        :key="bot.botId"
        :active="bot.botId === botStore.selectedBot"
        button
        :title="`${bot.botId} - ${bot.botName} - ${bot.botUrl} - ${
          botStore.botStores[bot.botId].isBotLoggedIn ? '' : 'Login info expired!'
        }`"
        @click="botStore.selectBot(bot.botId)"
      >
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
import LoginModal from '@/views/LoginModal.vue';
import BotEntry from '@/components/BotEntry.vue';
import BotRename from '@/components/BotRename.vue';

import { ref } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import { AuthStorageWithBotId } from '@/types';

defineProps({
  small: { default: false, type: Boolean },
});

const botStore = useBotStore();

const editingBots = ref<string[]>([]);
const loginModal = ref<typeof LoginModal>();

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
