<script setup lang="ts">
import Favico from 'favico.js';

import { useRoute } from 'vue-router';
import Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
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

const menuItems = computed<MenuItem[]>(() => [
  {
    label: `V: ${settingsStore.uiVersion}`,
    disabled: true,
  },
  {
    label: 'Settings',
    icon: 'i-mdi-cog',
    command: () => router.push('/settings'),
  },
  {
    label: 'Lock dynamic Layout',
    checkbox: true,
    checked: layoutStore.layoutLocked,
    command: () => {
      layoutStore.layoutLocked = !layoutStore.layoutLocked;
    },
  },
  {
    label: 'Reset Layout',
    icon: 'i-mdi-lock-reset',
    command: resetDynamicLayout,
  },
  {
    label: 'Logout',
    icon: 'i-mdi-logout',
    command: clickLogout,
    visible: botStore.hasBots && botStore.botCount === 1,
  },
]);
const menu = ref<InstanceType<typeof Menu> | null>();
function toggleMenu(event) {
  menu.value?.toggle(event);
}
const drawerVisible = ref(false);
</script>

<template>
  <header
    class="sticky top-0 z-50 transition-all duration-300 backdrop-blur-md bg-white/80 dark:bg-surface-950/80 border-b border-surface-200 dark:border-surface-800 shadow-sm"
  >
    <div class="flex px-4 py-3 sm:px-6 lg:px-8 max-w-screen-3xl mx-auto">
      <RouterLink
        class="flex flex-row items-center pe-4 gap-3 transition-transform hover:-translate-y-0.5 duration-200"
        exact
        to="/"
      >
        <img
          class="h-[32px] w-auto align-middle drop-shadow-md"
          src="@/assets/freqtrade-logo.png"
          alt="Home Logo"
        />
        <span
          class="text-surface-900 dark:text-surface-50 font-bold text-xl md:hidden lg:inline tracking-tight"
          >Freqtrade<span class="text-primary-500">UI</span></span
        >
      </RouterLink>

      <div class="flex flex-1 justify-between w-full items-center ms-4">
        <div class="items-center hidden md:flex gap-2 lg:gap-4">
          <RouterLink
            v-for="(item, index) in navItems.filter(
              (item) => (item.visible ?? true) && !item.mobileOnly,
            )"
            :key="index"
            :to="item.to"
            class="text-surface-600 dark:text-surface-300 font-medium flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-primary-600 dark:hover:text-primary-400"
            active-class="bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-semibold"
          >
            {{ item.label }}
          </RouterLink>
          <ThemeSelect class="ms-2" />
        </div>

        <!-- Right aligned nav items -->
        <div v-if="!isMobile" class="flex items-center gap-3 ms-auto">
          <!-- TODO This should show outside of the dropdown in XS mode -->
          <div
            v-if="!settingsStore.confirmDialog"
            class="my-auto flex text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1.5 rounded-md transition-colors"
            title="Confirm dialog deactivated, Forced exits will be executed immediately. Be careful."
          >
            <i-mdi-run-fast class="text-lg" />
            <i-mdi-alert class="text-lg ms-1" />
          </div>
          <div class="flex items-center gap-2">
            <Select
              v-if="botStore.botCount > 1"
              :model-value="botStore.selectedBotObj"
              size="small"
              class="w-48 !rounded-lg border-surface-200 dark:border-surface-700 hover:border-primary-500 transition-colors"
              no-caret
              severity="info"
              toggle-class="flex items-center "
              menu-class="my-0 py-0"
              :options="botStore.availableBotsSorted"
              @update:model-value="botStore.selectBot($event.botId)"
            >
              <template #value="{ value }">
                <BotEntry :bot="value" :no-buttons="true" />
              </template>

              <template #option="{ option }">
                <BotEntry :bot="option" :no-buttons="true" />
              </template>
            </Select>
            <ReloadControl title="Confirm Dialog deactivated." />
          </div>
          <div
            class="hidden lg:flex items-center text-surface-600 dark:text-surface-300 bg-surface-100 dark:bg-surface-800/50 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700"
          >
            <span class="text-sm font-medium me-2 truncate max-w-[150px]">
              {{
                (botStore.activeBotorUndefined && botStore.activeBotorUndefined.botName) ||
                'No bot selected'
              }}
            </span>
            <span v-if="botStore.botCount === 1" class="flex items-center gap-1.5">
              <span
                class="w-2 h-2 rounded-full"
                :class="
                  botStore.activeBotorUndefined && botStore.activeBotorUndefined.isBotOnline
                    ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                    : 'bg-red-500'
                "
              ></span>
              <span class="text-xs font-semibold uppercase tracking-wider relative top-[0.5px]">
                {{
                  botStore.activeBotorUndefined && botStore.activeBotorUndefined.isBotOnline
                    ? 'Online'
                    : 'Offline'
                }}
              </span>
            </span>
          </div>
          <div v-if="botStore.hasBots" class="flex items-center ms-1">
            <!-- Hide dropdown on xs, instead show below  -->
            <Button
              severity="secondary"
              variant="text"
              class="!px-2 !py-1 !rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              @click="toggleMenu"
            >
              <div class="flex items-center gap-2">
                <Avatar
                  shape="circle"
                  class="bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 font-bold border border-primary-200 dark:border-primary-800"
                  size="small"
                >
                  <!-- <Avatar label="FT" shape="circle"></Avatar> -->
                  FT
                </Avatar>
                <i-mdi-chevron-down class="text-surface-500" />
              </div>
            </Button>
            <Menu ref="menu" :model="menuItems" popup class="w-56">
              <template #item="{ item }">
                <div
                  class="flex flex-row items-center gap-2 p-1"
                  :class="{
                    'cursor-pointer': !item.disabled,
                  }"
                >
                  <i-mdi-cog v-if="item.icon === 'i-mdi-cog'" />
                  <i-mdi-logout v-if="item.icon === 'i-mdi-logout'" />
                  <i-mdi-lock-reset v-if="item.icon === 'i-mdi-lock-reset'" />
                  <BaseCheckbox v-if="item.checkbox" v-model="item.checked" />
                  <span>{{ item.label }}</span>
                </div>
              </template>
            </Menu>
          </div>
          <div v-else>
            <!-- should open Modal window! -->
            <LoginModal v-if="route?.path !== '/login'" />
          </div>
        </div>

        <!-- Mobile menu -->
        <div v-if="isMobile" class="ms-auto flex">
          <Button
            class="text-surface-700 dark:text-surface-300 text-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors !p-2 !rounded-lg"
            variant="text"
            @click="drawerVisible = !drawerVisible"
          >
            <template #icon>
              <i-mdi-menu />
            </template>
          </Button>
          <Drawer
            v-model:visible="drawerVisible"
            header="Drawer"
            position="right"
            class="bg-surface-50/95 dark:bg-surface-950/95 backdrop-blur-xl border-l border-surface-200 dark:border-surface-800 shadow-2xl"
          >
            <template #container>
              <div
                class="flex flex-row items-center p-4 border-b border-surface-200 dark:border-surface-800"
              >
                <h3
                  class="text-xl font-extrabold w-full text-center text-surface-900 dark:text-surface-50 tracking-tight"
                >
                  Freqtrade<span class="text-primary-500">UI</span>
                </h3>
                <Button
                  class="absolute right-3 top-3 !p-2 !rounded-lg text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
                  variant="text"
                  @click="drawerVisible = !drawerVisible"
                >
                  <template #icon>
                    <i-mdi-close class="text-xl" />
                  </template>
                </Button>
              </div>
              <div class="flex flex-col gap-2 relative p-4 mt-2">
                <RouterLink
                  v-for="(item, index) in navItems.filter((item) => item.visible ?? true)"
                  :key="index"
                  :to="item.to"
                  class="text-surface-700 dark:text-surface-300 font-medium px-4 py-3 rounded-xl transition-colors hover:bg-surface-100 dark:hover:bg-surface-800 flex items-center"
                  active-class="bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-semibold"
                >
                  {{ item.label }}
                </RouterLink>
                <Divider class="my-4 opacity-50" />
                <span class="text-surface-500 dark:text-surface-400 text-center text-sm font-medium"
                  >Version: {{ settingsStore.uiVersion }}</span
                >

                <div
                  class="flex flex-row items-center justify-center mt-4 bg-surface-100 dark:bg-surface-800/50 p-2 rounded-xl"
                >
                  <ThemeSelect show-text />
                </div>
                <Select
                  v-if="botStore.botCount > 1"
                  :model-value="botStore.selectedBotObj"
                  size="small"
                  class="mt-4 w-full !rounded-xl border-surface-200 dark:border-surface-700"
                  no-caret
                  severity="info"
                  toggle-class="flex items-center justify-between px-3"
                  menu-class="my-0 py-0"
                  :options="botStore.availableBotsSorted"
                  @update:model-value="botStore.selectBot($event.botId)"
                >
                  <template #value="{ value }">
                    <BotEntry :bot="value" :no-buttons="true" />
                  </template>

                  <template #option="{ option }">
                    <BotEntry :bot="option" :no-buttons="true" />
                  </template>
                </Select>
                <ReloadControl
                  class="justify-center w-full mt-4 !rounded-xl"
                  title="Confirm Dialog deactivated."
                />
              </div>
            </template>
          </Drawer>
        </div>
      </div>
    </div>
  </header>
</template>
