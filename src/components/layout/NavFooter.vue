<script setup lang="ts">
const botStore = useBotStore();
</script>

<template>
  <footer
    class="md:hidden sticky bottom-0 z-50 bg-surface-50/90 dark:bg-surface-950/90 backdrop-blur-xl border-t border-surface-200 dark:border-surface-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe-bottom"
  >
    <div class="flex gap-0.5 justify-around px-1 py-1">
      <Button
        v-if="!botStore.canRunBacktest"
        icon-pos="top"
        variant="text"
        size="small"
        as="router-link"
        class="flex-1 flex flex-col items-center !p-1 !rounded-xl text-surface-800 dark:text-surface-300 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all font-medium text-[10px]"
        active-class="text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
        to="/open_trades"
        label="Trades"
      >
        <template #icon>
          <i-mdi-folder-open class="text-xl mb-0.5" />
        </template>
      </Button>
      <Button
        v-if="!botStore.canRunBacktest"
        icon-pos="top"
        variant="text"
        size="small"
        as="router-link"
        class="flex-1 flex flex-col items-center !p-1 !rounded-xl text-surface-800 dark:text-surface-300 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all font-medium text-[10px]"
        active-class="text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
        to="/trade_history"
        label="History"
      >
        <template #icon>
          <i-mdi-folder-lock class="text-xl mb-0.5" />
        </template>
      </Button>
      <Button
        v-if="!botStore.canRunBacktest"
        icon-pos="top"
        variant="text"
        size="small"
        as="router-link"
        class="flex-1 flex flex-col items-center !p-1 !rounded-xl text-surface-800 dark:text-surface-300 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all font-medium text-[10px]"
        active-class="text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
        to="/pairlist"
        label="Pairlist"
      >
        <template #icon>
          <i-mdi-view-list class="text-xl mb-0.5" />
        </template>
      </Button>
      <Button
        v-if="!botStore.canRunBacktest"
        icon-pos="top"
        variant="text"
        size="small"
        as="router-link"
        class="flex-1 flex flex-col items-center !p-1 !rounded-xl text-surface-800 dark:text-surface-300 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all font-medium text-[10px]"
        active-class="text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
        to="/balance"
        label="Balance"
      >
        <template #icon>
          <i-mdi-bank class="text-xl mb-0.5" />
        </template>
      </Button>
      <Button
        v-if="!botStore.canRunBacktest"
        icon-pos="top"
        variant="text"
        size="small"
        as="router-link"
        class="flex-1 flex flex-col items-center !p-1 !rounded-xl text-surface-800 dark:text-surface-300 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all font-medium text-[10px]"
        active-class="text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
        to="/dashboard"
        label="Dashboard"
      >
        <template #icon>
          <i-mdi-view-dashboard-outline class="text-xl mb-0.5" />
        </template>
      </Button>
    </div>
  </footer>
</template>
