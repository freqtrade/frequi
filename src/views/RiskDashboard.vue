<script setup lang="ts">
// RiskDashboard.vue — Phase 3 mock view
// Phase 3 wires to risk_engine.py + Freqtrade/Hummingbot APIs.

import KillSwitch from '@/components/KillSwitch.vue';

interface RiskData {
  portfolioValue: number;
  peakValue: number;
  dayStartValue: number;
  var95: number;
  kellySizes: { pair: string; size: number; winRate: number }[];
}

const MOCK_DATA: RiskData = {
  portfolioValue: 9_720,
  peakValue: 10_000,
  dayStartValue: 9_900,
  var95: -0.032,
  kellySizes: [
    { pair: 'BTC/USDT', size: 0.0375, winRate: 0.55 },
    { pair: 'ETH/USDT', size: 0.0310, winRate: 0.53 },
    { pair: 'SOL/USDT', size: 0.0280, winRate: 0.52 },
    { pair: 'BNB/USDT', size: 0.0220, winRate: 0.51 },
    { pair: 'XRP/USDT', size: 0.0190, winRate: 0.50 },
  ],
};

const riskData = ref<RiskData>(MOCK_DATA);
const lastUpdated = ref<Date>(new Date());
const pollInterval = ref<ReturnType<typeof setInterval> | null>(null);

const drawdownPct = computed(() => {
  const { portfolioValue, peakValue } = riskData.value;
  if (peakValue === 0) return 0;
  return ((peakValue - portfolioValue) / peakValue) * 100;
});

const dailyLossPct = computed(() => {
  const { portfolioValue, dayStartValue } = riskData.value;
  if (dayStartValue === 0) return 0;
  return ((dayStartValue - portfolioValue) / dayStartValue) * 100;
});

const drawdownColor = computed(() => {
  const d = drawdownPct.value;
  if (d >= 7) return 'bg-red-500';
  if (d >= 5) return 'bg-orange-500';
  return 'bg-green-500';
});

const drawdownTextColor = computed(() => {
  const d = drawdownPct.value;
  if (d >= 7) return 'text-red-400';
  if (d >= 5) return 'text-orange-400';
  return 'text-green-400';
});

const isFlashing = computed(() => drawdownPct.value >= 7);

const dailyColor = computed(() =>
  dailyLossPct.value >= 2.5 ? 'bg-orange-500' : 'bg-sky-500',
);

const formattedTime = computed(() =>
  lastUpdated.value.toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }),
);

async function fetchRisk() {
  // TODO Phase 3: replace with real API calls to risk_engine + Freqtrade balance
  riskData.value = MOCK_DATA;
  lastUpdated.value = new Date();
}

onMounted(() => {
  fetchRisk();
  pollInterval.value = setInterval(fetchRisk, 5000);
});

