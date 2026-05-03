<script setup lang="ts">
import BacktestingView from '@/views/BacktestingView.vue';
import BacktestRunner from '@/views/BacktestRunner.vue';

const route = useRoute();
const router = useRouter();

const tabs = [
  { id: 'runner', label: 'Runner', component: BacktestRunner },
  { id: 'results', label: 'Results', component: BacktestingView },
];

const activeTabId = computed(() => {
  const tab = typeof route.query.tab === 'string' ? route.query.tab : '';
  return tabs.some((item) => item.id === tab) ? tab : 'runner';
});

const activeTab = computed(() => tabs.find((item) => item.id === activeTabId.value) || tabs[0]);

function setActiveTab(tab: string) {
  router.replace({ path: '/backtest', query: { tab } });
}
</script>

<template>
  <div class="workspace-page">
    <section class="workspace-header">
      <div>
        <div class="workspace-kicker">Strategy Validation</div>
        <h1>Backtest Workspace</h1>
      </div>
      <nav class="workspace-tabs" aria-label="Backtest sections">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="workspace-tab"
          :class="{ active: activeTabId === tab.id }"
          @click="setActiveTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </nav>
    </section>

    <section class="workspace-body">
      <component :is="activeTab.component" />
    </section>
  </div>
</template>

<style scoped>
@import './workspace.css';
</style>
