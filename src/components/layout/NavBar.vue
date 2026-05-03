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

const isCompactNav = breakpoints.smaller('xl');

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
    label: 'Dashboard',
    to: '/dashboard',
    visible: true,
    icon: 'i-mdi-view-dashboard',
  },
  {
    label: 'Trade',
    to: '/trade',
    visible: true,
    icon: 'i-mdi-currency-usd',
  },
  {
    label: 'Intelligence',
    to: '/intelligence',
    visible: true,
    icon: 'i-mdi-chart-bell-curve',
  },
  {
    label: 'Markets',
    to: '/markets',
    visible: true,
    icon: 'i-mdi-chart-timeline-variant',
  },
  {
    label: 'Risk',
    to: '/risk',
    visible: true,
    icon: 'i-mdi-shield-alert',
  },
  {
    label: 'Backtest',
    to: '/backtest',
    visible: true,
    icon: 'i-mdi-play-circle',
  },
  {
    label: 'More',
    to: '/more',
    icon: 'i-mdi-dots-horizontal',
  },
]);

const activePageTitle = computed(() => {
  const currentPath = route?.path;
  const navItem = navItems.value.find((item) => item.to === currentPath);
  if (navItem?.label) return navItem.label;
  return typeof route.name === 'string' ? route.name.replace(/^Freqtrade\s+/, '') : 'Freqtrade UI';
});

const menuItems = computed<MenuItem[]>(() => [
  {
    label: `V: ${settingsStore.uiVersion}`,
    disabled: true,
  },
  {
    label: 'Settings',
    icon: 'i-mdi-cog',
    command: () => router.push({ path: '/more', query: { tab: 'settings' } }),
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
  <header class="z-30 shrink-0 border-b border-surface-800/90 bg-[#0b111a]/95 text-surface-100 shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur">
    <div class="flex min-h-13 items-center px-2 sm:px-3">
      <RouterLink class="flex min-w-0 flex-row items-center pe-2 gap-2" exact to="/">
        <img class="h-8 w-8 shrink-0 align-middle" src="@/assets/freqtrade-logo.png" alt="Home Logo" />
        <span class="hidden xl:inline text-nowrap text-base font-semibold tracking-wide text-surface-100">Freqtrade UI</span>
      </RouterLink>
      <div
        v-if="isCompactNav"
        class="min-w-0 flex-1 text-left text-sm sm:text-base text-surface-100 font-semibold tracking-wide truncate"
        aria-live="polite"
      >
        {{ activePageTitle }}
      </div>
      <div
        class="flex min-w-0 justify-between items-center"
        :class="isCompactNav ? 'w-auto' : 'w-full ms-3'"
      >
        <nav class="items-center hidden xl:flex gap-1 ms-3 min-w-0" aria-label="Primary navigation">
          <RouterLink
            v-for="(item, index) in navItems.filter(
              (item) => (item.visible ?? true) && !item.mobileOnly,
            )"
            :key="index"
            :to="item.to"
            class="rounded-md px-2.5 py-1.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-50"
            active-class="bg-surface-800 text-primary-200"
          >
            {{ item.label }}
          </RouterLink>
          <ThemeSelect />
        </nav>

        <!-- Right aligned nav items -->
        <div v-if="!isCompactNav" class="flex ms-auto items-center">
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
            class="hidden xl:flex items-center nav-item text-surface-300 me-2"
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
        <div v-if="isCompactNav" class="ms-auto flex items-center gap-1">
          <div class="flex items-center gap-1">
            <ReloadControl class="me-1" title="Confirm Dialog deactivated." />
            <Button
              v-if="botStore.hasBots"
              severity="contrast"
              variant="text"
              size="small"
              @click="toggleMenu"
            >
              <div class="flex items-center">
                <Avatar shape="circle" severity="contrast"> FT </Avatar>
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
            <LoginModal v-if="!botStore.hasBots && route?.path !== '/login'" />
          </div>
          <Button
            class="text-surface-200 text-xl"
            variant="text"
            @click="drawerVisible = !drawerVisible"
          >
            <template #icon>
              <i-mdi-menu />
            </template>
          </Button>
          <Drawer
            v-model:visible="drawerVisible"
            header="Navigation"
            position="right"
            class="ft-nav-drawer"
          >
            <template #container>
              <div class="flex flex-row items-center border-b border-surface-800 px-4 py-3">
                <h3 class="text-base font-semibold w-full text-left text-surface-100">Freqtrade UI</h3>
                <Button
                  class="shrink-0"
                  variant="text"
                  @click="drawerVisible = !drawerVisible"
                >
                  <template #icon>
                    <i-mdi-close />
                  </template>
                </Button>
              </div>
              <div class="flex flex-col gap-1 px-3 py-4">
                <RouterLink
                  v-for="(item, index) in navItems.filter((item) => item.visible ?? true)"
                  :key="index"
                  :to="item.to"
                  class="rounded-md px-3 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-50"
                  active-class="bg-surface-800 text-primary-200"
                  @click="drawerVisible = false"
                >
                  {{ item.label }}
                </RouterLink>
                <Divider class="my-2" />
                <span class="px-3 text-xs uppercase tracking-[0.18em] text-surface-500"
                  >Version: {{ settingsStore.uiVersion }}</span
                >

                <div class="flex flex-row items-center px-3 py-2">
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
