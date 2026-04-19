<script setup lang="ts">
// KillSwitch.vue — Phase 3
// Broadcasts emergency STOP to Freqtrade API + Hummingbot API.
// Double-confirmation gate prevents accidental activation.

const FREQTRADE_URL = 'http://localhost:8080/api/v1/stopbuy';
const HUMMINGBOT_URL = 'http://localhost:8000/stop';
const FREQTRADE_AUTH = 'Basic ' + btoa('freqtrade:freqtrade');

type CallStatus = 'idle' | 'pending' | 'success' | 'error';

const confirming = ref(false);
const ftStatus = ref<CallStatus>('idle');
const hbStatus = ref<CallStatus>('idle');
const ftError = ref('');
const hbError = ref('');
const activated = ref(false);

function requestStop() {
  confirming.value = true;
}

function cancel() {
  confirming.value = false;
}

async function confirmStop() {
  confirming.value = false;
  activated.value = true;
  ftStatus.value = 'pending';
  hbStatus.value = 'pending';

  // Freqtrade stopbuy
  try {
    const res = await fetch(FREQTRADE_URL, {
      method: 'POST',
      headers: { Authorization: FREQTRADE_AUTH },
    });
    ftStatus.value = res.ok ? 'success' : 'error';
    if (!res.ok) ftError.value = `HTTP ${res.status}`;
  } catch (e: any) {
    ftStatus.value = 'error';
    ftError.value = e.message ?? 'Network error';
  }

  // Hummingbot stop
  try {
    const res = await fetch(HUMMINGBOT_URL, { method: 'POST' });
    hbStatus.value = res.ok ? 'success' : 'error';
    if (!res.ok) hbError.value = `HTTP ${res.status}`;
  } catch (e: any) {
    hbStatus.value = 'error';
    hbError.value = e.message ?? 'Network error';
  }
}

function reset() {
  activated.value = false;
  ftStatus.value = 'idle';
  hbStatus.value = 'idle';
  ftError.value = '';
  hbError.value = '';
}

const statusIcon = (s: CallStatus) =>
  s === 'success' ? '✓' : s === 'error' ? '✗' : s === 'pending' ? '…' : '';
const statusColor = (s: CallStatus) =>
  s === 'success' ? 'text-green-400' : s === 'error' ? 'text-red-400' : 'text-surface-400';
</script>

<template>
  <div class="flex flex-col gap-3 p-4 rounded-lg border bg-surface-800 border-surface-600">
    <!-- Header -->
    <div class="flex items-center gap-1.5">
      <span class="text-sm font-semibold uppercase tracking-widest text-red-400">Kill Switch</span>
      <div class="group relative flex items-center">
        <i-mdi-information-outline class="text-surface-400 hover:text-surface-200 cursor-default text-base transition-colors" />
        <div class="pointer-events-none absolute left-4 top-full mt-2 w-64 md:w-72 max-w-[85vw] rounded-md bg-surface-700 border border-surface-500 px-3 py-2 text-xs text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg leading-5">
          <div class="absolute -top-1.5 left-3 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-surface-500" />
          Immediately halts all new buy orders on <strong>Freqtrade</strong> (stopbuy) and sends a stop signal to <strong>Hummingbot</strong>. Open positions are <strong>not</strong> force-closed — they remain until manually managed. Use when drawdown exceeds tolerance or an anomaly is detected.
        </div>
      </div>
    </div>

    <!-- Idle state: trigger button -->
    <div v-if="!confirming && !activated">
      <button
        class="w-full rounded-md border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/20 hover:border-red-400 transition-colors flex items-center justify-center gap-2"
        @click="requestStop"
      >
        <i-mdi-alert-octagon class="text-lg" />
        KILL SWITCH — EMERGENCY STOP
      </button>
    </div>

    <!-- Confirmation panel -->
    <div v-if="confirming" class="flex flex-col gap-3 rounded-md border border-orange-500/40 bg-orange-500/10 p-3">
      <p class="text-sm text-orange-300 font-medium text-center">
        ⚠ This will halt ALL new trades on Freqtrade and Hummingbot.<br />
        Open positions will NOT be closed automatically.
      </p>
      <div class="flex gap-2">
        <button
          class="flex-1 rounded-md bg-red-600 hover:bg-red-500 text-white text-sm font-bold py-2 transition-colors"
          @click="confirmStop"
        >
          Confirm Stop
        </button>
        <button
          class="flex-1 rounded-md border border-surface-500 hover:border-surface-300 text-surface-300 text-sm py-2 transition-colors"
          @click="cancel"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Result state -->
    <div v-if="activated && !confirming" class="flex flex-col gap-2">
      <div class="flex items-center justify-between text-sm rounded-md bg-surface-700 px-3 py-2">
        <span class="text-surface-300">Freqtrade stopbuy</span>
        <span :class="statusColor(ftStatus)" class="font-mono font-bold">
          {{ statusIcon(ftStatus) }}
          {{ ftStatus === 'error' ? ftError : ftStatus }}
        </span>
      </div>
      <div class="flex items-center justify-between text-sm rounded-md bg-surface-700 px-3 py-2">
        <span class="text-surface-300">Hummingbot stop</span>
        <span :class="statusColor(hbStatus)" class="font-mono font-bold">
          {{ statusIcon(hbStatus) }}
          {{ hbStatus === 'error' ? hbError : hbStatus }}
        </span>
      </div>
      <button
        class="w-full rounded-md border border-surface-500 hover:border-surface-300 text-surface-400 text-xs py-2 transition-colors mt-1"
        @click="reset"
      >
        Reset
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>
