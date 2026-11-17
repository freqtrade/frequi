<script setup lang="ts">
const botStore = useBotStore();

interface TabItem {
  label: string;
  to: string;
  icon: string;
}

// Only visible on xs (phone) viewport. Bots that can run backtests use a different set of tabs.
const tabs = computed<TabItem[]>(() =>
  botStore.canRunBacktest
    ? [
        { label: 'Backtest', to: '/backtest', icon: 'mdi:flask-outline' },
        { label: 'Chart', to: '/graph', icon: 'mdi:chart-line' },
        { label: 'Logs', to: '/logs', icon: 'mdi:format-list-bulleted' },
      ]
    : [
        { label: 'Trades', to: '/open_trades', icon: 'mdi:folder-open' },
        { label: 'History', to: '/trade_history', icon: 'mdi:folder-lock' },
        { label: 'Pairlist', to: '/pairlist', icon: 'mdi:format-list-group' },
        { label: 'Balance', to: '/balance', icon: 'mdi:bank' },
        { label: 'Dashboard', to: '/dashboard', icon: 'mdi:view-dashboard-outline' },
      ],
);
</script>

<template>
  <footer class="md:hidden px-3 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
    <nav class="glass-strong flex items-stretch justify-between gap-1 rounded-2xl p-1">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        custom
        v-slot="{ href, navigate, isActive }"
      >
        <a
          :href="href"
          class="flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors"
          :class="
            isActive
              ? 'bg-primary/15 text-primary accent-glow'
              : 'text-muted hover:text-default hover:bg-white/5'
          "
          :aria-current="isActive ? 'page' : undefined"
          @click="navigate"
        >
          <UIcon :name="tab.icon" class="size-5" />
          <span>{{ tab.label }}</span>
        </a>
      </RouterLink>
    </nav>
  </footer>
</template>
