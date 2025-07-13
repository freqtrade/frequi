<script setup lang="ts">
import type { AuthPayload, AuthPayloadWithTokens, AuthStorageWithBotId } from '@/types';

import { useBotStore } from '@/stores/ftbotwrapper';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const props = defineProps({
  inModal: { default: false, type: Boolean },
  existingAuth: { default: null, required: false, type: Object as () => AuthStorageWithBotId },
});
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
const activeTab = ref(0);
const botJsonValue = ref('');

const emitLoginResult = (value: boolean) => {
  emit('loginResult', value);
};

const urlDuplicate = computed<boolean>(() => {
  const bots = Object.values(botStore.availableBots).find((bot) => bot.botUrl === auth.value.url);
  return !botEdit.value && bots !== undefined;
});

const checkFormValidity = () => {
  const valid = formRef.value?.checkValidity();
  nameState.value = valid || auth.value.username !== '';
  pwdState.value = valid || auth.value.password !== '';
  urlState.value = valid || auth.value.url !== '';
  return valid;
};

const resetLogin = () => {
  auth.value.botName = '';
  auth.value.url = defaultURL;
  auth.value.username = '';
  auth.value.password = '';
  nameState.value = undefined;
  pwdState.value = undefined;
  urlState.value = undefined;
  errorMessage.value = '';
  botEdit.value = false;
};

const handleReset = (evt) => {
  evt.preventDefault();
  resetLogin();
  // Clear the textarea content
  botJsonValue.value = '';
};
const handleSubmit = async (botPayload?: AuthPayload) => {
  // Exit when the form isn't valid (only for manual form, not import)
  if (!botPayload && !checkFormValidity()) {
    return;
  }
  errorMessage.value = '';
  // Push the name to submitted names
  try {
    const botId = botEdit.value ? props.existingAuth.botId : botStore.nextBotId;
    const { login } = useLoginInfo(botId);
    await login(botPayload || auth.value);
    if (botEdit.value) {
      // Bot editing ...
      botStore.botStores[botId].isBotLoggedIn = true;
      botStore.botStores[botId].isBotOnline = true;
      emitLoginResult(true);
    } else {
      // Add new bot
      const sortId = Object.keys(botStore.availableBots).length + 1;
      botStore.addBot({
        botName: (botPayload || auth.value).botName,
        botId,
        botUrl: (botPayload || auth.value).url,
        sortId: sortId,
      });
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
  } catch (error: any) {
    errorMessageCORS.value = false;
    // this.nameState = false;
    console.error(error);
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      nameState.value = false;
      pwdState.value = false;
      errorMessage.value = 'Connected to bot, however Login failed, Username or Password wrong.';
    } else {
      urlState.value = false;
      errorMessage.value = `Login failed.\nPlease verify that the bot is running, the Bot API is enabled and the URL is reachable.\nYou can verify this by navigating to ${(botPayload || auth.value).url}/api/v1/ping to make sure the bot API is reachable`;
      if ((botPayload || auth.value).url !== window.location.origin) {
        errorMessageCORS.value = true;
      }
    }
    console.error(errorMessage.value);
    emitLoginResult(false);
    throw error; // propagate for import
  }
};

const handleTokenBasedImport = async (botData: AuthPayloadWithTokens) => {
  // Validate required fields for token-based import
  if (!botData.botName || !botData.url || !botData.accessToken || !botData.refreshToken) {
    console.error('Missing required fields:', {
      botName: !!botData.botName,
      url: !!botData.url,
      accessToken: !!botData.accessToken,
      refreshToken: !!botData.refreshToken,
    });
    throw new Error('Missing required fields: botName, url, accessToken, refreshToken');
  }

  const botId = botStore.nextBotId;
  const { setLoginInfo } = useLoginInfo(botId);

  setLoginInfo({
    botName: botData.botName,
    apiUrl: botData.url,
    username: botData.username,
    accessToken: botData.accessToken,
    refreshToken: botData.refreshToken,
    autoRefresh: true,
  });

  // Add new bot to store (similar to handleSubmit but without login)
  const sortId = Object.keys(botStore.availableBots).length + 1;
  botStore.addBot({
    botName: botData.botName,
    botId,
    botUrl: botData.url,
    sortId: sortId,
  });

  // Set bot as logged in since we have tokens
  botStore.botStores[botId].isBotLoggedIn = true;
  botStore.botStores[botId].isBotOnline = true;
  // Select the newly added bot
  botStore.selectBot(botId);

  // Refresh bot data
  botStore.allRefreshFull();

  emitLoginResult(true);
};

