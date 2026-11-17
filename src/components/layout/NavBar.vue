<script setup lang="ts">
import Favico from 'favico.js';

import type { AuthStorageWithBotId } from '@/types';
import type { DropdownMenuItem } from '@nuxt/ui';
import { breakpointsTailwind } from '@vueuse/core';
import { useRoute } from 'vue-router';

const botStore = useBotStore();

const settingsStore = useSettingsStore();
const boardsStore = useBoardsStore();
const route = useRoute();
const router = useRouter();
const favicon = ref<Favico | undefined>(undefined);
const pingInterval = ref<number>();
const loginDialog = useLoginDialog();

const breakpoints = useBreakpoints(breakpointsTailwind);

const isMobile = breakpoints.smallerOrEqual('md');

async function clickLogout() {
  botStore.removeBot(botStore.selectedBot);
  // TODO: This should be per bot
  await router.push('/');
}

const setOpenTradesAsPill = (tradeCount: number) => {
  if (!favicon.value) {
    favicon.value = new Favico({
      animation: 'none',
      // position: 'up',
      // fontStyle: 'normal',
      // bgColor: '#',
      // textColor: '#FFFFFF',
    });
  }
  if (tradeCount !== 0 && settingsStore.openTradesInTitle === 'showPill') {
    favicon.value.badge(tradeCount);
  } else {
    favicon.value.reset();
    console.log('reset');
  }
};
const setTitle = () => {
  let title = 'freqUI';
  if (settingsStore.openTradesInTitle === OpenTradeVizOptions.asTitle) {
    title = `(${botStore.activeBot?.openTradeCount}) ${title}`;
  }
  if (botStore.activeBot?.botName) {
    title = `${title} - ${botStore.activeBot?.botName}`;
  }
  document.title = title;
};

onBeforeUnmount(() => {
  if (pingInterval.value) {
    clearInterval(pingInterval.value);
  }
});

onMounted(async () => {
  await settingsStore.loadUIVersion();
  pingInterval.value = window.setInterval(botStore.pingAll, 60000);
});

settingsStore.$subscribe((_, state) => {
  const needsUpdate = settingsStore.openTradesInTitle !== state.openTradesInTitle;
  if (needsUpdate) {
    setTitle();
    setOpenTradesAsPill(botStore.activeBot?.openTradeCount || 0);
  }
});

watch(
  () => botStore.activeBot?.botName,
  () => setTitle(),
);
watch(
  () => botStore.activeBot?.openTradeCount,
  () => {
    if (settingsStore.openTradesInTitle === OpenTradeVizOptions.showPill) {
      setOpenTradesAsPill(botStore.activeBot?.openTradeCount ?? 0);
    } else if (settingsStore.openTradesInTitle === OpenTradeVizOptions.asTitle) {
      setTitle();
    }
  },
);

const { flatItems } = useNavItems();
const pageTitle = computed(() => {
  const board = boardsStore.activeBoardId ? boardsStore.boards[boardsStore.activeBoardId] : undefined;
  if (board) return board.name;
  if (route?.path === '/settings') return 'Settings';
  return flatItems.value.find((i) => route?.path.startsWith(i.to))?.label ?? '';
});

const menuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: `V: ${settingsStore.uiVersion}`,
      disabled: true,
    },
  ],
  [
    {
      label: 'Settings',
      icon: 'i-mdi-cog',
      onSelect: () => router.push('/settings'),
    },
  ],
  ...(botStore.hasBots && botStore.botCount === 1
    ? [
        [
          {
            label: 'Logout',
            icon: 'i-mdi-logout',
            onSelect: clickLogout,
          },
        ],
      ]
    : []),
]);

function editBotLogin(botId: string) {
  const bot = botStore.botStores[botId];
  if (!bot) {
    showAlert('Bot not found', 'warning');
    return;
  }
  const loginInfo: AuthStorageWithBotId = {
    ...bot.getLoginInfo(),
    botId,
  };

  loginDialog({ loginInfo: loginInfo });
}
</script>

