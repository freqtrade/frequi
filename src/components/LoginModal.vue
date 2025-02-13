<script setup lang="ts">
import type BotLogin from '@/components/BotLogin.vue';
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

const openLoginModal = async (botInfo: AuthStorageWithBotId | undefined = undefined) => {
  loginInfo.value = botInfo;
  await nextTick();
  loginForm.value?.reset();
  loginViewOpen.value = true;
};
defineExpose({
  openLoginModal,
});
</script>

<template>
  <div>
    <Button severity="secondary" @click="openLoginModal()"
      ><i-mdi-login class="me-1" />{{ loginText }}</Button
    >
    <Dialog
      id="modal-prevent-closing"
      v-model:visible="loginViewOpen"
      header="Login to your bot"
      :dismissable-mask="true"
    >
      <BotLogin
        ref="loginForm"
        class="w-[1000px] max-w-[500px]"
        in-modal
        :existing-auth="loginInfo"
        @login-result="handleLoginResult"
      />
    </Dialog>
  </div>
</template>