onBeforeUnmount(() => {
  if (pollInterval.value !== null) clearInterval(pollInterval.value);
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-bold text-surface-100 uppercase tracking-widest">Risk Dashboard</h1>
      <span class="text-xs text-surface-400">{{ formattedTime }}</span>
    </div>

    <!-- Drawdown meter -->
    <div class="flex flex-col gap-2 p-4 rounded-lg border bg-surface-800 border-surface-600">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span class="text-sm font-semibold text-surface-300 uppercase tracking-widest">Portfolio Drawdown</span>
          <div class="group relative flex items-center">
            <i-mdi-information-outline class="text-surface-400 hover:text-surface-200 cursor-default text-base transition-colors" />
            <div class="pointer-events-none absolute left-4 top-full mt-2 w-64 rounded-md bg-surface-700 border border-surface-500 px-3 py-2 text-xs text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg leading-5">
              <div class="absolute -top-1.5 left-3 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-surface-500" />
              Peak-to-trough drawdown from the portfolio high-water mark. <strong class="text-orange-400">Orange</strong> at 5% — reduce size. <strong class="text-red-400">Red + flashing</strong> at 7% — circuit breaker imminent. Auto-halt fires at <strong>8%</strong>.
            </div>
          </div>
        </div>
        <span
          class="text-xl font-bold transition-opacity"
          :class="[drawdownTextColor, isFlashing ? 'animate-pulse' : '']"
        >
          {{ drawdownPct.toFixed(2) }}%
        </span>
      </div>
      <div class="h-3 w-full rounded-full bg-surface-700 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="[drawdownColor, isFlashing ? 'animate-pulse' : '']"
          :style="{ width: `${Math.min(drawdownPct / 8 * 100, 100)}%` }"
        />
      </div>
      <div class="flex justify-between text-xs text-surface-500">
        <span>0%</span><span>4%</span><span class="text-orange-400">8% halt</span>
      </div>
    </div>

    <!-- Daily P&L -->
    <div class="flex flex-col gap-2 p-4 rounded-lg border bg-surface-800 border-surface-600">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-surface-300 uppercase tracking-widest">Daily Loss</span>
        <span class="text-lg font-bold" :class="dailyLossPct >= 2.5 ? 'text-orange-400' : 'text-sky-400'">
          {{ dailyLossPct.toFixed(2) }}%
        </span>
      </div>
      <div class="h-2 w-full rounded-full bg-surface-700 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="dailyColor"
          :style="{ width: `${Math.min(dailyLossPct / 3 * 100, 100)}%` }"
        />
      </div>
      <div class="flex justify-between text-xs text-surface-500">
        <span>0%</span><span class="text-orange-400">3% daily limit</span>
      </div>
    </div>

    <!-- Kelly sizes per pair -->
    <div class="flex flex-col gap-2 p-4 rounded-lg border bg-surface-800 border-surface-600">
      <div class="flex items-center gap-1.5 mb-1">
        <span class="text-sm font-semibold text-surface-300 uppercase tracking-widest">Kelly Sizes</span>
        <div class="group relative flex items-center">
          <i-mdi-information-outline class="text-surface-400 hover:text-surface-200 cursor-default text-base transition-colors" />
          <div class="pointer-events-none absolute left-4 top-full mt-2 w-64 rounded-md bg-surface-700 border border-surface-500 px-3 py-2 text-xs text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg leading-5">
            <div class="absolute -top-1.5 left-3 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-surface-500" />
            Recommended position size as a fraction of account, using <strong>quarter-Kelly</strong> formula calibrated from live trade history. Larger = higher historical edge on that pair.
          </div>
        </div>
      </div>
      <div v-for="row in riskData.kellySizes" :key="row.pair" class="flex items-center gap-3">
        <span class="text-xs font-mono text-surface-100 w-20">{{ row.pair }}</span>
        <div class="flex-1 h-2 rounded-full bg-surface-700 overflow-hidden">
          <div
            class="h-full rounded-full bg-sky-500 transition-all duration-500"
            :style="{ width: `${row.size * 100 / 0.05 * 100}%` }"
          />
        </div>
        <span class="text-xs text-surface-300 w-12 text-right">{{ (row.size * 100).toFixed(2) }}%</span>
        <span class="text-xs text-surface-500 w-14 text-right">wr {{ (row.winRate * 100).toFixed(0) }}%</span>
      </div>
    </div>

    <!-- VaR -->
    <div class="flex items-center justify-between p-4 rounded-lg border bg-surface-800 border-surface-600">
      <div class="flex items-center gap-1.5">
        <span class="text-sm font-semibold text-surface-300 uppercase tracking-widest">95% VaR (1-day)</span>
        <div class="group relative flex items-center">
          <i-mdi-information-outline class="text-surface-400 hover:text-surface-200 cursor-default text-base transition-colors" />
          <div class="pointer-events-none absolute left-4 top-full mt-2 w-64 rounded-md bg-surface-700 border border-surface-500 px-3 py-2 text-xs text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg leading-5">
            <div class="absolute -top-1.5 left-3 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-surface-500" />
            The worst expected 1-day loss at 95% confidence, estimated from the 5th percentile of historical returns. On 95 out of 100 days, losses should not exceed this figure.
          </div>
        </div>
      </div>
      <span class="text-xl font-bold text-orange-400">
        {{ (riskData.var95 * 100).toFixed(2) }}%
      </span>
    </div>

    <!-- Kill Switch -->
    <KillSwitch />

    <!-- Footer -->
    <div class="text-xs text-surface-500 text-center">
      Mock data · Phase 3 wires live risk_engine.py + portfolio API
    </div>
  </div>
</template>

<style scoped>
</style>
