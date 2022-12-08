<template>
  <div>
    <b-button @click="loginViewOpen = true">{{ loginText }}</b-button>
    <b-modal
      id="modal-prevent-closing"
      v-model="loginViewOpen"
      title="Login to your bot"
      @ok="handleOk"
    >
      <login ref="loginForm" in-modal @loginResult="handleLoginResult" />
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import Login from '@/components/Login.vue';
import { ref } from 'vue';

defineProps({
  loginText: { required: false, default: 'Login', type: String },
});
const loginViewOpen = ref(false);
const loginForm = ref<HTMLFormElement>();
const handleLoginResult = (result: boolean) => {
  if (result) {
    loginViewOpen.value = false;
  }
};
const handleOk = () => {
  loginForm.value?.handleSubmit();
};
</script>

<style scoped></style>
