<script setup lang="ts">
import RegimeDetector from '@/components/RegimeDetector.vue';
import SignalConfidence from '@/components/SignalConfidence.vue';
import TQIRegimeMetrics from '@/components/TQIRegimeMetrics.vue';
import LearningLoop from '@/views/LearningLoop.vue';

const route = useRoute();
const router = useRouter();

const tabs = [
  { id: 'regime-signals', label: 'Regime + Signals' },
  { id: 'trend-quality', label: 'Trend Quality', component: TQIRegimeMetrics },
  { id: 'learning', label: 'Learning', component: LearningLoop },
];

const activeTabId = computed(() => {
  const tab = typeof route.query.tab === 'string' ? route.query.tab : '';
  return tabs.some((item) => item.id === tab) ? tab : 'regime-signals';
});

const activeTab = computed(() => tabs.find((item) => item.id === activeTabId.value) || tabs[0]);

function setActiveTab(tab: string) {
  router.replace({ path: '/intelligence', query: { tab } });
}
</script>

<template>
  <div class="workspace-page">
    <section class="workspace-header">
      <div>
        <div class="workspace-kicker">Trading Intelligence</div>
        <h1>Signal Intelligence</h1>
      </div>
      <nav class="workspace-tabs" aria-label="Intelligence sections">
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
      <div v-if="activeTabId === 'regime-signals'" class="stacked-intelligence">
        <RegimeDetector />
        <SignalConfidence />
      </div>
      <component :is="activeTab.component" v-else-if="activeTab.component" />
    </section>
  </div>
</template>

<style scoped>
.workspace-page {
  display: flex;
  min-height: 100%;
  min-width: 0;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  background: #020617;
}

.workspace-header,
.workspace-body {
  min-width: 0;
  border: 1px solid rgba(51, 65, 85, 0.82);
  border-radius: 12px;
  background: rgba(8, 13, 23, 0.96);
}

.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
}

.workspace-kicker {
  color: var(--p-primary-300);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 2px 0 0;
  color: var(--p-surface-50);
  font-size: clamp(1.15rem, 2vw, 1.65rem);
  font-weight: 760;
}

.workspace-tabs {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.workspace-tab {
  min-height: 34px;
  border: 1px solid rgba(71, 85, 105, 0.78);
  border-radius: 8px;
  padding: 0 12px;
  background: rgba(15, 23, 42, 0.86);
  color: var(--p-surface-300);
  font-size: 0.82rem;
  font-weight: 720;
  cursor: pointer;
  white-space: nowrap;
}

.workspace-tab:hover,
.workspace-tab.active {
  border-color: rgba(46, 224, 255, 0.66);
  background: rgba(0, 137, 161, 0.18);
  color: var(--p-primary-100);
}

.workspace-body {
  overflow: hidden;
}

.workspace-body :deep(> *) {
  min-height: 0;
}

.stacked-intelligence {
  display: grid;
  min-width: 0;
  gap: 14px;
  padding: 14px;
}

@media (max-width: 767px) {
  .workspace-page {
    gap: 10px;
    padding: 8px;
  }

  .workspace-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .workspace-tabs {
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 2px;
  }

  .workspace-tab {
    flex: 0 0 auto;
  }

  .stacked-intelligence {
    gap: 10px;
    padding: 8px;
  }
}
</style>
