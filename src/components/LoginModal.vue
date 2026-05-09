<script setup lang="ts">
import type { AuthStorageWithBotId } from '@/types';

export interface LoginModalProps {
  loginInfo?: AuthStorageWithBotId;
}

defineProps<LoginModalProps>();
defineEmits<{
  close: [value: boolean];
}>();
</script>

<template>
  <UModal title="Login to your bot" description="Enter your bot credentials to connect">
    <template #body>
      <BotLogin in-modal :existing-auth="loginInfo" @login-result="$emit('close', $event)" />
    </template>
  </UModal>
</template>