<template>
  <header class="relative z-30 px-2 pt-2 md:px-3">
    <div class="glass-strong flex items-center gap-3 rounded-2xl px-3 py-1">
      <!-- Mobile: brand (desktop has it in the sidebar) -->
      <RouterLink class="flex flex-row items-center gap-2 md:hidden" exact to="/">
        <AppIcon class="h-8 w-8 drop-shadow-[0_0_8px_var(--ft-accent-glow)]" />
        <AppText />
      </RouterLink>
      <h1 class="hidden truncate text-lg font-semibold tracking-tight md:block">{{ pageTitle }}</h1>
      <BoardControls v-if="!isMobile" />

      <div class="ms-auto flex items-center gap-2">
        <div
          v-if="!settingsStore.confirmDialog"
          class="flex text-yellow-300"
          title="Confirm dialog deactivated, Forced exits will be executed immediately. Be careful."
        >
          <i-mdi-run-fast />
          <i-mdi-alert />
        </div>

        <template v-if="!isMobile">
          <span class="text-sm text-muted" title="Bot name">
            {{ (botStore.activeBot && botStore.activeBot.botName) || 'No bot selected' }}
          </span>
          <BotEntry
            v-if="botStore.selectedBotObj"
            :bot="botStore.selectedBotObj"
            noButtons
            no-text
            @edit-login="editBotLogin"
          />
          <BotSelect />
          <ReloadControl title="Confirm Dialog deactivated." />
          <UDropdownMenu v-if="botStore.hasBots" :items="menuItems" size="lg">
            <UButton color="neutral" variant="ghost" size="sm" trailing-icon="mdi:chevron-down">
              <UAvatar size="sm"> FT </UAvatar>
            </UButton>
          </UDropdownMenu>
          <UButton
            v-else-if="route?.path !== '/login'"
            color="neutral"
            @click="loginDialog({})"
            icon="mdi:login"
            >Login
          </UButton>
        </template>

        <!-- Mobile menu -->
        <USlideover
          v-else
          direction="right"
          :close="{
            color: 'primary',
            variant: 'outline',
            class: 'rounded-full',
          }"
        >
          <UButton class="text-xl" size="xl" variant="ghost" color="neutral" icon="mdi:menu" />
          <template #title>
            <div class="flex flex-row items-center gap-2">
              <AppIcon class="h-9 w-9" />
              <AppText />
            </div>
          </template>
          <template #body="{ close }">
            <div class="flex flex-col gap-1 items-center p-4 h-full">
              <UNavigationMenu
                :items="[
                  ...flatItems.map((item) => ({ ...item, onSelect: close })),
                  { label: 'Settings', to: '/settings', icon: 'i-mdi-cog', onSelect: close },
                ]"
                variant="link"
                :default-open="true"
                orientation="vertical"
              />
              <USeparator class="my-2" />
              <span>Version: {{ settingsStore.uiVersion }}</span>

              <div class="flex flex-row items-center justify-center">
                <ThemeSelect show-text />
              </div>
              <AccentSelect show-text class="my-2" />
              <USeparator class="my-2" />
              <div class="flex flex-row items-center">
                <span class="text-sm me-2" title="Bot name">
                  {{ (botStore.activeBot && botStore.activeBot.botName) || 'No bot selected' }}
                </span>
                <BotEntry
                  v-if="botStore.selectedBotObj"
                  :bot="botStore.selectedBotObj"
                  noButtons
                  no-text
                  @edit-login="editBotLogin"
                />
              </div>
              <BotSelect />
              <USeparator class="my-2" />
              <ReloadControl class="justify-center w-full" />
              <USeparator class="my-2" />
              <BoardControls />
            </div>
          </template>
        </USlideover>
      </div>
    </div>
  </header>
</template>
