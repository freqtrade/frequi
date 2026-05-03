<script setup lang="ts">
import PairlistConfigView from '@/views/PairlistConfigView.vue';
import DownloadDataView from '@/views/DownloadDataView.vue';
import LogView from '@/views/LogView.vue';
import SettingsView from '@/views/SettingsView.vue';

const route = useRoute();
const router = useRouter();

const tabs = [
  { id: 'logs', label: 'Logs', component: LogView },
  { id: 'settings', label: 'Settings', component: SettingsView },
  { id: 'download-data', label: 'Download Data', component: DownloadDataView },
  { id: 'pairlist-config', label: 'Pairlist Config', component: PairlistConfigView },
];

const activeTabId = computed(() => {
  const tab = typeof route.query.tab === 'string' ? route.query.tab : '';
  return tabs.some((item) => item.id === tab) ? tab : 'logs';
});

const activeTab = computed(() => tabs.find((item) => item.id === activeTabId.value) || tabs[0]);

function setActiveTab(tab: string) {
  router.replace({ path: '/more', query: { tab } });
}
</script>

<template>
  <div class="workspace-page">
    <section class="workspace-header">
      <div>
        <div class="workspace-kicker">System Tools</div>
        <h1>Operations</h1>
      </div>
      <nav class="workspace-tabs" aria-label="Operations sections">
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
