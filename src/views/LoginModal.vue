<template>
  <div>
    <b-button @click="loginViewOpen = true">{{ loginText }}</b-button>
    <b-modal
      id="modal-prevent-closing"
      v-model="loginViewOpen"
      title="Login to your bot"
      @ok="handleOk"
    >
      <Login ref="loginForm" in-modal @loginResult="handleLoginResult" />
    </b-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import Login from '@/components/Login.vue';

export default defineComponent({
  name: 'LoginModal',
  components: { Login },
  props: {
    loginText: { required: false, default: 'Login', type: String },
  },
  setup() {
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
    return {
      loginViewOpen,
      loginForm,
      handleOk,
      handleLoginResult,
    };
  },
});
</script>

<style scoped></style>
