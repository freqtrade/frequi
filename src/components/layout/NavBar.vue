<script setup lang="ts">
import Favico from 'favico.js';

import { useRoute } from 'vue-router';
import type { DropdownMenuItem } from '@nuxt/ui';
import { breakpointsTailwind } from '@vueuse/core';

const botStore = useBotStore();

const settingsStore = useSettingsStore();
const layoutStore = useLayoutStore();
const route = useRoute();
const router = useRouter();
const favicon = ref<Favico | undefined>(undefined);
const pingInterval = ref<number>();

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
const drawerVisible = ref(false);
</script>

<template>
  <header>
    <div class="flex bg-primary-500 border-b border-primary">
      <RouterLink class="ms-2 flex flex-row items-center pe-2 gap-2" exact to="/">
        <img class="h-[30px] align-middle" src="@/assets/freqtrade-logo.png" alt="Home Logo" />
        <span class="text-slate-200 text-xl md:hidden lg:inline text-nowrap">Freqtrade UI</span>
      </RouterLink>
      <div class="flex justify-between w-full text-center items-center ms-3">
        <div class="items-center hidden md:flex gap-5 ms-5">
          <RouterLink
            v-for="(item, index) in navItems.filter(
              (item) => (item.visible ?? true) && !item.mobileOnly,
            )"
            :key="index"
            :to="item.to"
            class="text-neutral-200 flex items-center gap-2"
            active-class="underline"
          >
            {{ item.label }}
          </RouterLink>
          <ThemeSelect class="text-neutral-200" />
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
          <div
            class="hidden md:flex md:flex-wrap lg:flex-nowrap items-center nav-item text-neutral-300 me-2"
          >
            <span class="text-sm me-2">
              {{
                (botStore.activeBotorUndefined && botStore.activeBotorUndefined.botName) ||
                'No bot selected'
              }}
            </span>
            <span
              v-if="
                botStore.botCount === 1 &&
                botStore.activeBotorUndefined &&
                botStore.activeBotorUndefined.isBotOnline
              "
              class="text-sm flex items-center"
            >
              <UIcon name="mdi:circle" class="text-green-500 me-1" />
              Online
            </span>
            <span v-else-if="botStore.botCount === 1" class="text-sm flex items-center">
              <UIcon name="mdi:circle" class="text-red-500 me-1" />
              Offline
            </span>
          </div>
          <div class="flex justify-between">
            <USelectMenu
              v-if="botStore.botCount > 1"
              :model-value="botStore.selectedBot"
              label-key="botName"
              value-key="botId"
              class="m-1 min-w-36"
              :items="botStore.availableBotsSorted"
              @update:model-value="botStore.selectBot($event)"
            />

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
          <div v-else>
            <!-- should open Modal window! -->
            <LoginModal v-if="route?.path !== '/login'" />
          </div>
        </div>

        <!-- Mobile menu -->
        <div v-if="isMobile" class="ms-auto flex">
          <USlideover
            v-model:open="drawerVisible"
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
                <img class="h-8 align-middle" src="@/assets/freqtrade-logo.png" alt="Home Logo" />
                <h3 class="text-xl font-bold w-full text-center">Freqtrade UI</h3>
              </div>
            </template>
            <template #body>
              <div class="flex flex-col gap-1 items-center p-4 h-full">
                <RouterLink
                  v-for="(item, index) in navItems.filter((item) => item.visible ?? true)"
                  :key="index"
                  :to="item.to"
                  class="p-2"
                  active-class="underline"
                  @click="drawerVisible = false"
                >
                  {{ item.label }}
                </RouterLink>
                <USeparator class="my-2" />
                <span>Version: {{ settingsStore.uiVersion }}</span>

                <div class="flex flex-row items-center justify-center">
                  <ThemeSelect show-text />
                </div>
                <USelectMenu
                  v-if="botStore.botCount > 1"
                  :model-value="botStore.selectedBot"
                  label-key="botName"
                  value-key="botId"
                  size="sm"
                  class="m-1 min-w-36"
                  :items="botStore.availableBotsSorted"
                  @update:model-value="botStore.selectBot($event)"
                />
                <ReloadControl class="justify-center w-full" title="Confirm Dialog deactivated." />
              </div>
            </template>
          </USlideover>
        </div>
      </div>
    </div>
  </header>
</template>
