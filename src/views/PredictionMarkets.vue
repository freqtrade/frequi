<script setup lang="ts">
// PredictionMarkets.vue — Phase 4 mock view
// Phase 4 wires to engine/scanner/scanner.py + ensemble.py via REST endpoint.

interface Market {
  source: 'Polymarket' | 'Kalshi';
  id: string;
  title: string;
  yesPrice: number;
  volumeUsd: number;
  ensembleProb: number;
  kellyUsd: number;
}

const MOCK_MARKETS: Market[] = [
  { source: 'Polymarket', id: 'pm1', title: 'Fed cuts rates in Q3 2026?',       yesPrice: 0.42, volumeUsd: 2_400_000, ensembleProb: 0.51, kellyUsd: 47.50 },
  { source: 'Polymarket', id: 'pm2', title: 'BTC above $120k by Dec 2026?',     yesPrice: 0.38, volumeUsd: 5_100_000, ensembleProb: 0.46, kellyUsd: 38.20 },
  { source: 'Kalshi',     id: 'kl1', title: 'US recession declared in 2026?',    yesPrice: 0.29, volumeUsd: 890_000,  ensembleProb: 0.35, kellyUsd: 27.80 },
  { source: 'Kalshi',     id: 'kl2', title: 'CPI below 3% by August 2026?',      yesPrice: 0.61, volumeUsd: 1_200_000, ensembleProb: 0.58, kellyUsd: 0    },
  { source: 'Polymarket', id: 'pm3', title: 'ETH ETF net inflow positive Q2?',   yesPrice: 0.55, volumeUsd: 780_000,  ensembleProb: 0.63, kellyUsd: 52.10 },
];

const MAX_EXPOSURE_USD = 500;

const markets = ref<Market[]>(MOCK_MARKETS);
const lastUpdated = ref<Date>(new Date());
const pollInterval = ref<ReturnType<typeof setInterval> | null>(null);
const paperTrades = ref<Set<string>>(new Set());

const totalExposure = computed(() =>
  markets.value.filter(m => paperTrades.value.has(m.id)).reduce((s, m) => s + m.kellyUsd, 0),
);

const exposurePct = computed(() => Math.min((totalExposure.value / MAX_EXPOSURE_USD) * 100, 100));

const formattedTime = computed(() =>
  lastUpdated.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
);

function edge(m: Market): number {
  return m.ensembleProb - m.yesPrice;
}

function edgeColor(m: Market): string {
  const e = edge(m);
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

function togglePaper(id: string) {
  if (paperTrades.value.has(id)) {
    paperTrades.value.delete(id);
  } else {
    paperTrades.value.add(id);
  }
}

async function fetchMarkets() {
  // TODO Phase 4: replace with real API call to /api/v1/markets
  markets.value = MOCK_MARKETS;
  lastUpdated.value = new Date();
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
          <div class="pointer-events-none absolute left-4 top-full mt-2 w-80 rounded-md bg-surface-700 border border-surface-500 px-3 py-2 text-xs text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg leading-5">
            <div class="absolute -top-1.5 left-3 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-surface-500" />
            Scans <strong>Polymarket</strong> and <strong>Kalshi</strong> for active markets. A <strong>5-model LLM ensemble</strong> (Claude 30%, GPT-4o 20%, Grok 20%, Gemini 15%, DeepSeek 15%) estimates the true YES probability. When ensemble probability exceeds the market price by ≥5%, a <strong>quarter-Kelly position</strong> is sized — capped at <strong>$500 total exposure</strong> in paper mode.
          </div>
        </div>
      </div>
      <span class="text-xs text-surface-400">{{ formattedTime }}</span>
    </div>

    <!-- Exposure summary bar -->
    <div class="flex flex-col gap-2 p-4 rounded-lg border bg-surface-800 border-surface-600">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-surface-300 uppercase tracking-widest">Total Paper Exposure</span>
        <span class="text-lg font-bold" :class="totalExposure > 400 ? 'text-orange-400' : 'text-sky-400'">
          ${{ totalExposure.toFixed(2) }} / ${{ MAX_EXPOSURE_USD }}
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
            <th class="px-4 py-3 font-medium text-right">YES Price</th>
            <th class="px-4 py-3 font-medium text-right">Volume</th>
            <th class="px-4 py-3 font-medium text-right">Ensemble</th>
            <th class="px-4 py-3 font-medium text-right">Edge</th>
            <th class="px-4 py-3 font-medium text-right">Kelly $</th>
            <th class="px-4 py-3 font-medium text-center">Paper</th>
          </tr>
        </thead>
        <tbody>
          <tr
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
            <td class="px-4 py-3 text-surface-100 max-w-xs">{{ m.title }}</td>
            <td class="px-4 py-3 text-right font-mono text-surface-300">{{ (m.yesPrice * 100).toFixed(0) }}¢</td>
            <td class="px-4 py-3 text-right text-surface-400 text-xs">
              ${{ (m.volumeUsd / 1_000_000).toFixed(1) }}M
            </td>
            <td class="px-4 py-3 text-right font-mono font-semibold text-sky-400">
              {{ (m.ensembleProb * 100).toFixed(0) }}%
            </td>
            <td class="px-4 py-3 text-right font-mono font-semibold" :class="edgeColor(m)">
              {{ edge(m) >= 0 ? '+' : '' }}{{ (edge(m) * 100).toFixed(1) }}%
            </td>
            <td class="px-4 py-3 text-right font-mono" :class="m.kellyUsd > 0 ? 'text-green-400' : 'text-surface-500'">
              {{ m.kellyUsd > 0 ? `$${m.kellyUsd.toFixed(2)}` : '—' }}
            </td>
            <td class="px-4 py-3 text-center">
              <button
                v-if="m.kellyUsd > 0"
                class="rounded px-2 py-0.5 text-xs font-semibold border transition-colors"
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
      Mock data · refreshes every 30s · Phase 4 wires live scanner + ensemble backend
    </div>
  </div>
</template>

<style scoped>
</style>
