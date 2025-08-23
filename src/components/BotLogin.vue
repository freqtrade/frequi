<script setup lang="ts">
import type { AuthPayload, AuthStorageWithBotId } from '@/types';

import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const props = withDefaults(
  defineProps<{
    inModal?: boolean;
    existingAuth?: AuthStorageWithBotId;
  }>(),
  {
    inModal: false,
    existingAuth: undefined,
  },
);
const emit = defineEmits<{ loginResult: [value: boolean] }>();

const defaultURL = window.location.origin || 'http://localhost:3000';

const router = useRouter();
const route = useRoute();
const botStore = useBotStore();

const nameState = ref<boolean>();
const pwdState = ref<boolean>();
const urlState = ref<boolean>();
const errorMessage = ref<string>('');
const errorMessageCORS = ref<boolean>(false);
const formRef = ref<HTMLFormElement>();
const botEdit = ref<boolean>(false);
const auth = ref<AuthPayload>({
  botName: '',
  url: defaultURL,
  username: '',
  password: '',
});

function emitLoginResult(value: boolean) {
  emit('loginResult', value);
}

const urlDuplicate = computed<boolean>(() => {
  const bots = Object.values(botStore.availableBots).find((bot) => bot.botUrl === auth.value.url);
  return !botEdit.value && bots !== undefined;
});

function checkFormValidity() {
  const valid = formRef.value?.checkValidity();
  nameState.value = valid || auth.value.username !== '';
  pwdState.value = valid || auth.value.password !== '';
  urlState.value = valid || auth.value.url !== '';
  return valid;
}

function resetLogin() {
  auth.value.botName = '';
  auth.value.url = defaultURL;
  auth.value.username = '';
  auth.value.password = '';
  nameState.value = undefined;
  pwdState.value = undefined;
  urlState.value = undefined;
  errorMessage.value = '';
  botEdit.value = false;
}

function handleReset(evt) {
  evt.preventDefault();
  resetLogin();
}

async function handleSubmit() {
  // Exit when the form isn't valid
  if (!checkFormValidity()) {
    return;
  }
  errorMessage.value = '';
  // Push the name to submitted names
  try {
    const botId =
      botEdit.value && props.existingAuth ? props.existingAuth.botId : botStore.nextBotId;
    const { login } = useLoginInfo(botId);
    await login(auth.value);
    if (botEdit.value) {
      // Bot editing ...
      const thisBot = botStore.botStores[botId];
      if (thisBot) {
        thisBot.isBotLoggedIn = true;
        thisBot.isBotOnline = true;
      }
      // botStore.allRefreshFull();
      emitLoginResult(true);
    } else {
      // Add new bot
      const sortId = Object.keys(botStore.availableBots).length + 1;
      botStore.addBot({
        botName: auth.value.botName,
        botId,
        botUrl: auth.value.url,
        sortId: sortId,
      });
      // switch to newly added bot
      botStore.selectBot(botId);
      emitLoginResult(true);
      botStore.allRefreshFull();
    }

    if (props.inModal === false) {
      if (typeof route?.query.redirect === 'string') {
        const resolved = router.resolve({ path: route.query.redirect });
        if (resolved.name === '404') {
          router.push('/');
        } else {
          router.push(resolved.path);
        }
      } else {
        router.push('/');
      }
    }
  } catch (error) {
    errorMessageCORS.value = false;
    // this.nameState = false;
    console.error(error);
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      nameState.value = false;
      pwdState.value = false;
      errorMessage.value = 'Connected to bot, however Login failed, Username or Password wrong.';
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
  }
}

function handleOk(evt) {
  evt.preventDefault();
  handleSubmit();
}

function reset() {
  resetLogin();
  console.log('reset ', props.existingAuth);
  if (props.existingAuth) {
    botEdit.value = true;
    auth.value.botName = props.existingAuth.botName;
    auth.value.url = props.existingAuth.apiUrl;
    auth.value.username = props.existingAuth.username ?? '';
  }
}

defineExpose({
  reset,
});

onMounted(() => {
  reset();
});
</script>

<template>
  <form ref="formRef" novalidate @submit.stop.prevent="handleSubmit" @reset="handleReset">
    <div class="mb-4">
      <label for="name-input" class="block text-sm font-medium">Bot Name</label>
      <InputText
        id="name-input"
        v-model="auth.botName"
        placeholder="Bot Name"
        class="mt-1 block w-full"
        @keydown.enter="handleOk"
      />
    </div>
    <div class="mb-4">
      <label for="url-input" class="block text-sm font-medium">API Url</label>
      <InputText
        id="url-input"
        v-model="auth.url"
        required
        trim
        :invalid="urlState === false"
        class="mt-1 block w-full"
        @keydown.enter="handleOk"
      />
      <span v-if="urlState === false" class="mt-2 text-sm text-red-500">API URL required</span>
      <Message v-if="urlDuplicate" class="mt-2 text-sm" severity="warn">
        This URL is already in use by another bot.
      </Message>
    </div>
    <div class="mb-4">
      <label for="username-input" class="block text-sm font-medium">Username</label>
      <InputText
        id="username-input"
        v-model="auth.username"
        required
        placeholder="Freqtrader"
        :invalid="nameState === false"
        class="mt-1 block w-full"
        @keydown.enter="handleOk"
      />
      <span v-if="nameState === false" class="mt-2 text-sm text-red-500">
        Name and Password are required.
      </span>
    </div>
    <div class="mb-4">
      <label for="password-input" class="block text-sm font-medium">Password</label>
      <InputText
        id="password-input"
        v-model="auth.password"
        required
        type="password"
        :invalid="pwdState === false"
        class="mt-1 block w-full"
        @keydown.enter="handleOk"
      />
      <span v-if="pwdState === false" class="mt-2 text-sm text-red-500"> Invalid Password </span>
    </div>
    <div>
      <Message v-if="errorMessage" class="mt-2 text-sm whitespace-pre-line" severity="warn">
        {{ errorMessage }}
        <br />
        <span v-if="errorMessageCORS">
          Please also check your bot's CORS configuration:
          <a
            href="https://www.freqtrade.io/en/latest/rest-api/#cors"
            class="text-blue-500 underline"
            >Freqtrade CORS documentation</a
          >
        </span>
      </Message>
    </div>
    <div class="flex justify-end gap-2 mt-4">
      <Button label="Reset" severity="danger" type="reset" />
      <Button
        v-if="inModal"
        label="Cancel"
        severity="secondary"
        type="button"
        @click="emitLoginResult(true)"
      />
      <Button label="Submit" severity="primary" type="submit">
        <template #icon>
          <i-mdi-login />
        </template>
      </Button>
    </div>
  </form>
</template>
