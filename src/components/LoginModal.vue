<script setup lang="ts">
import BotLogin from '@/components/BotLogin.vue';
import type { AuthStorageWithBotId } from '@/types';

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

<template>
  <div>
    <BButton @click="openLoginModal()"><i-mdi-login class="me-1" />{{ loginText }}</BButton>
    <BModal
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
    </BModal>
  </div>
</template>
