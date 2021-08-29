<template>
  <div>
    <h3>Available bots</h3>
    <div v-for="bot in allAvailableBots" :key="bot">
      {{ bot }}
      <b-button class="btn-xs ml-1" size="sm" title="Delete trade" @click="clickRemoveBot(bot)">
        <EditIcon :size="16" title="Delete trade" />
      </b-button>
      <b-button class="btn-xs ml-1" size="sm" title="Delete bot" @click="clickRemoveBot(bot)">
        <DeleteIcon :size="16" title="Delete trade" />
      </b-button>
    </div>
    <LoginModal class="mt-2" login-text="Add new bot" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { MultiBotStoreGetters } from '@/store/modules/botStoreWrapper';
import LoginModal from '@/views/LoginModal.vue';
import EditIcon from 'vue-material-design-icons/Cog.vue';
import DeleteIcon from 'vue-material-design-icons/Delete.vue';

const ftbot = namespace('ftbot');

@Component({ components: { LoginModal, DeleteIcon, EditIcon } })
export default class BotList extends Vue {
  @ftbot.Getter [MultiBotStoreGetters.allAvailableBots]: string[];

  @ftbot.Action removeBot;

  clickRemoveBot(botId) {
    //
    this.$bvModal.msgBoxConfirm(`Really remove (logout) from ${botId}?`).then((value: boolean) => {
      if (value) {
        this.removeBot(botId);
      }
    });
  }
}
</script>

<style scoped></style>
