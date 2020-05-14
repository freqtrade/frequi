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
          :state="nameState"
          label="Username"
          label-for="name-input"
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
import { mapActions } from 'vuex';

export default {
  name: 'Login',
  data() {
    return {
      auth: {
        username: '',
        password: '',
      },
      nameState: null,
    };
  },
  methods: {
    ...mapActions('user', ['login']),

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
      this.login(this.auth);
      // localStorage.setItem('auth', JSON.stringify(this.auth));
      // Hide the modal manually
      this.$nextTick(() => {
        this.$bvModal.hide('modal-prevent-closing');
      });
    },
  },
};
</script>

<style></style>
