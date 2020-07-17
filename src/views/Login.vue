<template>
  <div>
    <b-button v-b-modal.modal-prevent-closing>Login</b-button>
    <b-modal
      id="modal-prevent-closing"
      ref="modal"
      title="Submit Your Name"
      @show="resetModal"
      @hidden="resetModal"
      @ok="handleOk"
    >
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group
          :state="urlState"
          label="API Url"
          label-for="url-input"
          invalid-feedback="API Url required"
        >
          <b-form-input
            id="url-input"
            v-model="auth.url"
            :state="urlState"
            @keydown.enter.native="handleOk"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          :state="nameState"
          label="Username"
          label-for="username-input"
          invalid-feedback="Name is required"
        >
          <b-form-input
            id="username-input"
            v-model="auth.username"
            :state="nameState"
            @keydown.enter.native="handleOk"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Password"
          label-for="password-input"
          invalid-feedback="Invalid Password"
        >
          <b-form-input
            id="password-input"
            v-model="auth.password"
            required
            @keydown.enter.native="handleOk"
            type="password"
          ></b-form-input>
        </b-form-group>
      </form>
      <div>
        <b-alert v-if="errorMessage" show variant="warning">
          {{ errorMessage }}
        </b-alert>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import userService from '../shared/userService';
import { setBaseUrl } from '../shared/apiService';

import { AuthPayload } from '../store/types';

@Component({})
export default class Login extends Vue {
  $refs!: {
    form: HTMLFormElement;
  };

  auth: AuthPayload = {
    url: 'http://localhost:8080',
    username: '',
    password: '',
  };

  nameState: boolean | null = null;

  urlState: boolean | null = null;

  errorMessage = '';

  checkFormValidity() {
    const valid = this.$refs.form.checkValidity();
    this.nameState = valid;
    return valid;
  }

  resetModal() {
    this.auth.username = '';
    this.auth.password = '';
    this.nameState = null;
    this.errorMessage = '';
  }

  handleOk(bvModalEvt) {
    // Prevent modal from closing
    bvModalEvt.preventDefault();
    // Trigger submit handler
    this.handleSubmit();
  }

  handleSubmit() {
    // Exit when the form isn't valid
    if (!this.checkFormValidity()) {
      return;
    }
    // Push the name to submitted names
    userService
      .login(this.auth)
      .then(() => {
        console.log('Login success.');
        this.$nextTick(() => {
          this.$bvModal.hide('modal-prevent-closing');
        });
      })
      .catch((error) => {
        // this.nameState = false;
        console.log(error.response);
        if (error.response && error.response.status === 401) {
          this.nameState = false;
          this.errorMessage = 'Login failed, Username or Password wrong.';
        } else {
          this.urlState = false;
          this.errorMessage = `Login failed.
            Please verify that the bot is running, the Bot API is enabled and the URL is reachable.
            You can try this by going to http://${this.auth.url}/api/v1/ping`;
        }
        console.log(this.errorMessage);
        // this.addAlert({ message: 'Login failed' });
      });
    setBaseUrl(userService.getAPIUrl());
    // Hide the modal manually
  }
}
</script>

<style scoped>
</style>