const handleImportSubmit = async () => {
  errorMessage.value = '';
  const failedBots: { name: string; error: string }[] = [];
  let bots: any[] = [];
  const raw = botJsonValue.value;
  if (!raw.trim()) {
    errorMessage.value = 'Please paste bot details JSON.';
    return;
  }
  // Try base64 decode if not valid JSON
  try {
    bots = JSON.parse(raw);
  } catch {
    try {
      const decoded = atob(raw);
      bots = JSON.parse(decoded);
    } catch (e) {
      errorMessage.value = 'Invalid JSON or base64-encoded JSON.';
      return;
    }
  }
  if (!Array.isArray(bots)) {
    errorMessage.value = 'Bot details must be a JSON array.';
    return;
  }
  for (const bot of bots) {
    try {
      // Check if this is a token-based import (has accessToken and refreshToken but no password)
      if (bot.accessToken && bot.refreshToken && !bot.password) {
        await handleTokenBasedImport(bot);
      } else {
        // Regular password-based import
        await handleSubmit(bot);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      failedBots.push({ name: (bot.botName as string) || 'Unknown', error: errorMessage });
    }
  }
  if (failedBots.length > 0) {
    errorMessage.value =
      'Some bots could not be processed:\n' +
      failedBots.map((b) => `- ${b.name}: ${b.error}`).join('\n');
  } else {
    errorMessage.value = '';
  }
};

const handleOk = (evt) => {
  evt.preventDefault();
  if (activeTab.value === 1) {
    handleImportSubmit();
  } else {
    handleSubmit();
  }
};
const reset = () => {
  resetLogin();
  console.log('reset ', props.existingAuth);
  if (props.existingAuth) {
    botEdit.value = true;
    auth.value.botName = props.existingAuth.botName;
    auth.value.url = props.existingAuth.apiUrl;
    auth.value.username = props.existingAuth.username ?? '';
  }
};

defineExpose({
  reset,
});

onMounted(() => {
  reset();
});

const importPlaceholder = `JSON array in plain text or base64 encoded. 
Password-based format:
[{"botName":"Bot Name","url":"${auth.value.url}","username":"Freqtrader","password":""}]
Token-based format:
[{"botName":"Bot Name","url":"${auth.value.url}","username":"Freqtrader","accessToken":"your_access_token","refreshToken":"your_refresh_token"}]
Base64 example: W3siYm90TmFtZSI6IkJvdCBOYW1lIiwidXJsIjoiJHthdXRoLnVybH0iLCJ1c2VybmFtZSI6IkZyZXF0cmFkZXIiLCJwYXNzd29yZCI6IiJ9XQ==`;
</script>

<template>
  <form ref="formRef" novalidate @submit.stop.prevent="handleSubmit" @reset="handleReset">
    <TabView v-model:active-index="activeTab">
      <TabPanel header="Bot Login" value="login">
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
          <span v-if="pwdState === false" class="mt-2 text-sm text-red-500">
            Invalid Password
          </span>
        </div>
      </TabPanel>
      <TabPanel header="Import" value="import">
        <div class="flex flex-col gap-4">
          <label for="bot-json" class="font-semibold">Paste Bot Details JSON:</label>
          <Textarea
            id="bot-json"
            v-model="botJsonValue"
            class="w-full h-64 font-mono text-sm"
            :placeholder="importPlaceholder"
            auto-resize
            rows="12"
          />
        </div>
      </TabPanel>
    </TabView>
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
      <Button label="Submit" severity="primary" type="submit" @click="handleOk">
        <template #icon>
          <i-mdi-login />
        </template>
      </Button>
    </div>
  </form>
</template>
