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
            class="text-surface-200 flex items-center gap-2"
            active-class="underline"
          >
            {{ item.label }}
          </RouterLink>
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
          <div class="flex justify-between">
            <Select
              v-if="botStore.botCount > 1"
              :model-value="botStore.selectedBotObj"
              size="small"
              class="m-1"
              no-caret
              severity="info"
              toggle-class="flex align-items-center "
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
            <ReloadControl class="me-3" title="Confirm Dialog deactivated." />
          </div>
          <div
            class="hidden md:flex md:flex-wrap lg:flex-nowrap items-center nav-item text-surface-300 me-2"
          >
            <span class="text-sm me-2">
              {{
                (botStore.activeBotorUndefined && botStore.activeBotorUndefined.botName) ||
                'No bot selected'
              }}
            </span>
            <span v-if="botStore.botCount === 1">
              {{
                botStore.activeBotorUndefined && botStore.activeBotorUndefined.isBotOnline
                  ? 'Online'
                  : 'Offline'
              }}
            </span>
          </div>
          <div v-if="botStore.hasBots" class="flex items-center">
            <!-- Hide dropdown on xs, instead show below  -->
            <Button severity="contrast" variant="text" size="small" @click="toggleMenu">
              <div class="flex items-center">
                <Avatar shape="circle" severity="contrast">
                  <!-- <Avatar label="FT" shape="circle"></Avatar> -->
                  FT
                </Avatar>
                <i-mdi-chevron-down />
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
            class="text-surface-300 text-xl"
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
            class="bg-primary-500"
          >
            <template #container>
              <div class="flex flex-row items-center">
                <h3 class="text-xl font-bold w-full text-center text-surface-200">Freqtrade UI</h3>
                <Button
                  class="float-right mt-1 me-1"
                  variant="outlined"
                  @click="drawerVisible = !drawerVisible"
                >
                  <template #icon>
                    <i-mdi-close />
                  </template>
                </Button>
              </div>
              <div class="flex flex-col gap-1 items-center mt-4">
                <RouterLink
                  v-for="(item, index) in navItems.filter((item) => item.visible ?? true)"
                  :key="index"
                  :to="item.to"
                  class="text-surface-200 p-2"
                  active-class="underline"
                >
                  {{ item.label }}
                </RouterLink>
                <Divider />
                <span class="text-surface-200 text-center"
                  >Version: {{ settingsStore.uiVersion }}</span
                >

                <div class="flex flex-row items-center justify-center">
                  <ThemeSelect show-text />
                </div>
                <Select
                  v-if="botStore.botCount > 1"
                  :model-value="botStore.selectedBotObj"
                  size="small"
                  class="m-1"
                  no-caret
                  severity="info"
                  toggle-class="flex align-items-center "
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
                <ReloadControl class="justify-center w-full" title="Confirm Dialog deactivated." />
              </div>
            </template>
          </Drawer>
        </div>
      </div>
    </div>
  </header>
</template>
