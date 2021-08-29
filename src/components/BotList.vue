<template>
  <div>
    <h3>Available bots</h3>
    <div v-for="bot in allAvailableBots" :key="bot">
      {{ bot }}
    </div>
    <LoginModal login-text="Add new bot" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { MultiBotStoreGetters } from '@/store/modules/botStoreWrapper';
import LoginModal from '@/views/LoginModal.vue';

const ftbot = namespace('ftbot');

@Component({ components: { LoginModal } })
export default class BotList extends Vue {
  @ftbot.Getter [MultiBotStoreGetters.allAvailableBots]: string[];

  clickAddBot() {
    //
  }
}
</script>

<style scoped></style>
