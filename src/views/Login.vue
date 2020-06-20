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
            :state="nameState"
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
    </b-modal>
  </div>
</template>

<script>
import userService from '@/shared/userService';

export default {
  name: 'Login',
  data() {
    return {
      auth: {
        url: 'http://localhost:8080',
        username: '',
        password: '',
      },
      nameState: null,
      urlState: null,
    };
  },
  methods: {
    checkFormValidity() {
      const valid = this.$refs.form.checkValidity();
      this.nameState = valid;
      return valid;
    },
    resetModal() {
      this.auth.username = '';
      this.auth.password = '';
      this.nameState = null;
    },
    handleOk(bvModalEvt) {
      // Prevent modal from closing
      bvModalEvt.preventDefault();
      // Trigger submit handler
      this.handleSubmit();
    },
    handleSubmit() {
      // Exit when the form isn't valid
      if (!this.checkFormValidity()) {
        return;
      }
      // Push the name to submitted names
      userService.login(this.auth);
      // Hide the modal manually
      this.$nextTick(() => {
        this.$bvModal.hide('modal-prevent-closing');
      });
    },
  },
};
</script>

<style></style>
