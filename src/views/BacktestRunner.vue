<script setup lang="ts">
type Status = 'idle' | 'running' | 'complete';

interface BacktestResult {
  profitFactor: number;
  avgDurationBars: number;
  staleRate: number;
  totalTrades: number;
  winRate: number;
  longTrades: number;
  shortTrades: number;
}

function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const today = new Date();
const twoYearsAgo = new Date(today);
twoYearsAgo.setFullYear(today.getFullYear() - 2);

const status = ref<Status>('idle');
const selectedPair = ref('BTC/USDT:USDT');
const startDate = ref(toDateInput(twoYearsAgo));
const endDate = ref(toDateInput(today));
const selectedStrategy = ref('Convergence Engine v15');
const result = ref<BacktestResult | null>(null);

const pairs = ['BTC/USDT:USDT', 'ETH/USDT:USDT'];
const strategies = ['Convergence Engine v15'];

// Locked v15 validation metrics from V15_CONFIG.json.
const MOCK_RESULTS: Record<string, BacktestResult> = {
  'Convergence Engine v15': {
    profitFactor: 1.33,
    avgDurationBars: 2.45,
    staleRate: 20.5,
    totalTrades: 591,
    winRate: 52.9,
    longTrades: 296,
    shortTrades: 295,
  },
};

async function runBacktest() {
  status.value = 'running';
  result.value = null;
  await new Promise(r => setTimeout(r, 2000));
  result.value = MOCK_RESULTS[selectedStrategy.value] ?? MOCK_RESULTS['Convergence Engine v15'];
  status.value = 'complete';
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4 md:p-6 min-h-screen bg-surface-900">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <i-mdi-play-circle class="text-2xl text-primary-400" />
      <h1 class="text-xl font-bold uppercase tracking-widest text-surface-200">v15 Paper Validation</h1>
      <span class="text-xs text-surface-500 ml-2">BTC/ETH · 1m · Long/Short</span>
    </div>

    <!-- Config Panel -->
    <div class="rounded-lg border bg-surface-800 border-surface-600 p-4 flex flex-col gap-4">
      <h2 class="text-sm font-semibold uppercase tracking-wider text-surface-300">Configuration</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-surface-400">Pair</label>
          <select v-model="selectedPair" class="bg-surface-700 border border-surface-500 rounded px-2 py-2 text-sm text-surface-200">
            <option v-for="p in pairs" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-surface-400">Start Date</label>
          <input v-model="startDate" type="date" class="bg-surface-700 border border-surface-500 rounded px-2 py-2 text-sm text-surface-200" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-surface-400">End Date</label>
          <input v-model="endDate" type="date" class="bg-surface-700 border border-surface-500 rounded px-2 py-2 text-sm text-surface-200" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-surface-400">Strategy</label>
          <select v-model="selectedStrategy" class="bg-surface-700 border border-surface-500 rounded px-2 py-2 text-sm text-surface-200">
            <option v-for="s in strategies" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <button
          :disabled="status === 'running'"
          class="flex items-center gap-2 px-4 py-2 rounded bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          @click="runBacktest"
        >
          <i-mdi-play v-if="status !== 'running'" />
          <i-mdi-loading v-else class="animate-spin" />
          {{ status === 'running' ? 'Running...' : 'Run Backtest' }}
        </button>
        <span
          class="text-xs font-semibold px-2 py-0.5 rounded border"
          :class="{
            'bg-surface-700 text-surface-400 border-surface-600': status === 'idle',
            'bg-yellow-500/20 text-yellow-400 border-yellow-500/40': status === 'running',
            'bg-green-500/20 text-green-400 border-green-500/40': status === 'complete',
          }"
        >
          {{ status.toUpperCase() }}
        </span>
      </div>
    </div>

    <!-- Results Panel -->
    <div v-if="result" class="rounded-lg border bg-surface-800 border-surface-600 p-4 flex flex-col gap-4">
      <h2 class="text-sm font-semibold uppercase tracking-wider text-surface-300">Results — {{ selectedPair }} · {{ selectedStrategy }}</h2>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <div class="flex flex-col items-center gap-1 p-3 rounded bg-surface-700">
          <span class="text-xs text-surface-400">Profit Factor</span>
          <span class="text-xl font-bold text-green-400">
            {{ result.profitFactor }}
          </span>
        </div>
        <div class="flex flex-col items-center gap-1 p-3 rounded bg-surface-700">
          <span class="text-xs text-surface-400">Stale Rate</span>
          <span class="text-xl font-bold text-yellow-300">
            {{ result.staleRate }}%
          </span>
        </div>
        <div class="flex flex-col items-center gap-1 p-3 rounded bg-surface-700">
          <span class="text-xs text-surface-400">Avg Duration</span>
          <span class="text-xl font-bold text-surface-200">{{ result.avgDurationBars }} bars</span>
        </div>
        <div class="flex flex-col items-center gap-1 p-3 rounded bg-surface-700">
          <span class="text-xs text-surface-400">Total Trades</span>
          <span class="text-xl font-bold text-surface-200">{{ result.totalTrades }}</span>
        </div>
        <div class="flex flex-col items-center gap-1 p-3 rounded bg-surface-700">
          <span class="text-xs text-surface-400">Win Rate</span>
          <span class="text-xl font-bold text-emerald-400">{{ result.winRate }}%</span>
        </div>
      </div>
      <div class="text-xs text-surface-500 text-center">
        Locked v15 baseline: 591 trades, PF 1.33, WR 52.9%, stale 20.5% · {{ startDate }} → {{ endDate }}
      </div>
      <div class="text-xs text-surface-500 text-center">
        Long / short baseline split: {{ result.longTrades }} / {{ result.shortTrades }}
      </div>
    </div>

    <div v-else-if="status === 'idle'" class="rounded-lg border bg-surface-800 border-surface-600 p-8 flex items-center justify-center text-surface-500 text-sm">
      Configure and run a backtest to see results.
    </div>
  </div>
</template>
