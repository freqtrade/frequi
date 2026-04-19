<script setup lang="ts">
// SignalConfidence.vue — Phase 2 mock component
// Phase 3 will wire this to the real ML signal endpoint.

interface SignalRow {
  pair: string;
  signal: number;      // -1.0 to 1.0
  confidence: number;  // 0.0 to 1.0
  regimeGate: string;  // e.g. "Bull", "Any"
}

const CONFIDENCE_THRESHOLD = 0.55;

const MOCK_SIGNALS: SignalRow[] = [
  { pair: 'BTC/USDT', signal: 0.82, confidence: 0.91, regimeGate: 'Bull' },
  { pair: 'ETH/USDT', signal: 0.61, confidence: 0.74, regimeGate: 'Bull' },
  { pair: 'SOL/USDT', signal: -0.34, confidence: 0.48, regimeGate: 'Bear' },
  { pair: 'BNB/USDT', signal: 0.15, confidence: 0.57, regimeGate: 'Any' },
  { pair: 'XRP/USDT', signal: -0.72, confidence: 0.38, regimeGate: 'Bear' },
];

const signals = ref<SignalRow[]>(MOCK_SIGNALS);

// --- helpers ------------------------------------------------------------------

function isActive(row: SignalRow): boolean {
  return row.confidence >= CONFIDENCE_THRESHOLD;
}

/** Map signal [-1, 1] to a left-offset and width for a centred bar */
function signalBar(signal: number): { left: string; width: string; color: string } {
  const clamped = Math.max(-1, Math.min(1, signal));
  if (clamped >= 0) {
    return {
      left: '50%',
      width: `${clamped * 50}%`,
      color: '#22c55e',
    };
  } else {
    const w = Math.abs(clamped) * 50;
    return {
      left: `${50 - w}%`,
      width: `${w}%`,
      color: '#ef4444',
    };
  }
}

function signalLabel(signal: number): string {
  return (signal >= 0 ? '+' : '') + signal.toFixed(2);
}

function confidencePct(confidence: number): string {
  return `${(confidence * 100).toFixed(0)}%`;
}
</script>

<template>
  <div class="flex flex-col gap-3 p-4 rounded-lg border bg-surface-800 border-surface-600">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <span class="text-sm font-semibold uppercase tracking-widest text-surface-300">
        Signal Confidence
      </span>
      <span class="text-xs text-surface-500">threshold {{ (CONFIDENCE_THRESHOLD * 100).toFixed(0) }}%</span>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-surface-400 border-b border-surface-600">
            <th class="pb-2 pr-4 font-medium">Pair</th>
            <th class="pb-2 pr-4 font-medium">Signal</th>
            <th class="pb-2 pr-4 font-medium">Confidence</th>
            <th class="pb-2 pr-4 font-medium">Regime Gate</th>
            <th class="pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in signals"
            :key="row.pair"
            class="border-b border-surface-700 last:border-0"
          >
            <!-- Pair -->
            <td class="py-2 pr-4 font-mono font-medium text-surface-100 whitespace-nowrap">
              {{ row.pair }}
            </td>

            <!-- Signal bar -->
            <td class="py-2 pr-4">
              <div class="flex items-center gap-2">
                <div class="relative h-3 w-24 rounded-full bg-surface-700 overflow-hidden flex-shrink-0">
                  <!-- centre marker -->
                  <div class="absolute top-0 bottom-0 w-px bg-surface-500" style="left: 50%" />
                  <!-- fill -->
                  <div
                    class="absolute top-0 bottom-0 transition-all duration-500"
                    :style="{
                      left: signalBar(row.signal).left,
                      width: signalBar(row.signal).width,
                      backgroundColor: signalBar(row.signal).color,
                    }"
                  />
                </div>
                <span
                  class="text-xs font-mono w-10 text-right"
                  :class="row.signal >= 0 ? 'text-green-400' : 'text-red-400'"
                >
                  {{ signalLabel(row.signal) }}
                </span>
              </div>
            </td>

            <!-- Confidence -->
            <td class="py-2 pr-4">
              <div class="flex items-center gap-2">
                <div class="relative h-2 w-16 rounded-full bg-surface-700 overflow-hidden flex-shrink-0">
                  <div
                    class="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-500"
                    :style="{
                      width: confidencePct(row.confidence),
                      backgroundColor: row.confidence >= CONFIDENCE_THRESHOLD ? '#22c55e' : '#ef4444',
                    }"
                  />
                </div>
                <span class="text-xs text-surface-300 w-8">{{ confidencePct(row.confidence) }}</span>
              </div>
            </td>

            <!-- Regime Gate -->
            <td class="py-2 pr-4">
              <span class="text-xs text-surface-300">{{ row.regimeGate }}</span>
            </td>

            <!-- Status -->
            <td class="py-2">
              <span
                class="inline-block rounded px-2 py-0.5 text-xs font-semibold"
                :class="
                  isActive(row)
                    ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                "
              >
                {{ isActive(row) ? 'ACTIVE' : 'BLOCKED' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer note -->
    <div class="text-xs text-surface-500 text-center">
      Mock data &mdash; Phase 3 wires ML signal + regime gate backend
    </div>
  </div>
</template>

<style scoped>
</style>
