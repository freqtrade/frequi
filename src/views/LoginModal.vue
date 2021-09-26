<template>
  <div>
    <b-button v-b-modal.modal-prevent-closing>{{ loginText }}</b-button>
    <b-modal id="modal-prevent-closing" ref="modal" title="Login to your bot" @ok="handleOk">
      <Login id="loginForm" ref="loginForm" in-modal @loginResult="handleLoginResult" />
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import Login from '@/components/Login.vue';

@Component({
  components: { Login },
})
export default class LoginModal extends Vue {
  $refs!: {
    loginForm: HTMLFormElement;
    modal: HTMLElement;
  };

  @Prop({ required: false, default: 'Login', type: String }) loginText!: string;

  resetLogin() {
    // this.$refs.loginForm.resetLogin();
  }

  handleLoginResult(result: boolean) {
    if (result) {
      (this.$refs.modal as any).hide();
    }
  }

  handleOk(evt) {
    evt.preventDefault();
    this.$refs.loginForm.handleSubmit();
  }
}
</script>

<style scoped></style>
