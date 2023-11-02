<template>
  <div>
    <b-button @click="openLoginModal()"><i-mdi-login class="me-1" />{{ loginText }}</b-button>
    <b-modal
      id="modal-prevent-closing"
      v-model="loginViewOpen"
      title="Login to your bot"
      @ok="handleOk"
    >
      <BotLogin
        ref="loginForm"
        in-modal
        :existing-auth="loginInfo"
        @login-result="handleLoginResult"
      />
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import BotLogin from '@/components/BotLogin.vue';
import { AuthStorageWithBotId } from '@/types';
import { nextTick, ref } from 'vue';

defineProps({
  loginText: { required: false, default: 'Login', type: String },
});
const loginViewOpen = ref(false);
const loginForm = ref<typeof BotLogin>();
const loginInfo = ref<AuthStorageWithBotId | undefined>(undefined);
const handleLoginResult = (result: boolean) => {
  if (result) {
    loginViewOpen.value = false;
  }
};
const handleOk = (evt) => {
  evt.preventDefault();
  loginForm.value?.handleSubmit();
};
const openLoginModal = async (botInfo: AuthStorageWithBotId | undefined = undefined) => {
  loginInfo.value = botInfo;
  await nextTick();
  console.log('botinfo', botInfo);
  loginForm.value?.reset();
  loginViewOpen.value = true;
};
defineExpose({
  openLoginModal,
});
</script>

<style scoped></style>
