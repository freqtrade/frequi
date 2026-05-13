<script setup lang="ts">
import Favico from 'favico.js';

import { useRoute } from 'vue-router';
import type { DropdownMenuItem } from '@nuxt/ui';
import { breakpointsTailwind } from '@vueuse/core';
import type { AuthStorageWithBotId } from '@/types';

const botStore = useBotStore();

const settingsStore = useSettingsStore();
const layoutStore = useLayoutStore();
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
const resetDynamicLayout = (): void => {
  console.log(`resetLayout called for ${route?.fullPath}`);
  switch (route?.fullPath) {
    case '/trade':
      layoutStore.resetTradingLayout();
      break;
    case '/dashboard':
      layoutStore.resetDashboardLayout();
      break;
    default:
  }
};
const setTitle = () => {
  let title = 'freqUI';
  if (settingsStore.openTradesInTitle === OpenTradeVizOptions.asTitle) {
    title = `(${botStore.activeBotorUndefined?.openTradeCount}) ${title}`;
  }
  if (botStore.activeBotorUndefined?.botName) {
    title = `${title} - ${botStore.activeBotorUndefined?.botName}`;
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
    setOpenTradesAsPill(botStore.activeBotorUndefined?.openTradeCount || 0);
  }
});

watch(
  () => botStore.activeBotorUndefined?.botName,
  () => setTitle(),
);
watch(
  () => botStore.activeBotorUndefined?.openTradeCount,
  () => {
    if (settingsStore.openTradesInTitle === OpenTradeVizOptions.showPill) {
      setOpenTradesAsPill(botStore.activeBotorUndefined?.openTradeCount ?? 0);
    } else if (settingsStore.openTradesInTitle === OpenTradeVizOptions.asTitle) {
      setTitle();
    }
  },
);

