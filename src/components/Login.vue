<template>
  <div>
    <form ref="formRef" novalidate @submit.stop.prevent="handleSubmit" @reset="handleReset">
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
      <div v-if="inModal === false" class="float-end">
        <b-button class="mr-2" type="reset" variant="danger">Reset</b-button>
        <b-button type="submit" variant="primary">Submit</b-button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { useUserService } from '@/shared/userService';

import { AuthPayload } from '@/types';

import { defineComponent, ref } from 'vue';
import { useRouter, useRoute } from '@/composables/router-helper';
import { useBotStore } from '@/stores/ftbotwrapper';

const defaultURL = window.location.origin || 'http://localhost:3000';

export default defineComponent({
  name: 'Login',
  props: {
    inModal: { default: false, type: Boolean },
  },
  emits: ['loginResult'],
  setup(props, { emit }) {
    const router = useRouter();
    const route = useRoute();
    const botStore = useBotStore();

    const nameState = ref<boolean | null>();
    const pwdState = ref<boolean | null>();
    const urlState = ref<boolean | null>();
    const errorMessage = ref<string>('');
    const errorMessageCORS = ref<boolean>(false);
    const formRef = ref<HTMLFormElement>();
    const auth = ref<AuthPayload>({
      botName: '',
      url: defaultURL,
      username: '',
      password: '',
    });

    const emitLoginResult = (value: boolean) => {
      emit('loginResult', value);
    };

    const checkFormValidity = () => {
      const valid = formRef.value?.checkValidity();
      nameState.value = valid || auth.value.username !== '';
      pwdState.value = valid || auth.value.password !== '';
      return valid;
    };

    const resetLogin = () => {
      auth.value.url = defaultURL;
      auth.value.username = '';
      auth.value.password = '';
      nameState.value = null;
      pwdState.value = null;
      errorMessage.value = '';
    };

    const handleReset = (evt) => {
      evt.preventDefault();
      resetLogin();
    };

    const handleSubmit = () => {
      // Exit when the form isn't valid
      if (!checkFormValidity()) {
        return;
      }
      errorMessage.value = '';
      const userService = useUserService(botStore.nextBotId);
      // Push the name to submitted names
      userService
        .login(auth.value)
        .then(() => {
          const botId = botStore.nextBotId;
          botStore.addBot({
            botName: auth.value.botName,
            botId,
            botUrl: auth.value.url,
          });
          if (botStore.selectedBot === '') {
            console.log(`selecting bot ${botId}`);
            botStore.selectBot(botId);
          }

          emitLoginResult(true);
          botStore.allRefreshFull();
          if (props.inModal === false) {
            if (typeof route?.query.redirect === 'string') {
              const resolved = router.resolve({ path: route.query.redirect });
              if (resolved.route.name !== '404') {
                router.push(resolved.route.path);
              } else {
                router.push('/');
              }
            } else {
              router.push('/');
            }
          }
        })
        .catch((error) => {
          errorMessageCORS.value = false;
          // this.nameState = false;
          console.error(error);
          if (error.response && error.response.status === 401) {
            nameState.value = false;
            pwdState.value = false;
            errorMessage.value =
              'Connected to bot, however Login failed, Username or Password wrong.';
          } else {
            urlState.value = false;
            errorMessage.value = `Login failed.
Please verify that the bot is running, the Bot API is enabled and the URL is reachable.
You can verify this by navigating to ${auth.value.url}/api/v1/ping to make sure the bot API is reachable`;
            if (auth.value.url !== window.location.origin) {
              errorMessageCORS.value = true;
            }
          }
          console.error(errorMessage.value);
          emitLoginResult(false);
        });
    };

    const handleOk = (evt) => {
      evt.preventDefault();
      handleSubmit();
    };

    return {
      nameState,
      pwdState,
      urlState,
      errorMessage,
      auth,
      checkFormValidity,
      resetLogin,
      handleReset,
      handleOk,
      handleSubmit,
      formRef,
      errorMessageCORS,
    };
  },
});
</script>

<style scoped lang="scss">
.alert-wrap {
  white-space: pre-wrap;
}
</style>
