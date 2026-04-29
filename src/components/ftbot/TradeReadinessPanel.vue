<script setup lang="ts">
interface SetupRow {
  pair: string;
  side: 'LONG' | 'SHORT';
  progress: string;
  progress_value: number | null;
  status: string;
  result: string;
  signal?: Record<string, any> | null;
  blocked?: Record<string, any> | null;
  open_trade?: Record<string, any> | null;
  closed_trade?: Record<string, any> | null;
}

const API_BASE = 'http://localhost:5001';

const setupRows = ref<SetupRow[]>([]);
const topSetup = ref<SetupRow | null>(null);
const isLoading = ref(false);
const fetchError = ref('');
const expandedPair = ref<string | null>(null);

let pollInterval: number | undefined;

function statusClass(status: string): string {
  if (status.startsWith('Waiting:')) {
    return 'text-orange-600';
  }
  if (status === 'Entered') {
    return 'text-green-600';
  }
  if (status.includes('ATR') || status.includes('Volume') || status.includes('Range')) {
    return 'text-yellow-600';
  }
  return 'text-surface-900 dark:text-surface-100';
}

function resultClass(result: string): string {
  if (!result) {
    return 'text-surface-900 dark:text-surface-100';
  }
  if (result.startsWith('Open ')) {
    return 'text-green-600';
  }
  if (result.includes('+')) {
    return 'text-blue-600';
  }
  if (result.includes('-')) {
    return 'text-red-600';
  }
  return 'text-surface-900 dark:text-surface-100';
}

function toggleExpanded(pair: string) {
  expandedPair.value = expandedPair.value === pair ? null : pair;
}

