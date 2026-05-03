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
  netProfitUsd?: number;
  maxDrawdownUsd?: number;
  avgWinUsd?: number;
  avgLossUsd?: number;
  expectancyUsd?: number;
  source?: string;
  note?: string;
}

interface DeploymentMetricRow {
  trades: number;
  win_rate: number;
  profit_factor: number;
  net_profit: number;
  avg_win?: number;
  avg_loss?: number;
  expectancy?: number;
  max_drawdown?: number;
}

interface DeploymentTradeLogRow {
  entry_time: string;
  symbol: string;
  side: string;
  outcome: string;
  pnl_usd: number;
  realized_r: number;
}

interface DeploymentTrackerReport {
  source_window: {
    start: string;
    end: string;
  };
  strategy: string;
  overall: DeploymentMetricRow;
  by_side: Record<string, DeploymentMetricRow>;
  trade_log: DeploymentTradeLogRow[];
}

interface DeploymentTrackerResponse {
  status: 'ok' | 'missing' | 'error';
  source: string | null;
  report?: DeploymentTrackerReport;
  error?: string;
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
const selectedStrategy = ref('Liquidity Sweep Failure v18.2');
const result = ref<BacktestResult | null>(null);
const trackerLoadStatus = ref<'idle' | 'loading' | 'loaded' | 'error'>('idle');
const trackerError = ref<string | null>(null);
const v182Report = ref<DeploymentTrackerReport | null>(null);

const API_BASE = 'http://localhost:5001';
const strategies = ['Liquidity Sweep Failure v18.2', 'Convergence Engine v15'];
const pairs = computed(() =>
  selectedStrategy.value === 'Liquidity Sweep Failure v18.2'
    ? ['ALL', 'BTC/USD', 'ETH/USD', 'SOL/USD', 'AVAX/USD', 'XRP/USD', 'LTC/USD']
    : ['ALL', 'BTC/USDT:USDT', 'ETH/USDT:USDT'],
);

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

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function formatUsd(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return 'n/a';
  }
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

function profitFactor(pnls: number[]) {
  const grossWin = pnls.filter((pnl) => pnl > 0).reduce((sum, pnl) => sum + pnl, 0);
  const grossLoss = Math.abs(pnls.filter((pnl) => pnl <= 0).reduce((sum, pnl) => sum + pnl, 0));
  if (grossLoss === 0) {
    return grossWin > 0 ? 999 : 0;
  }
  return grossWin / grossLoss;
}

function maxDrawdown(pnls: number[]) {
  let equity = 300;
  let peak = 300;
  let drawdown = 0;
  pnls.forEach((pnl) => {
    equity += pnl;
    peak = Math.max(peak, equity);
    drawdown = Math.max(drawdown, peak - equity);
  });
  return drawdown;
}

function selectedDateRangeLabel(report: DeploymentTrackerReport) {
  return `${startDate.value || report.source_window.start} to ${endDate.value || report.source_window.end}`;
}

function trackerToBacktestResult(report: DeploymentTrackerReport): BacktestResult {
  const start = startDate.value || report.source_window.start;
  const end = endDate.value || report.source_window.end;
  const filteredTrades = report.trade_log.filter((trade) => {
    const tradeDate = String(trade.entry_time).slice(0, 10);
    const pairOk = selectedPair.value === 'ALL' || trade.symbol === selectedPair.value;
    return pairOk && tradeDate >= start && tradeDate <= end;
  });
  const pnls = filteredTrades.map((trade) => trade.pnl_usd);
  const wins = pnls.filter((pnl) => pnl > 0);
  const losses = pnls.filter((pnl) => pnl <= 0);
  const totalTrades = filteredTrades.length;
  const shortTrades = filteredTrades.filter((trade) => trade.side === 'short').length;
  const longTrades = filteredTrades.filter((trade) => trade.side === 'long').length;
  const netProfit = pnls.reduce((sum, pnl) => sum + pnl, 0);
  const avgWin = wins.length ? wins.reduce((sum, pnl) => sum + pnl, 0) / wins.length : 0;
  const avgLoss = losses.length
    ? Math.abs(losses.reduce((sum, pnl) => sum + pnl, 0) / losses.length)
    : 0;
  const expectancy = totalTrades ? netProfit / totalTrades : 0;

  return {
    profitFactor: round(profitFactor(pnls)),
    avgDurationBars: 20,
    staleRate: 0,
    totalTrades,
    winRate: totalTrades ? round((wins.length / totalTrades) * 100, 1) : 0,
    longTrades,
    shortTrades,
    netProfitUsd: netProfit,
    maxDrawdownUsd: maxDrawdown(pnls),
    avgWinUsd: avgWin,
    avgLossUsd: avgLoss,
    expectancyUsd: expectancy,
    source: report.strategy,
    note: `Filtered v18.2 tracker: ${selectedPair.value} · ${selectedDateRangeLabel(report)}. Advisory tracker only; no live logic changes.`,
  };
}

async function fetchV182Tracker() {
  trackerLoadStatus.value = 'loading';
  trackerError.value = null;
  try {
    const res = await fetch(`${API_BASE}/api/v1/learning/deployment-tracker`);
    if (!res.ok) {
      throw new Error('Deployment tracker API unavailable');
    }
    const data: DeploymentTrackerResponse = await res.json();
    if (data.status !== 'ok' || !data.report) {
      throw new Error(data.error || 'No v18.2 deployment tracker found');
    }
    v182Report.value = data.report;
    startDate.value = data.report.source_window.start;
    endDate.value = data.report.source_window.end;
    if (!pairs.value.includes(selectedPair.value)) {
      selectedPair.value = 'ALL';
    }
    trackerLoadStatus.value = 'loaded';
  } catch (error) {
    trackerError.value = error instanceof Error ? error.message : 'Failed to load v18.2 tracker';
    trackerLoadStatus.value = 'error';
  }
}

async function runBacktest() {
  status.value = 'running';
  result.value = null;
  if (selectedStrategy.value === 'Liquidity Sweep Failure v18.2') {
    if (!v182Report.value) {
      await fetchV182Tracker();
    }
    await new Promise(r => setTimeout(r, 400));
    result.value = v182Report.value ? trackerToBacktestResult(v182Report.value) : null;
  } else {
    await new Promise(r => setTimeout(r, 1200));
    result.value = MOCK_RESULTS[selectedStrategy.value] ?? MOCK_RESULTS['Convergence Engine v15'];
  }
  status.value = 'complete';
}

onMounted(() => {
  fetchV182Tracker();
});

watch(selectedStrategy, () => {
  if (!pairs.value.includes(selectedPair.value)) {
    selectedPair.value = 'ALL';
  }
  result.value = null;
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4 md:p-6 min-h-screen bg-surface-900">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <i-mdi-play-circle class="text-2xl text-primary-400" />
      <h1 class="text-xl font-bold uppercase tracking-widest text-surface-200">Strategy Validation</h1>
      <span class="text-xs text-surface-500 ml-2">v18.2 baseline · v15 archive</span>
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
          :disabled="status === 'running' || (selectedStrategy === 'Liquidity Sweep Failure v18.2' && trackerLoadStatus === 'error')"
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
      <div
        v-if="selectedStrategy === 'Liquidity Sweep Failure v18.2'"
        class="text-xs"
        :class="trackerLoadStatus === 'error' ? 'text-red-300' : 'text-surface-500'"
      >
        {{
          trackerLoadStatus === 'loaded'
            ? 'Loaded v18.2 validation from deployment tracker.'
            : trackerLoadStatus === 'loading'
              ? 'Loading v18.2 deployment tracker...'
              : trackerError || 'v18.2 deployment tracker is not available.'
        }}
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
        {{ result.note || `Locked v15 baseline: 591 trades, PF 1.33, WR 52.9%, stale 20.5% · ${startDate} → ${endDate}` }}
      </div>
      <div class="text-xs text-surface-500 text-center">
        Long / short baseline split: {{ result.longTrades }} / {{ result.shortTrades }}
      </div>
      <div
        v-if="result.netProfitUsd !== undefined"
        class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs"
      >
        <div class="rounded bg-surface-700 p-2 text-center">
          <div class="text-surface-400">Net USD</div>
          <div class="font-semibold text-surface-200">{{ formatUsd(result.netProfitUsd) }}</div>
        </div>
        <div class="rounded bg-surface-700 p-2 text-center">
          <div class="text-surface-400">Max DD</div>
          <div class="font-semibold text-yellow-300">{{ formatUsd(result.maxDrawdownUsd) }}</div>
        </div>
        <div class="rounded bg-surface-700 p-2 text-center">
          <div class="text-surface-400">Avg Win / Loss</div>
          <div class="font-semibold text-surface-200">
            {{ formatUsd(result.avgWinUsd) }} / {{ formatUsd(result.avgLossUsd) }}
          </div>
        </div>
        <div class="rounded bg-surface-700 p-2 text-center">
          <div class="text-surface-400">Expectancy</div>
          <div class="font-semibold text-primary-300">{{ formatUsd(result.expectancyUsd) }}</div>
        </div>
      </div>
    </div>

    <div v-else-if="status === 'idle'" class="rounded-lg border bg-surface-800 border-surface-600 p-8 flex items-center justify-center text-surface-500 text-sm">
      Configure and run a backtest to see results.
    </div>
  </div>
</template>
