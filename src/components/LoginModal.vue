<script setup lang="ts">
import type { AuthStorageWithBotId } from '@/types';

withDefaults(
  defineProps<{
    loginText?: string;
  }>(),
  {
    loginText: 'Login',
  },
);
const loginViewOpen = ref(false);
const loginInfo = ref<AuthStorageWithBotId | undefined>(undefined);

const handleLoginResult = (result: boolean) => {
  if (result) {
    loginViewOpen.value = false;
  }
};

const openLoginModal = async (botInfo: AuthStorageWithBotId | undefined = undefined) => {
  loginInfo.value = botInfo;
  await nextTick();
  loginViewOpen.value = true;
};
defineExpose({
  openLoginModal,
});
</script>

<template>
  <div>
    <UButton color="neutral" @click="openLoginModal()" icon="mdi:login">{{ loginText }}</UButton>
    <UModal
      id="modal-prevent-closing"
      v-model:open="loginViewOpen"
      title="Login to your bot"
      description="Enter your bot credentials to connect"
    >
      <template #body>
        <BotLogin in-modal :existing-auth="loginInfo" @login-result="handleLoginResult" />
      </template>
    </UModal>
  </div>
</template>
