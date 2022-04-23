<template>
  <div>
    <b-button v-b-modal.modal-prevent-closing>{{ loginText }}</b-button>
    <b-modal id="modal-prevent-closing" ref="modalRef" title="Login to your bot" @ok="handleOk">
      <Login id="loginForm" ref="loginForm" in-modal @loginResult="handleLoginResult" />
    </b-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';

import Login from '@/components/Login.vue';

export default defineComponent({
  name: 'LoginModal',
  components: { Login },
  props: {
    loginText: { required: false, default: 'Login', type: String },
  },
  setup() {
    const modalRef = ref<HTMLElement>();
    const loginForm = ref<HTMLFormElement>();
    const handleLoginResult = (result: boolean) => {
      if (result) {
        (modalRef.value as any)?.hide();
      }
    };
    const handleOk = (evt) => {
      evt.preventDefault();
      loginForm.value?.handleSubmit();
    };
    return {
      modalRef,
      loginForm,
      handleOk,
      handleLoginResult,
    };
  },
});
</script>

<style scoped></style>
