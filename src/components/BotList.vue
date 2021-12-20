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
        <bot-entry :bot="bot" :no-buttons="small" />
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
import { BotDescriptors } from '@/types';
import StoreModules from '@/store/storeSubModules';

const ftbot = namespace(StoreModules.ftbot);

@Component({ components: { LoginModal, BotEntry } })
export default class BotList extends Vue {
  @Prop({ default: false, type: Boolean }) small!: boolean;

  @ftbot.Getter [MultiBotStoreGetters.botCount]: number;

  @ftbot.Getter [MultiBotStoreGetters.selectedBot]: string;

  @ftbot.Getter [MultiBotStoreGetters.allIsBotOnline]: Record<string, boolean>;

  @ftbot.Getter [MultiBotStoreGetters.allAvailableBots]: BotDescriptors;

  @ftbot.Action selectBot;
}
</script>

<style scoped></style>
