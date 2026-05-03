<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

interface Market {
  source: 'Polymarket' | 'Kalshi';
  id: string;
  title: string;
  yesPrice: number;
  bestBid: number | null;
  bestAsk: number | null;
  midPrice: number | null;
  spread: number | null;
  bidSize: number | null;
  askSize: number | null;
  lastTradePrice: number | null;
  clobDataSource: string | null;
  clobBookUpdatedAt: string | null;
  clobOrderLevels: number;
  minimumOrderSize: number | null;
  minimumTickSize: number | null;
  volumeUsd: number;
  ensembleProb: number | null;
  edge: number | null;
  kellyUsd: number;
  modelVotes: Record<string, number>;
  modelsUsed: string[];
  predictionError: string | null;
  sourceUrl: string | null;
  marketUpdatedAt: string | null;
  endDate: string | null;
  status: {
    label: string;
    severity: 'strong' | 'watch' | 'avoid' | 'neutral';
    reason: string;
  };
}

interface MarketsPayload {
  rows: Market[];
  updated_at: string;
  source: string;
  status: 'ok' | 'degraded';
  errors: string[];
  config: {
    accountUsd: number;
    maxExposureUsd: number;
    kellyFraction: number;
    cacheTtlSeconds: number;
    scanLimit: number;
  };
}

const API_BASE = 'http://localhost:5001';

const markets = ref<Market[]>([]);
const lastUpdated = ref<Date>(new Date());
const pollInterval = ref<ReturnType<typeof setInterval> | null>(null);
const paperTrades = ref<Set<string>>(new Set());
const loading = ref(false);
const errorMessage = ref('');
const marketStatus = ref<'ok' | 'degraded'>('degraded');
const marketErrors = ref<string[]>([]);
const maxExposureUsd = ref(500);

const totalExposure = computed(() =>
  markets.value.filter(m => paperTrades.value.has(m.id)).reduce((s, m) => s + m.kellyUsd, 0),
);

const exposurePct = computed(() => Math.min((totalExposure.value / maxExposureUsd.value) * 100, 100));

const formattedTime = computed(() =>
  lastUpdated.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
);

function edge(m: Market): number {
  return m.edge ?? 0;
}

function edgeColor(m: Market): string {
  if (m.edge === null) return 'text-surface-500';
  const e = m.edge;
  if (e > 0.08) return 'text-green-400';
  if (e > 0.03) return 'text-sky-400';
  if (e < 0)    return 'text-red-400';
  return 'text-surface-400';
}

function sourceColor(source: string): string {
  return source === 'Polymarket'
    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
    : 'bg-purple-500/20 text-purple-400 border-purple-500/40';
}

function statusBadge(m: Market): { label: string; color: string; reason: string } {
  const colors = {
    strong: 'bg-green-500/20 text-green-400 border-green-500/40',
    watch: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    avoid: 'bg-red-500/20 text-red-400 border-red-500/40',
    neutral: 'bg-surface-600 text-surface-300 border-surface-500',
  };

  return {
    label: m.status.label,
    color: colors[m.status.severity],
    reason: m.status.reason,
  };
}

function modelBreakdown(m: Market): string {
  if (m.predictionError) {
    return m.predictionError;
  }

  const votes = Object.entries(m.modelVotes);
  if (votes.length === 0) {
    return 'No model votes available.';
  }

  return votes.map(([model, probability]) => `${model}: ${(probability * 100).toFixed(1)}%`).join(' · ');
}