// Navigation items array
const navItems = ref([
  {
    label: 'Trade',
    to: '/trade',
    visible: computed(() => !botStore.canRunBacktest),
    icon: 'i-mdi-currency-usd',
  },
  {
    label: 'Dashboard',
    to: '/dashboard',
    visible: computed(() => !botStore.canRunBacktest),
    icon: 'i-mdi-view-dashboard',
  },
  {
    label: 'Chart',
    to: '/graph',
    icon: 'i-mdi-chart-line',
  },
  {
    label: 'Logs',
    to: '/logs',
    icon: 'i-mdi-format-list-bulleted',
  },
  {
    label: 'Settings',
    to: '/settings',
    mobileOnly: true,
    icon: 'i-mdi-cog',
  },
  {
    label: 'Backtest',
    to: '/backtest',
    visible: computed(() => botStore.canRunBacktest),
    icon: 'i-mdi-currency-usd',
  },
  {
    label: 'Download Data',
    to: '/download_data',
    visible: computed(
      () => botStore.isWebserverMode && botStore.activeBot.botFeatures.downloadDataView,
    ),
    icon: 'i-mdi-download',
  },
  {
    label: 'Pairlist Config',
    to: '/pairlist_config',
    icon: 'i-mdi-format-list-numbered-rtl',
    visible: computed(
      () =>
        (botStore.activeBot?.isWebserverMode ?? false) &&
        botStore.activeBot.botFeatures.pairlistConfig,
    ),
  },
]);

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
    {
      label: layoutStore.layoutLocked ? 'Unlock Layout' : 'Lock Layout',
      icon: layoutStore.layoutLocked ? 'i-mdi-lock' : 'i-mdi-lock-open',
      onSelect: () => {
        layoutStore.layoutLocked = !layoutStore.layoutLocked;
      },
    },
    {
      label: 'Reset Layout',
      icon: 'i-mdi-lock-reset',
      onSelect: resetDynamicLayout,
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
  <header>
    <div class="flex border-b border-primary">
      <RouterLink class="ms-2 flex flex-row items-center pe-2 gap-2" exact to="/">
        <AppIcon class="h-9 w-9" />
        <AppText class="md:hidden lg:inline" />
      </RouterLink>
      <div class="flex justify-between w-full text-center items-center ms-3">
        <div class="items-center hidden md:flex gap-5 ms-5">
          <UButton
            v-for="(item, index) in navItems.filter(
              (item) => (item.visible ?? true) && !item.mobileOnly,
            )"
            :key="index"
            :to="item.to"
            variant="link"
            size="xl"
            color="neutral"
            active-class="underline"
          >
            {{ item.label }}
          </UButton>
          <ThemeSelect />
        </div>

        <!-- Right aligned nav items -->
        <div v-if="!isMobile" class="flex ms-auto">
          <!-- TODO This should show outside of the dropdown in XS mode -->
          <div
            v-if="!settingsStore.confirmDialog"
            class="my-auto me-5 flex text-yellow-300"
            title="Confirm dialog deactivated, Forced exits will be executed immediately. Be careful."
          >
            <i-mdi-run-fast />
            <i-mdi-alert />
          </div>
          <div class="hidden md:flex md:flex-nowrap items-center nav-item me-2">
            <span class="text-sm me-2" title="Bot name">
              {{
                (botStore.activeBotorUndefined && botStore.activeBotorUndefined.botName) ||
                'No bot selected'
              }}
            </span>
            <BotEntry
              :bot="botStore.availableBots[botStore.selectedBot]"
              noButtons
              no-text
              @edit-login="editBotLogin"
            />
            <BotSelect />

            <ReloadControl class="me-3" title="Confirm Dialog deactivated." />
          </div>
          <div v-if="botStore.hasBots" class="flex items-center">
            <!-- Hide dropdown on xs, instead show below  -->
            <UDropdownMenu :items="menuItems" size="lg">
              <UButton color="neutral" variant="ghost" size="sm" trailing-icon="mdi:chevron-down">
                <div class="flex items-center">
                  <UAvatar size="sm"> FT </UAvatar>
                </div>
              </UButton>
            </UDropdownMenu>
          </div>
          <UButton
            v-else-if="route?.path !== '/login'"
            color="neutral"
            @click="loginDialog({})"
            icon="mdi:login"
            >Login
          </UButton>
        </div>

        <!-- Mobile menu -->
        <div v-if="isMobile" class="ms-auto flex">
          <USlideover
            direction="right"
            :close="{
              color: 'primary',
              variant: 'outline',
              class: 'rounded-full',
            }"
          >
            <UButton class="text-neutral-300 text-xl" size="xl" variant="ghost" icon="mdi:menu" />
            <template #title>
              <div class="flex flex-row items-center gap-2">
                <AppIcon class="h-9 w-9" />
                <AppText class="md:hidden lg:inline" />
              </div>
            </template>
            <template #body="{ close }">
              <div class="flex flex-col gap-1 items-center p-4 h-full">
                <UButton
                  v-for="(item, index) in navItems.filter((item) => item.visible ?? true)"
                  :key="index"
                  :to="item.to"
                  class="p-2 justify-center w-full"
                  variant="link"
                  color="neutral"
                  size="xl"
                  active-class="underline font-bold"
                  @click="close()"
                  :label="item.label"
                />
                <USeparator class="my-2" />
                <span>Version: {{ settingsStore.uiVersion }}</span>

                <div class="flex flex-row items-center justify-center">
                  <ThemeSelect show-text />
                </div>
                <USeparator class="my-2" />
                <div class="flex flex-row items-center">
                  <span class="text-sm me-2" title="Bot name">
                    {{
                      (botStore.activeBotorUndefined && botStore.activeBotorUndefined.botName) ||
                      'No bot selected'
                    }}
                  </span>
                  <BotEntry
                    :bot="botStore.availableBots[botStore.selectedBot]"
                    noButtons
                    no-text
                    @edit-login="editBotLogin"
                  />
                </div>
                <BotSelect />
                <USeparator class="my-2" />
                <ReloadControl class="justify-center w-full" />
              </div>
            </template>
          </USlideover>
        </div>
      </div>
    </div>
  </header>
</template>