async function fetchSetups() {
  isLoading.value = true;
  fetchError.value = '';

  try {
    const res = await fetch(`${API_BASE}/api/v1/setups`);
    if (!res.ok) {
      throw new Error(`Failed with status ${res.status}`);
    }

    const data = await res.json();
    setupRows.value = Array.isArray(data?.rows) ? data.rows : [];
    topSetup.value = data?.top_setup ?? null;
  } catch (error) {
    fetchError.value = error instanceof Error ? error.message : 'Failed to fetch setups';
    console.error('TradeReadinessPanel fetch failed', error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchSetups();
  pollInterval = window.setInterval(fetchSetups, 3000);
});

onBeforeUnmount(() => {
  if (pollInterval) {
    window.clearInterval(pollInterval);
  }
});
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      v-if="topSetup"
      class="rounded border border-surface-300 dark:border-surface-700 px-3 py-2 bg-surface-50 dark:bg-surface-900"
    >
      <div class="text-xs uppercase tracking-wide text-surface-500 dark:text-surface-400">
        Top Setup
      </div>
      <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span class="font-semibold">{{ topSetup.pair }}</span>
        <span>{{ topSetup.side }}</span>
        <span>{{ topSetup.progress }}</span>
        <span :class="statusClass(topSetup.status)">{{ topSetup.status }}</span>
        <span v-if="topSetup.result" :class="resultClass(topSetup.result)">{{
          topSetup.result
        }}</span>
      </div>
    </div>

    <div
      class="rounded border border-surface-300 dark:border-surface-700 overflow-hidden bg-white dark:bg-surface-950"
    >
      <div
        class="px-3 py-2 border-b border-surface-300 dark:border-surface-700 flex items-center justify-between"
      >
        <div class="font-semibold">v15 Long/Short Readiness</div>
        <div class="text-xs text-surface-500 dark:text-surface-400">Click a row to expand</div>
      </div>

      <div v-if="fetchError" class="px-3 py-2 text-sm text-red-600">
        {{ fetchError }}
      </div>

      <div
        v-else-if="isLoading && setupRows.length === 0"
        class="px-3 py-2 text-sm text-surface-500 dark:text-surface-400"
      >
        Loading setups...
      </div>

      <div
        v-else-if="setupRows.length === 0"
        class="px-3 py-2 text-sm text-surface-500 dark:text-surface-400"
      >
        No active setups or recent trade outcomes yet.
      </div>

      <table v-else class="w-full text-sm">
        <thead class="bg-surface-100 dark:bg-surface-900">
          <tr class="text-left">
            <th class="px-3 py-2 font-semibold">Pair</th>
            <th class="px-3 py-2 font-semibold">Side</th>
            <th class="px-3 py-2 font-semibold">Progress</th>
            <th class="px-3 py-2 font-semibold">Status</th>
            <th class="px-3 py-2 font-semibold">Result</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="row in setupRows" :key="row.pair">
            <tr
              class="border-t border-surface-200 dark:border-surface-800 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-900"
              @click="toggleExpanded(row.pair)"
            >
              <td class="px-3 py-2 font-medium">{{ row.pair }}</td>
              <td class="px-3 py-2">{{ row.side }}</td>
              <td class="px-3 py-2">{{ row.progress }}</td>
              <td class="px-3 py-2" :class="statusClass(row.status)">{{ row.status }}</td>
              <td class="px-3 py-2" :class="resultClass(row.result)">{{ row.result || ' ' }}</td>
            </tr>

            <tr
              v-if="expandedPair === row.pair"
              class="border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/40"
            >
              <td colspan="5" class="px-3 py-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div class="space-y-1">
                    <div><span class="font-semibold">Pair:</span> {{ row.pair }}</div>
                    <div><span class="font-semibold">Side:</span> {{ row.side }}</div>
                    <div><span class="font-semibold">Progress:</span> {{ row.progress }}</div>
                    <div><span class="font-semibold">Status:</span> {{ row.status }}</div>
                    <div v-if="row.result">
                      <span class="font-semibold">Result:</span> {{ row.result }}
                    </div>
                  </div>

                  <div class="space-y-1" v-if="row.signal">
                    <div>
                      <span class="font-semibold">Entry Gate:</span>
                      {{ row.signal.entry_gate ? 'Open' : 'Waiting' }}
                    </div>
                    <div>
                      <span class="font-semibold">ATR:</span>
                      {{ row.signal.atr_ok ? 'OK' : 'No' }}
                    </div>
                    <div>
                      <span class="font-semibold">Volume:</span>
                      {{ row.signal.vol_ok ? 'OK' : 'No' }}
                    </div>
                    <div>
                      <span class="font-semibold">Range:</span>
                      {{ row.signal.range_ok ? 'OK' : 'No' }}
                    </div>
                    <div>
                      <span class="font-semibold">Sweep:</span>
                      {{
                        row.signal.sweep_low
                          ? 'Low'
                          : row.signal.sweep_high
                            ? 'High'
                            : row.signal.sweep
                              ? 'Yes'
                              : 'No'
                      }}
                    </div>
                    <div>
                      <span class="font-semibold">VWAP:</span>
                      {{ row.signal.vwap ?? 'n/a' }}
                    </div>
                    <div>
                      <span class="font-semibold">Enter Tag:</span>
                      {{ row.signal.enter_tag ?? 'n/a' }}
                    </div>
                    <div>
                      <span class="font-semibold">Stop / Target:</span>
                      {{ row.signal.expected_stop ?? 'n/a' }} / {{ row.signal.expected_target ?? 'n/a' }}
                    </div>
                    <div>
                      <span class="font-semibold">R/R:</span>
                      {{ row.signal.expected_rr ?? 'n/a' }}
                    </div>
                    <div>
                      <span class="font-semibold">Risk Halt:</span>
                      {{ row.signal.risk_halt_reason ?? 'none' }}
                    </div>
                  </div>

                  <div class="space-y-1" v-if="row.blocked">
                    <div>
                      <span class="font-semibold">Blocked Reason:</span>
                      {{ row.blocked.block_reason ?? 'n/a' }}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
