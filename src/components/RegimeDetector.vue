<script setup lang="ts">
// RegimeDetector.vue — Phase 2 mock component
// Phase 3 will wire this to the real regime_engine.py REST endpoint.

interface RegimeData {
  regime: 'Bull' | 'Bear' | 'Sideways';
  probs: { Bull: number; Sideways: number; Bear: number };
  dominant_prob: number;
}

const MOCK_DATA: RegimeData = {
  regime: 'Bull',
  probs: { Bull: 0.78, Sideways: 0.15, Bear: 0.07 },
  dominant_prob: 0.78,
};

const regimeData = ref<RegimeData>(MOCK_DATA);
const lastUpdated = ref<Date>(new Date());
const pollInterval = ref<ReturnType<typeof setInterval> | null>(null);

// --- helpers ------------------------------------------------------------------

const regimeColor = computed(() => {
  switch (regimeData.value.regime) {
    case 'Bull':
      return 'text-green-400';
    case 'Bear':
      return 'text-red-400';
    case 'Sideways':
      return 'text-yellow-400';
    default:
      return 'text-surface-300';
  }
});

const regimeBg = computed(() => {
  switch (regimeData.value.regime) {
    case 'Bull':
      return 'bg-green-500/20 border-green-500/40';
    case 'Bear':
      return 'bg-red-500/20 border-red-500/40';
    case 'Sideways':
      return 'bg-yellow-500/20 border-yellow-500/40';
    default:
      return 'bg-surface-700 border-surface-500';
  }
});

const bars = computed(() => [
  {
    label: 'Bull',
    value: regimeData.value.probs.Bull,
    pct: Math.round(regimeData.value.probs.Bull * 100),
    color: '#22c55e',
  },
  {
    label: 'Sideways',
    value: regimeData.value.probs.Sideways,
    pct: Math.round(regimeData.value.probs.Sideways * 100),
    color: '#eab308',
  },
  {
    label: 'Bear',
    value: regimeData.value.probs.Bear,
    pct: Math.round(regimeData.value.probs.Bear * 100),
    color: '#ef4444',
  },
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
      <span class="text-sm font-semibold uppercase tracking-widest text-surface-300">Regime</span>
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
      Polls every 5s &mdash; mock data (Phase 3 wires regime_engine.py)
    </div>
  </div>
</template>

<style scoped>
</style>
