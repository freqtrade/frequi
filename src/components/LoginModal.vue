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
const { t } = useUiText();

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
    <Button severity="secondary" @click="openLoginModal()"
      ><i-mdi-login class="me-1" />{{ loginText || t('login') }}</Button
    >
    <Dialog
      id="modal-prevent-closing"
      v-model:visible="loginViewOpen"
      :header="t('botLoginHeader')"
      :dismissable-mask="true"
    >
      <BotLogin
        class="w-[1000px] max-w-[500px]"
        in-modal
        :existing-auth="loginInfo"
        @login-result="handleLoginResult"
      />
    </Dialog>
  </div>
</template>
