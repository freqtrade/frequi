<template>
  <div v-if="botCount > 0">
    <h3 v-if="!small">Available bots</h3>
    <b-list-group>
      <b-list-group-item
        v-for="bot in allAvailableBots"
        :key="bot.botId"
        :active="bot.botId === selectedBot"
        button
        :title="`${bot.botId} - ${bot.botName} - ${bot.botUrl}`"
        @click="selectBot(bot.botId)"
      >
        <bot-rename
          v-if="editingBots.includes(bot.botId)"
          :bot="bot"
          @saved="stopEditBot(bot.botId)"
          @cancelled="stopEditBot(bot.botId)"
        />

        <bot-entry v-else :bot="bot" :no-buttons="small" @edit="editBot(bot.botId)" />
      </b-list-group-item>
    </b-list-group>
    <LoginModal v-if="!small" class="mt-2" login-text="Add new bot" />
  </div>
</template>

<script lang="ts">
import { MultiBotStoreGetters } from '@/store/modules/botStoreWrapper';
import LoginModal from '@/views/LoginModal.vue';
import BotEntry from '@/components/BotEntry.vue';
import BotRename from '@/components/BotRename.vue';
import StoreModules from '@/store/storeSubModules';

import { defineComponent, ref } from '@vue/composition-api';
import { useNamespacedActions, useNamespacedGetters } from 'vuex-composition-helpers';

export default defineComponent({
  name: 'BotList',
  components: { LoginModal, BotEntry, BotRename },
  props: {
    small: { default: false, type: Boolean },
  },
  setup() {
    const { botCount, selectedBot, allIsBotOnline, allAvailableBots } = useNamespacedGetters(
      StoreModules.ftbot,
      [
        MultiBotStoreGetters.botCount,
        MultiBotStoreGetters.selectedBot,
        MultiBotStoreGetters.allIsBotOnline,
        MultiBotStoreGetters.allAvailableBots,
      ],
    );
    const { selectBot } = useNamespacedActions(StoreModules.ftbot, ['selectBot']);
    const editingBots = ref<string[]>([]);

    const editBot = (botId: string) => {
      if (!editingBots.value.includes(botId)) {
        editingBots.value.push(botId);
      }
    };

    const stopEditBot = (botId: string) => {
      if (!editingBots.value.includes(botId)) {
        return;
      }

      editingBots.value.splice(editingBots.value.indexOf(botId), 1);
    };

    return {
      botCount,
      selectedBot,
      allIsBotOnline,
      allAvailableBots,
      selectBot,
      editingBots,
      editBot,
      stopEditBot,
    };
  },
});
</script>
