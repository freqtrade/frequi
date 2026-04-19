<script setup lang="ts">
interface Lesson {
  date: string;
  content: string;
}

const MOCK_LESSONS: Lesson[] = [
  {
    date: '2026-04-18',
    content: `- BTC/USDT long entered during Distribution regime — regime gate should have blocked this; threshold needs tightening to 0.65
- 3 exits via stop_loss in Bear state within 2-hour window — consider pause on new longs when consecutive stops > 2
- SOL/USDT signal confidence 0.51 slipped through — confidence floor needs hard enforcement at 0.55
- Improvement: add consecutive-loss circuit breaker (3 losses → 30-min cooldown)`,
  },
  {
    date: '2026-04-17',
    content: `- Mean reversion signal overrode trend in Bull regime — weight rebalance needed (current 0.70/0.30 trend/MR for Bull is correct, check aggregator)
- ETH/USDT VWAP deviation fade triggered 4x within 6 hours — possible whipsaw in ranging market; add minimum time between MR signals (15 min)
- Funding rate z-score hit 2.3 but signal was only bearish -0.34 — investigate scaling
- Improvement: add VWAP MR cooldown timer per pair`,
  },
  {
    date: '2026-04-16',
    content: `- Regime transition from Bull → Distribution mid-position not handled — position was held at full size
- Kelly sizer returned 0.0 on 3 pairs due to drawdown guard — this is correct behavior, log as INFO not WARNING
- XRP/USDT panic regime correctly blocked all entries — regime gate working as intended
- Improvement: on regime downgrade (Bull→Distribution), reduce position size by 50% within next 5-min candle`,
  },
];

const lessons = ref<Lesson[]>(MOCK_LESSONS);
const runStatus = ref<'idle' | 'triggered'>('idle');

async function runNow() {
  runStatus.value = 'triggered';
  await new Promise(r => setTimeout(r, 2000));
  runStatus.value = 'idle';
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4 md:p-6 min-h-screen bg-surface-900">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <i-mdi-brain class="text-2xl text-primary-400" />
        <h1 class="text-xl font-bold uppercase tracking-widest text-surface-200">Learning Loop</h1>
        <div class="group relative flex items-center">
          <i-mdi-information-outline class="text-surface-400 hover:text-surface-200 cursor-default text-base transition-colors" />
          <div class="pointer-events-none absolute left-6 top-full mt-2 w-64 md:w-80 max-w-[90vw] rounded-md bg-surface-700 border border-surface-500 px-3 py-2 text-xs text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg leading-5">
            <div class="absolute -top-1.5 left-3 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-surface-500" />
            Each night at 02:00 UTC, <strong>learning_loop.py</strong> reads yesterday's trade log from SQLite, sends it to <strong>Claude claude-opus-4-7</strong>, and appends the failure analysis + actionable improvements to <code>learning/failure_log.md</code>. The lessons shown here are parsed from that file.
          </div>
        </div>
      </div>
      <button
        :disabled="runStatus === 'triggered'"
        class="flex items-center gap-2 px-3 py-2 rounded border text-sm font-semibold transition-colors"
        :class="runStatus === 'triggered'
          ? 'bg-green-500/20 text-green-400 border-green-500/40 cursor-not-allowed'
          : 'bg-surface-700 hover:bg-surface-600 text-surface-300 border-surface-500'"
        @click="runNow"
      >
        <i-mdi-play v-if="runStatus === 'idle'" />
        <i-mdi-check v-else />
        {{ runStatus === 'triggered' ? 'Triggered!' : 'Run Now' }}
      </button>
    </div>

    <!-- Lesson Cards -->
    <div class="flex flex-col gap-3">
      <div
        v-for="lesson in lessons"
        :key="lesson.date"
        class="rounded-lg border bg-surface-800 border-surface-600 p-4 flex flex-col gap-2"
      >
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-primary-600/30 text-primary-300 border border-primary-500/40">
            {{ lesson.date }}
          </span>
          <span class="text-xs text-surface-500">Claude Analysis</span>
        </div>
        <pre class="text-xs text-surface-300 whitespace-pre-wrap leading-5 font-sans">{{ lesson.content }}</pre>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-xs text-surface-500 text-center mt-auto">
      Mock data · Next scheduled run: Tonight at 02:00 UTC · failure_log.md
    </div>
  </div>
</template>
