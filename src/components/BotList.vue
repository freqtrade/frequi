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
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { MultiBotStoreGetters } from '@/store/modules/botStoreWrapper';
import LoginModal from '@/views/LoginModal.vue';
import BotEntry from '@/components/BotEntry.vue';
import BotRename from '@/components/BotRename.vue';
import { BotDescriptors } from '@/types';
import StoreModules from '@/store/storeSubModules';

const ftbot = namespace(StoreModules.ftbot);

@Component({
  components: {
    LoginModal,
    BotEntry,
    BotRename,
  },
})
export default class BotList extends Vue {
  @Prop({ default: false, type: Boolean }) small!: boolean;

  @ftbot.Getter [MultiBotStoreGetters.botCount]: number;

  @ftbot.Getter [MultiBotStoreGetters.selectedBot]: string;

  @ftbot.Getter [MultiBotStoreGetters.allIsBotOnline]: Record<string, boolean>;

  @ftbot.Getter [MultiBotStoreGetters.allAvailableBots]: BotDescriptors;

  @ftbot.Action selectBot;

  editingBots: string[] = [];

  editBot(botId: string) {
    if (!this.editingBots.includes(botId)) {
      this.editingBots.push(botId);
    }
  }

  stopEditBot(botId: string) {
    if (!this.editingBots.includes(botId)) {
      return;
    }

    this.editingBots.splice(this.editingBots.indexOf(botId), 1);
  }
}
</script>