function cents(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${(value * 100).toFixed(1)}¢`;
}

function marketDataLabel(m: Market): string {
  return m.clobDataSource === 'polymarket_clob' ? 'CLOB live book' : 'Gamma market data';
}

function marketDataTime(m: Market): string {
  const raw = m.clobBookUpdatedAt || m.marketUpdatedAt;
  if (!raw) return 'freshness unavailable';
  return new Date(raw).toLocaleTimeString();
}

function togglePaper(id: string) {
  if (paperTrades.value.has(id)) {
    paperTrades.value.delete(id);
  } else {
    paperTrades.value.add(id);
  }
}

async function fetchMarkets() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const res = await fetch(`${API_BASE}/api/v1/markets`);
    if (!res.ok) throw new Error(`Market API returned ${res.status}`);
    const data = (await res.json()) as MarketsPayload;
    markets.value = data.rows;
    marketStatus.value = data.status;
    marketErrors.value = data.errors ?? [];
    maxExposureUsd.value = data.config?.maxExposureUsd ?? 500;
    lastUpdated.value = data.updated_at ? new Date(data.updated_at) : new Date();
    paperTrades.value = new Set([...paperTrades.value].filter(id => data.rows.some(m => m.id === id)));
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load prediction markets.';
    marketStatus.value = 'degraded';
    markets.value = [];
    marketErrors.value = [errorMessage.value];
    lastUpdated.value = new Date();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchMarkets();
  pollInterval.value = setInterval(fetchMarkets, 30_000);
});

onBeforeUnmount(() => {
  if (pollInterval.value !== null) clearInterval(pollInterval.value);
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        <h1 class="text-lg font-bold text-surface-100 uppercase tracking-widest">Prediction Markets</h1>
        <div class="group relative flex items-center">
          <i-mdi-information-outline class="text-surface-400 hover:text-surface-200 cursor-default text-base transition-colors" />
          <div class="pointer-events-none absolute right-0 sm:left-4 sm:right-auto top-full mt-2 w-64 md:w-80 max-w-[90vw] rounded-md bg-surface-700 border border-surface-500 px-3 py-2 text-xs text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg leading-5">
            <div class="absolute -top-1.5 left-3 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-surface-500" />
            Scans <strong>Polymarket</strong> Gamma for market discovery and enriches rows with public <strong>CLOB order-book</strong> bid/ask/spread data when available. A <strong>5-model LLM ensemble</strong> estimates the true YES probability. When ensemble probability exceeds the market price by ≥5%, a <strong>quarter-Kelly position</strong> is sized — capped at <strong>$500 total exposure</strong> in paper mode.
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="text-xs px-1.5 py-0.5 rounded font-semibold"
          :class="marketStatus === 'ok' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'"
        >
          {{ marketStatus === 'ok' ? 'LIVE' : 'DEGRADED' }}
        </span>
        <span class="text-xs text-surface-400">{{ formattedTime }}</span>
      </div>
    </div>

    <div
      v-if="marketErrors.length > 0"
      class="rounded border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200"
    >
      <div v-for="message in marketErrors" :key="message">{{ message }}</div>
    </div>

    <!-- Exposure summary bar -->
    <div class="flex flex-col gap-2 p-4 rounded-lg border bg-surface-800 border-surface-600">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-surface-300 uppercase tracking-widest">Total Paper Exposure</span>
        <span class="text-lg font-bold" :class="totalExposure > 400 ? 'text-orange-400' : 'text-sky-400'">
          ${{ totalExposure.toFixed(2) }} / ${{ maxExposureUsd }}
        </span>
      </div>
      <div class="h-2 w-full rounded-full bg-surface-700 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="totalExposure > 400 ? 'bg-orange-500' : 'bg-sky-500'"
          :style="{ width: `${exposurePct}%` }"
        />
      </div>
    </div>

    <!-- Markets table -->
    <div class="rounded-lg border bg-surface-800 border-surface-600 overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-surface-400 border-b border-surface-600">
            <th class="px-4 py-3 font-medium">Source</th>
            <th class="px-4 py-3 font-medium">Market</th>
            <th class="px-4 py-3 font-medium text-right">Market</th>
            <th class="px-4 py-3 font-medium text-right hidden md:table-cell">Book</th>
            <th class="px-4 py-3 font-medium text-right hidden sm:table-cell">Volume</th>
            <th class="px-4 py-3 font-medium text-right">Ensemble</th>
            <th class="px-4 py-3 font-medium text-right">Edge</th>
            <th class="px-4 py-3 font-medium text-center">Status</th>
            <th class="px-4 py-3 font-medium text-right hidden md:table-cell">Kelly $</th>
            <th class="px-4 py-3 font-medium text-center">Paper</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="10" class="px-4 py-8 text-center text-surface-400">
              Loading live prediction markets...
            </td>
          </tr>
          <tr v-else-if="markets.length === 0">
            <td colspan="10" class="px-4 py-8 text-center text-surface-400">
              No live prediction markets available.
            </td>
          </tr>
          <tr
            v-else
            v-for="m in markets"
            :key="m.id"
            class="border-b border-surface-700 last:border-0 hover:bg-surface-700/40 transition-colors"
          >
            <td class="px-4 py-3">
              <span
                class="inline-block rounded px-2 py-0.5 text-xs font-semibold border"
                :class="sourceColor(m.source)"
              >
                {{ m.source }}
              </span>
            </td>
            <td class="px-4 py-3 text-surface-100 max-w-xs">
              <a
                v-if="m.sourceUrl"
                :href="m.sourceUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-sky-300 hover:underline"
              >
                {{ m.title }}
              </a>
              <span v-else>{{ m.title }}</span>
              <div v-if="m.marketUpdatedAt || m.endDate" class="mt-1 text-[11px] text-surface-500">
                <span v-if="m.endDate">ends {{ new Date(m.endDate).toLocaleString() }}</span>
                <span v-if="m.marketUpdatedAt"> · updated {{ new Date(m.marketUpdatedAt).toLocaleTimeString() }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-right font-mono text-surface-300">
              <div class="font-semibold text-surface-100">{{ cents(m.yesPrice) }}</div>
              <div class="text-[11px] text-surface-500">last {{ cents(m.lastTradePrice) }}</div>
            </td>
            <td class="px-4 py-3 text-right font-mono text-surface-300 hidden md:table-cell">
              <div class="whitespace-nowrap">
                <span class="text-green-400">{{ cents(m.bestBid) }}</span>
                <span class="px-1 text-surface-600">/</span>
                <span class="text-red-400">{{ cents(m.bestAsk) }}</span>
              </div>
              <div class="text-[11px] text-surface-500">
                spread {{ cents(m.spread) }} · {{ marketDataLabel(m) }}
              </div>
              <div class="text-[11px] text-surface-600">
                {{ marketDataTime(m) }}
              </div>
            </td>
            <td class="px-4 py-3 text-right text-surface-400 text-xs hidden sm:table-cell">
              ${{ (m.volumeUsd / 1_000_000).toFixed(1) }}M
            </td>
            <td class="px-4 py-3 text-right font-mono font-semibold text-sky-400">
              <span v-if="m.ensembleProb !== null">{{ (m.ensembleProb * 100).toFixed(0) }}%</span>
              <span v-else class="text-surface-500">—</span>
            </td>
            <td class="px-4 py-3 text-right font-mono font-semibold" :class="edgeColor(m)">
              <span v-if="m.edge !== null">
                {{ edge(m) >= 0 ? '+' : '' }}{{ (edge(m) * 100).toFixed(1) }}%
              </span>
              <span v-else>—</span>
            </td>
            <td class="px-4 py-3 text-center">
              <div class="group relative inline-block">
                <span
                  class="inline-block rounded px-2 py-0.5 text-xs font-semibold border"
                  :class="statusBadge(m).color"
                >
                  {{ statusBadge(m).label }}
                </span>
                <div class="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-96 max-w-[98vw] rounded-md bg-surface-700 border border-surface-500 px-3 py-2 text-xs text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg leading-5 whitespace-normal">
                  <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-surface-500" />
                  <div>{{ statusBadge(m).reason }}</div>
                  <div class="mt-1 text-surface-400">{{ modelBreakdown(m) }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-right font-mono hidden md:table-cell" :class="m.kellyUsd > 0 ? 'text-green-400' : 'text-surface-500'">
              {{ m.kellyUsd > 0 ? `$${m.kellyUsd.toFixed(2)}` : '—' }}
            </td>
            <td class="px-4 py-3 text-center">
              <button
                v-if="m.kellyUsd > 0"
                class="rounded px-2 py-1 text-xs font-semibold border transition-colors"
                :class="paperTrades.has(m.id)
                  ? 'bg-green-500/20 text-green-400 border-green-500/40 hover:bg-green-500/30'
                  : 'bg-surface-700 text-surface-300 border-surface-500 hover:border-surface-300'"
                @click="togglePaper(m.id)"
              >
                {{ paperTrades.has(m.id) ? 'TRACKED' : 'PAPER' }}
              </button>
              <span v-else class="text-xs text-surface-600">no edge</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="text-xs text-surface-500 text-center">
      Live scanner · refreshes every 30s · cached by backend to control model/API usage
    </div>
  </div>
</template>

<style scoped>
</style>
