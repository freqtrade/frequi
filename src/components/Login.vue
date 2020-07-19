<template>
  <div class="container">
    <form ref="form" @submit.stop.prevent="handleSubmit" @reset="handleReset" novalidate>
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
      <b-form-group label="Password" label-for="password-input" invalid-feedback="Invalid Password">
        <b-form-input
          id="password-input"
          v-model="auth.password"
          required
          @keydown.enter.native="handleOk"
          type="password"
        ></b-form-input>
      </b-form-group>
      <div v-if="inModal === false" class="float-right">
        <b-button class="mr-2" type="reset" variant="danger">Reset</b-button>
        <b-button type="submit" variant="primary">Submit</b-button>
      </div>
    </form>
    <div>
      <b-alert v-if="errorMessage" show variant="warning">
        {{ errorMessage }}
      </b-alert>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit, Prop } from 'vue-property-decorator';
import { Mutation } from 'vuex-class';
import userService from '@/shared/userService';
import { setBaseUrl } from '@/shared/apiService';

import { AuthPayload } from '@/store/types';

const defaultURL = 'http://localhost:8080';

@Component({})
export default class Login extends Vue {
  @Mutation setLoggedIn;

  @Prop({ default: false, required: true }) inModal!: boolean;

  $refs!: {
    form: HTMLFormElement;
  };

  auth: AuthPayload = {
    url: defaultURL,
    username: '',
    password: '',
  };

  @Emit('loginResult')
  emitLoginResult(value: boolean) {
    return value;
  }

  nameState: boolean | null = null;

  urlState: boolean | null = null;

  errorMessage = '';

  checkFormValidity() {
    const valid = this.$refs.form.checkValidity();
    this.nameState = valid;
    return valid;
  }

  resetLogin() {
    this.auth.url = defaultURL;
    this.auth.username = '';
    this.auth.password = '';
    this.nameState = null;
    this.errorMessage = '';
  }

  handleReset(evt) {
    evt.preventDefault();
    this.resetLogin();
  }

  handleOk(evt) {
    evt.preventDefault();
    this.handleSubmit();
  }

  handleSubmit() {
    // Exit when the form isn't valid
    if (!this.checkFormValidity()) {
      return;
    }
    this.errorMessage = '';
    // Push the name to submitted names
    userService
      .login(this.auth)
      .then(() => {
        console.log('Login success.');
        this.setLoggedIn(true);
        this.emitLoginResult(true);
        if (this.inModal === false) {
          this.$router.push('/');
        }
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
        this.emitLoginResult(false);
      });
    setBaseUrl(userService.getAPIUrl());
  }
}
</script>

<style scoped>
</style>
