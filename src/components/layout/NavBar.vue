<script setup lang="ts">
import Favico from 'favico.js';

import { OpenTradeVizOptions, useSettingsStore } from '@/stores/settings';
import { useLayoutStore } from '@/stores/layout';
import { useBotStore } from '@/stores/ftbotwrapper';
import { useRoute } from 'vue-router';
import Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';

const botStore = useBotStore();

const settingsStore = useSettingsStore();
const layoutStore = useLayoutStore();
const route = useRoute();
const router = useRouter();
const favicon = ref<Favico | undefined>(undefined);
const pingInterval = ref<number>();

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

const menuItems = ref<MenuItem[]>([
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
    checked: computed(() => layoutStore.layoutLocked),
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
</script>

<template>
  <header>
    <div class="flex bg-primary2 bg-black border-b border-primary">
      <RouterLink class="flex flex-row items-center pe-2 gap-2" exact to="/">
        <img class="logo" src="@/assets/freqtrade-logo.png" alt="Home Logo" />
        <span class="text-slate-200 text-lg hidden lg:inline text-nowrap">Freqtrade UI</span>
      </RouterLink>

      <div id="nav-collapse" class="flex justify-between w-full text-center items-center" is-nav>
        <div class="items-center hidden md:flex">
          <Button
            v-if="!botStore.canRunBacktest"
            label="Trade"
            size="small"
            variant="link"
            as="router-link"
            to="/trade"
          ></Button>
          <Button
            v-if="!botStore.canRunBacktest"
            label="Dashboard"
            as="router-link"
            size="small"
            variant="link"
            to="/dashboard"
          ></Button>
          <Button label="Chart" as="router-link" variant="link" to="/graph" size="small"></Button>
          <Button
            severity="danger"
            label="Logs"
            as="router-link"
            variant="link"
            to="/logs"
            size="small"
          ></Button>
          <Button
            v-if="botStore.canRunBacktest"
            label="Backtest"
            size="small"
            as="router-link"
            variant="link"
            to="/backtest"
          ></Button>
          <Button
            v-if="botStore.isWebserverMode && botStore.activeBot.botApiVersion >= 2.41"
            size="small"
            as="router-link"
            variant="link"
            to="/download_data"
            >Download Data</Button
          >
          <Button
            v-if="
              (botStore.activeBot?.isWebserverMode ?? false) &&
              botStore.activeBot.botApiVersion >= 2.3
            "
            size="small"
            as="router-link"
            variant="link"
            label="Pairlist Config"
            to="/pairlist_config"
          ></Button>
          <ThemeSelect />
        </div>

        <!-- Right aligned nav items -->
        <div class="flex ms-auto">
          <!-- TODO This should show outside of the dropdown in XS mode -->
          <div
            v-if="!settingsStore.confirmDialog"
            class="my-auto me-5"
            title="Confirm dialog deactivated, Forced exits will be executed immediately. Be careful."
            style="color: yellow"
          >
            <i-mdi-run-fast />
            <i-mdi-alert />
          </div>
          <div class="flex justify-between">
            <Select
              v-if="botStore.botCount > 1"
              size="small"
              class="m-1"
              no-caret
              severity="info"
              toggle-class="flex align-items-center "
              menu-class="my-0 py-0"
            >
              <template #value>
                <BotEntry :bot="botStore.selectedBotObj" :no-buttons="true" />
              </template>
              <template #option>
                <BotList :small="true" />
              </template>
            </Select>
            <ReloadControl class="me-3" title="Confirm Dialog deactivated." />
          </div>
          <div
            class="hidden md:flex md:flex-wrap lg:flex-nowrap items-center nav-item text-surface-300 me-2"
          >
            <span class="text-xs me-2">
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
            <Button severity="secondary" rounded @click="toggleMenu">
              <!-- <Avatar label="FT" shape="circle"></Avatar> -->
              FT
              <i-mdi-chevron-down />
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
                  <Checkbox v-if="item.checkbox" v-model="item.checked" binary />
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
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.logo {
  vertical-align: middle;
  height: 30px;
}

.dropdown-toggle::after {
  display: none;
}

.navbar-brand-title {
  padding-left: 0.5em;
}
.navbar {
  padding: 0.2rem 0rem;
}
.nav-link {
  padding: 0rem;
}
</style>
