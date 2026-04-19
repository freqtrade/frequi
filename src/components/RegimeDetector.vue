<script setup lang="ts">
// RegimeDetector.vue — Phase 2 mock component
// Phase 3 will wire this to the real regime_engine.py REST endpoint.

interface RegimeData {
  regime: 'Bull' | 'Strong Bull' | 'Accumulation' | 'Distribution' | 'Bear' | 'Panic';
  probs: { Bull: number; 'Strong Bull': number; Accumulation: number; Distribution: number; Bear: number; Panic: number };
  dominant_prob: number;
}

const MOCK_DATA: RegimeData = {
  regime: 'Bull',
  probs: { Bull: 0.62, 'Strong Bull': 0.18, Accumulation: 0.10, Distribution: 0.05, Bear: 0.03, Panic: 0.02 },
  dominant_prob: 0.62,
};

const regimeData = ref<RegimeData>(MOCK_DATA);
const lastUpdated = ref<Date>(new Date());
const pollInterval = ref<ReturnType<typeof setInterval> | null>(null);

// --- helpers ------------------------------------------------------------------

const regimeColor = computed(() => {
  switch (regimeData.value.regime) {
    case 'Strong Bull': return 'text-emerald-300';
    case 'Bull':        return 'text-green-400';
    case 'Accumulation':return 'text-sky-400';
    case 'Distribution':return 'text-orange-400';
    case 'Bear':        return 'text-red-400';
    case 'Panic':       return 'text-rose-300';
    default:            return 'text-surface-300';
  }
});

const regimeBg = computed(() => {
  switch (regimeData.value.regime) {
    case 'Strong Bull': return 'bg-emerald-500/20 border-emerald-500/40';
    case 'Bull':        return 'bg-green-500/20 border-green-500/40';
    case 'Accumulation':return 'bg-sky-500/20 border-sky-500/40';
    case 'Distribution':return 'bg-orange-500/20 border-orange-500/40';
    case 'Bear':        return 'bg-red-500/20 border-red-500/40';
    case 'Panic':       return 'bg-rose-500/20 border-rose-500/40';
    default:            return 'bg-surface-700 border-surface-500';
  }
});

const bars = computed(() => [
  { label: 'Strong Bull',   value: regimeData.value.probs['Strong Bull'],   pct: Math.round(regimeData.value.probs['Strong Bull'] * 100),   color: '#6ee7b7' },
  { label: 'Bull',          value: regimeData.value.probs.Bull,             pct: Math.round(regimeData.value.probs.Bull * 100),             color: '#22c55e' },
  { label: 'Accumulation',  value: regimeData.value.probs.Accumulation,     pct: Math.round(regimeData.value.probs.Accumulation * 100),     color: '#38bdf8' },
  { label: 'Distribution',  value: regimeData.value.probs.Distribution,     pct: Math.round(regimeData.value.probs.Distribution * 100),     color: '#fb923c' },
  { label: 'Bear',          value: regimeData.value.probs.Bear,             pct: Math.round(regimeData.value.probs.Bear * 100),             color: '#ef4444' },
  { label: 'Panic',         value: regimeData.value.probs.Panic,            pct: Math.round(regimeData.value.probs.Panic * 100),            color: '#fb7185' },
]);

const formattedTime = computed(() =>
  lastUpdated.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
);

// --- polling ------------------------------------------------------------------

async function fetchRegime() {
  // TODO (Phase 3): replace with real API call to /api/v1/regime
  // const res = await fetch('/api/v1/regime');
  // regimeData.value = await res.json();
  regimeData.value = MOCK_DATA;
  lastUpdated.value = new Date();
}

onMounted(() => {
  fetchRegime();
  pollInterval.value = setInterval(fetchRegime, 5000);
});

onBeforeUnmount(() => {
  if (pollInterval.value !== null) {
    clearInterval(pollInterval.value);
  }
});
</script>

<template>
  <div class="flex flex-col gap-3 p-4 rounded-lg border bg-surface-800 border-surface-600 min-w-[260px]">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        <span class="text-sm font-semibold uppercase tracking-widest text-surface-300">Regime</span>
        <div class="group relative flex items-center">
          <i-mdi-information-outline class="text-surface-400 hover:text-surface-200 cursor-default text-base transition-colors" />
          <div class="pointer-events-none absolute left-4 top-full mt-2 w-72 rounded-md bg-surface-700 border border-surface-500 px-3 py-2 text-xs text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg leading-5">
            <div class="absolute -top-1.5 left-3 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-surface-500" />
            A <strong>6-state Hidden Markov Model</strong> classifies the market using 7 features: log returns, volatility, volume spikes, VWAP deviation, vol ratio, and momentum. Each state carries a specific risk posture:<br /><br />
            <span class="text-emerald-300 font-semibold">Strong Bull</span> / <span class="text-green-400 font-semibold">Bull</span> — full position size<br />
            <span class="text-sky-400 font-semibold">Accumulation</span> — 75% size (transitioning up)<br />
            <span class="text-orange-400 font-semibold">Distribution</span> — 25% size (topping signal)<br />
            <span class="text-red-400 font-semibold">Bear</span> — 50% size, short bias only<br />
            <span class="text-rose-300 font-semibold">Panic</span> — 10% size, mean-revert only
          </div>
        </div>
      </div>
      <span class="text-xs text-surface-400">{{ formattedTime }}</span>
    </div>

    <!-- Current regime badge -->
    <div
      class="flex items-center justify-center gap-2 rounded-md border px-4 py-3"
      :class="regimeBg"
    >
      <span class="text-2xl font-bold" :class="regimeColor">{{ regimeData.regime }}</span>
      <span class="text-sm font-medium text-surface-300">
        {{ (regimeData.dominant_prob * 100).toFixed(0) }}%
      </span>
    </div>

    <!-- Probability bars -->
    <div class="flex flex-col gap-2">
      <div v-for="bar in bars" :key="bar.label" class="flex flex-col gap-1">
        <div class="flex justify-between text-xs text-surface-400">
          <span>{{ bar.label }}</span>
          <span>{{ bar.pct }}%</span>
        </div>
        <div class="h-2 w-full rounded-full bg-surface-700 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{ width: `${bar.pct}%`, backgroundColor: bar.color }"
          />
        </div>
      </div>
    </div>

    <!-- Footer note -->
    <div class="text-xs text-surface-500 text-center">
      Polls every 5s &mdash; mock data · Phase 3 wires live regime_engine.py
    </div>
  </div>
</template>

<style scoped>
</style>
