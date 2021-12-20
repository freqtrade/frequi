<template>
  <div>
    <form ref="form" novalidate @submit.stop.prevent="handleSubmit" @reset="handleReset">
      <b-form-group label="Bot Name" label-for="name-input">
        <b-form-input
          id="name-input"
          v-model="auth.botName"
          placeholder="Bot Name"
          @keydown.enter.native="handleOk"
        ></b-form-input>
      </b-form-group>
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
          required
          @keydown.enter.native="handleOk"
        ></b-form-input>
      </b-form-group>
      <b-form-group
        :state="nameState"
        label="Username"
        label-for="username-input"
        invalid-feedback="Name and Password are required."
      >
        <b-form-input
          id="username-input"
          v-model="auth.username"
          required
          placeholder="Freqtrader"
          @keydown.enter.native="handleOk"
        ></b-form-input>
      </b-form-group>
      <b-form-group
        label="Password"
        label-for="password-input"
        invalid-feedback="Invalid Password"
        :state="pwdState"
      >
        <b-form-input
          id="password-input"
          v-model="auth.password"
          required
          type="password"
          @keydown.enter.native="handleOk"
        ></b-form-input>
      </b-form-group>
      <div>
        <b-alert v-if="errorMessage" class="alert-wrap" show variant="warning">
          {{ errorMessage }}
          <br />
          <span v-if="errorMessageCORS">
            Please also check your bot's CORS configuration:
            <a href="https://www.freqtrade.io/en/latest/rest-api/#cors"
              >Freqtrade CORS documentation</a
            ></span
          >
        </b-alert>
      </div>
      <div v-if="inModal === false" class="float-right">
        <b-button class="mr-2" type="reset" variant="danger">Reset</b-button>
        <b-button type="submit" variant="primary">Submit</b-button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit, Prop } from 'vue-property-decorator';
import { Action, namespace } from 'vuex-class';
import { useUserService } from '@/shared/userService';

import { AuthPayload, BotDescriptor } from '@/types';
import { MultiBotStoreGetters } from '@/store/modules/botStoreWrapper';
import StoreModules from '@/store/storeSubModules';

const defaultURL = window.location.origin || 'http://localhost:8080';
const ftbot = namespace(StoreModules.ftbot);

@Component({})
export default class Login extends Vue {
  @Action setLoggedIn;

  @ftbot.Getter [MultiBotStoreGetters.nextBotId]: string;

  @ftbot.Getter [MultiBotStoreGetters.selectedBot]: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action addBot!: (payload: BotDescriptor) => void;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action selectBot!: (botId: string) => void;

  @Prop({ default: false }) inModal!: boolean;

  $refs!: {
    form: HTMLFormElement;
  };

  auth: AuthPayload = {
    botName: '',
    url: defaultURL,
    username: '',
    password: '',
  };

  @Emit('loginResult')
  emitLoginResult(value: boolean) {
    return value;
  }

  nameState: boolean | null = null;

  pwdState: boolean | null = null;

  urlState: boolean | null = null;

  errorMessage = '';

  errorMessageCORS = false;

  checkFormValidity() {
    const valid = this.$refs.form.checkValidity();
    this.nameState = valid || this.auth.username !== '';
    this.pwdState = valid || this.auth.password !== '';
    return valid;
  }

  resetLogin() {
    this.auth.url = defaultURL;
    this.auth.username = '';
    this.auth.password = '';
    this.nameState = null;
    this.pwdState = null;
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
    const userService = useUserService(this.nextBotId);
    // Push the name to submitted names
    userService
      .login(this.auth)
      .then(() => {
        const botId = this.nextBotId;
        this.addBot({
          botName: this.auth.botName,
          botId,
          botUrl: this.auth.url,
        });
        if (this.selectedBot === '') {
          console.log(`selecting bot ${botId}`);
          this.selectBot(botId);
        }

        this.emitLoginResult(true);
        if (this.inModal === false) {
          if (typeof this.$route.query.redirect === 'string') {
            const resolved = this.$router.resolve({ path: this.$route.query.redirect });
            if (resolved.route.name !== '404') {
              this.$router.push(resolved.route.path);
            } else {
              this.$router.push('/');
            }
          } else {
            this.$router.push('/');
          }
        }
      })
      .catch((error) => {
        this.errorMessageCORS = false;
        // this.nameState = false;
        console.error(error.response);
        if (error.response && error.response.status === 401) {
          this.nameState = false;
          this.pwdState = false;
          this.errorMessage = 'Connected to bot, however Login failed, Username or Password wrong.';
        } else {
          this.urlState = false;
          this.errorMessage = `Login failed.
Please verify that the bot is running, the Bot API is enabled and the URL is reachable.
You can verify this by navigating to ${this.auth.url}/api/v1/ping to make sure the bot API is reachable`;
          if (this.auth.url !== window.location.origin) {
            this.errorMessageCORS = true;
          }
        }
        console.error(this.errorMessage);
        this.emitLoginResult(false);
      });
  }
}
</script>

<style scoped lang="scss">
.alert-wrap {
  white-space: pre-wrap;
}
</style>
