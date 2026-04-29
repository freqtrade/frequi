<script setup lang="ts">
interface Lesson {
  date: string;
  content: string;
}

interface LearningStateSummary {
  total_closed_trades: number;
  win_rate: number;
  average_result_pct: number | null;
}

interface LearningStateAdjustments {
  disable_fallback_entry: boolean;
  min_score_for_fallback: number;
  max_rsi_for_fallback: number;
  require_liquidity_confirmation: boolean;
  require_behavior_confirmation: boolean;
}

interface LearningStateControls {
  risk_multiplier: number;
  cooldown_pairs: string[];
  disabled_entry_tags: string[];
  max_new_entries_per_hour: number | null;
  consecutive_loss_mode: boolean;
}

interface LearningState {
  generated_at: string | null;
  source: string;
  summary: LearningStateSummary;
  active_adjustments: LearningStateAdjustments;
  active_controls: LearningStateControls;
  reasons: string[];
  recommendations: string[];
  updated_at?: string;
}

const API_BASE = 'http://localhost:5001';

const MOCK_LESSONS: Lesson[] = [
  {
    date: '2026-04-18',
    content: `### What went wrong
- v15 stale exits reached review threshold on ETH/USDT:USDT
- Three consecutive losses triggered the mandatory 30-minute paper pause
- BTC/USDT:USDT short sweep had volume expansion but candle range was weak

### What to change tomorrow
- Keep v15 parameters locked and wait for guardrail reset before new paper entries`,
  },
  {
    date: '2026-04-17',
    content: `### What went wrong
- ETH/USDT:USDT underperformed in chop, matching the v15 bad-regime warning
- Rolling PF dipped near the 1.15 paper stop threshold

### What to change tomorrow
- Continue paper-only validation until 100 clean trades are collected`,
  },
  {
    date: '2026-04-16',
    content: `### What went wrong
- BTC/USDT:USDT produced fewer trades during low-volume chop
- No live eligibility yet because paper sample is below 100 trades

### What to change tomorrow
- Keep dry-run futures mode and monitor PF, WR, stale rate, and duration`,
  },
];

const DEFAULT_STATE: LearningState = {
  generated_at: null,
  source: 'v15_locked_config',
  summary: {
    total_closed_trades: 0,
    win_rate: 0,
    average_result_pct: null,
  },
  active_adjustments: {
    disable_fallback_entry: true,
    min_score_for_fallback: 3,
    max_rsi_for_fallback: 70,
    require_liquidity_confirmation: false,
    require_behavior_confirmation: false,
  },
  active_controls: {
    risk_multiplier: 1,
    cooldown_pairs: [],
    disabled_entry_tags: [],
    max_new_entries_per_hour: null,
    consecutive_loss_mode: false,
  },
  reasons: [],
  recommendations: [],
};

const lessons = ref<Lesson[]>(MOCK_LESSONS);
const learningState = ref<LearningState>(DEFAULT_STATE);
const runStatus = ref<'idle' | 'triggered'>('idle');
const isLive = ref(false);
const stateLive = ref(false);
let learningPollTimer: number | undefined;

const stateCards = computed(() => [
  {
    label: 'Closed trades',
    value: learningState.value.summary.total_closed_trades,
  },
  {
    label: 'Win rate',
    value: `${learningState.value.summary.win_rate}%`,
  },
  {
    label: 'Average result',
    value:
      learningState.value.summary.average_result_pct === null
        ? 'n/a'
        : `${learningState.value.summary.average_result_pct}%`,
  },
]);

function parseLesson(content: string): Record<string, string[]> {
  const sections: Record<string, string[]> = {};
  let currentSection = 'General';
  sections[currentSection] = [];

  content.split('\n').forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return;
    }

    if (trimmed.startsWith('###')) {
      currentSection = trimmed.replace(/^###\s*/, '').trim() || 'General';
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
      return;
    }

    if (!sections[currentSection]) {
      sections[currentSection] = [];
    }

    sections[currentSection].push(trimmed);
  });

  return sections;
}

const riskBanner = computed(() => {
  const summary = learningState.value.summary;
  const reasons = new Set(learningState.value.reasons);

  const totalClosed = summary.total_closed_trades ?? 0;
  const winRate = summary.win_rate ?? 0;
  const avgResult = summary.average_result_pct;

  const severeReasons = [
    'v15_stale_exit',
    'v15_entry_gate_missing',
    'v15_atr_expansion_missing',
    'v15_volume_expansion_missing',
    'v15_range_too_small',
  ];
  const severeReasonCount = severeReasons.filter((r) => reasons.has(r)).length;

  if (
    totalClosed >= 3 &&
    (winRate < 42 ||
      (avgResult !== null && avgResult < 0) ||
      learningState.value.active_controls.consecutive_loss_mode ||
      severeReasonCount >= 2)
  ) {
    return {
      marketCondition: 'BAD',
      confidence: 'LOW',
      suggestedRiskLabel: '0x',
      suggestedRisk: 0,
      reason: 'A v15 paper guardrail is active. Stop new entries until the review condition clears.',
    };
  } else if (
    totalClosed >= 100 &&
    winRate >= 48 &&
    (avgResult === null || avgResult > 0) &&
    severeReasonCount === 0
  ) {
    return {
      marketCondition: 'GOOD',
      confidence: 'HIGH',
      suggestedRiskLabel: '1x',
      suggestedRisk: 1.0,
      reason:
        'Paper sample meets the v15 eligibility floor. Validate PF, stale rate, and duration before live consideration.',
    };
  }

  return {
    marketCondition: 'NEUTRAL',
    confidence: totalClosed >= 3 ? 'MEDIUM' : 'LOW',
    suggestedRiskLabel: '1x',
    suggestedRisk: 1.0,
    reason: 'Paper validation is still collecting evidence. v15 requires 100 clean trades before live eligibility.',
  };
});

async function fetchLessons() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/learning/lessons`);
    if (!res.ok) {
      throw new Error('Failed to fetch lessons');
    }

    const data = await res.json();

    if (data.lessons && data.lessons.length > 0) {
      lessons.value = data.lessons;
      isLive.value = true;
    } else {
      lessons.value = MOCK_LESSONS;
      isLive.value = false;
    }
  } catch {
    lessons.value = MOCK_LESSONS;
    isLive.value = false;
  }
}

async function fetchLearningState() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/learning/state`);
    if (!res.ok) {
      throw new Error('Failed to fetch learning state');
    }

    const data = await res.json();
    learningState.value = {
      ...DEFAULT_STATE,
      ...data,
      summary: {
        ...DEFAULT_STATE.summary,
        ...(data.summary ?? {}),
      },
      active_adjustments: {
        ...DEFAULT_STATE.active_adjustments,
        ...(data.active_adjustments ?? {}),
      },
      active_controls: {
        ...DEFAULT_STATE.active_controls,
        ...(data.active_controls ?? {}),
      },
      reasons: Array.isArray(data.reasons) ? data.reasons : [],
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    };
    stateLive.value = true;
  } catch {
    learningState.value = DEFAULT_STATE;
    stateLive.value = false;
  }
}

async function fetchAllLearningData() {
  await Promise.all([fetchLessons(), fetchLearningState()]);
}

async function runNow() {
  runStatus.value = 'triggered';
  try {
    await fetch(`${API_BASE}/api/v1/learning/run`, { method: 'POST' });
  } catch {
    // Keep UI responsive even if API call fails.
  }
  await new Promise((r) => setTimeout(r, 2000));
  await fetchAllLearningData();
  runStatus.value = 'idle';
}

onMounted(() => {
  fetchAllLearningData();

  learningPollTimer = window.setInterval(() => {
    fetchAllLearningData();
  }, 30000);
});

onUnmounted(() => {
  if (learningPollTimer) {
    clearInterval(learningPollTimer);
  }
});
</script>

<template>
  <div class="flex flex-col gap-4 p-4 md:p-6 min-h-screen bg-surface-900">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <i-mdi-brain class="text-2xl text-primary-400" />
        <h1 class="text-xl font-bold uppercase tracking-widest text-surface-200">Learning Loop</h1>
        <span
          class="text-xs px-1.5 py-0.5 rounded font-semibold"
          :class="isLive ? 'bg-green-500/20 text-green-400' : 'bg-surface-600 text-surface-500'"
        >
          {{ isLive ? 'LIVE' : 'DEMO' }}
        </span>
        <div class="group relative flex items-center">
          <i-mdi-information-outline
            class="text-surface-400 hover:text-surface-200 cursor-default text-base transition-colors"
          />
          <div
            class="pointer-events-none absolute left-6 top-full mt-2 w-64 md:w-80 max-w-[90vw] rounded-md bg-surface-700 border border-surface-500 px-3 py-2 text-xs text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg leading-5"
          >
            <div
              class="absolute -top-1.5 left-3 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-surface-500"
            />
            Reviews recent trades to learn from wins and losses, highlights what went wrong, and
            suggests how to improve the next trades. Runs automatically as new results come in, or
            manually anytime with Run Now.
          </div>
        </div>
      </div>

      <button
        :disabled="runStatus === 'triggered'"
        class="flex items-center gap-2 px-3 py-2 rounded border text-sm font-semibold transition-colors"
        :class="
          runStatus === 'triggered'
            ? 'bg-green-500/20 text-green-400 border-green-500/40 cursor-not-allowed'
            : 'bg-surface-700 hover:bg-surface-600 text-surface-300 border-surface-500'
        "
        @click="runNow"
      >
        <i-mdi-play v-if="runStatus === 'idle'" />
        <i-mdi-check v-else />
        {{ runStatus === 'triggered' ? 'Triggered!' : 'Run Now' }}
      </button>
    </div>

    <div
      class="rounded-lg border border-surface-600 p-4 flex flex-col gap-3"
      :class="{
        'bg-red-500/10': riskBanner.marketCondition === 'BAD',
        'bg-yellow-500/10': riskBanner.marketCondition === 'NEUTRAL',
        'bg-green-500/10': riskBanner.marketCondition === 'GOOD',
      }"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="rounded-md border border-surface-600 bg-surface-900/50 p-3">
          <div class="text-xs uppercase tracking-wide text-surface-500">Market Condition</div>
          <div
            class="text-lg font-semibold mt-1"
            :class="{
              'text-red-400': riskBanner.marketCondition === 'BAD',
              'text-yellow-300': riskBanner.marketCondition === 'NEUTRAL',
              'text-green-400': riskBanner.marketCondition === 'GOOD',
            }"
          >
            {{ riskBanner.marketCondition }}
          </div>
        </div>

        <div class="rounded-md border border-surface-600 bg-surface-900/50 p-3">
          <div class="text-xs uppercase tracking-wide text-surface-500">Confidence</div>
          <div class="text-lg font-semibold text-surface-200 mt-1">
            {{ riskBanner.confidence }}
          </div>
        </div>

        <div class="rounded-md border border-surface-600 bg-surface-900/50 p-3">
          <div class="text-xs uppercase tracking-wide text-surface-500">Suggested Risk</div>
          <div class="text-lg font-semibold text-primary-300 mt-1">
            {{ riskBanner.suggestedRiskLabel }}
          </div>
        </div>
      </div>

      <div class="text-sm text-surface-300 text-left">
        {{ riskBanner.reason }}
      </div>
    </div>

    <div class="rounded-lg border bg-surface-800 border-surface-600 p-4 flex flex-col gap-4">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-surface-200">
            Active Learning State
          </h2>
          <span
            class="text-xs px-1.5 py-0.5 rounded font-semibold"
            :class="
              stateLive ? 'bg-green-500/20 text-green-400' : 'bg-surface-600 text-surface-500'
            "
          >
            {{ stateLive ? 'LIVE STATE' : 'DEFAULT STATE' }}
          </span>
        </div>
        <div class="text-xs text-surface-500">
          Updated:
          {{ learningState.updated_at || learningState.generated_at || 'n/a' }}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          v-for="card in stateCards"
          :key="card.label"
          class="rounded-md border border-surface-600 bg-surface-900/50 p-3"
        >
          <div class="text-xs uppercase tracking-wide text-surface-500">{{ card.label }}</div>
          <div class="text-lg font-semibold text-surface-200 mt-1">{{ card.value }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="rounded-md border border-surface-600 bg-surface-900/50 p-3">
          <div class="text-xs uppercase tracking-wide text-surface-500 mb-2">
            Locked v15 state
          </div>
          <ul class="text-sm text-surface-300 space-y-2">
            <li class="flex justify-between gap-3">
              <span>Fallback disabled</span>
              <span class="font-semibold">
                {{ learningState.active_adjustments.disable_fallback_entry }}
              </span>
            </li>
            <li class="flex justify-between gap-3">
              <span>Risk multiplier</span>
              <span class="font-semibold">{{ learningState.active_controls.risk_multiplier }}x</span>
            </li>
            <li class="flex justify-between gap-3">
              <span>Consecutive-loss pause</span>
              <span class="font-semibold">
                {{ learningState.active_controls.consecutive_loss_mode }}
              </span>
            </li>
            <li class="flex justify-between gap-3">
              <span>Max new entries / hour</span>
              <span class="font-semibold">
                {{ learningState.active_controls.max_new_entries_per_hour ?? 'unlimited' }}
              </span>
            </li>
            <li class="flex justify-between gap-3">
              <span>Disabled tags</span>
              <span class="font-semibold">
                {{ learningState.active_controls.disabled_entry_tags.length }}
              </span>
            </li>
          </ul>
        </div>

        <div class="rounded-md border border-surface-600 bg-surface-900/50 p-3">
          <div class="text-xs uppercase tracking-wide text-surface-500 mb-2">
            Why these rules are active
          </div>
          <ul v-if="learningState.reasons.length > 0" class="text-sm text-surface-300 space-y-1">
            <li v-for="reason in learningState.reasons" :key="reason">- {{ reason }}</li>
          </ul>
          <div v-else class="text-sm text-surface-500">No learning reasons available yet.</div>
        </div>
      </div>

      <div class="rounded-md border border-surface-600 bg-surface-900/50 p-3">
        <div class="text-xs uppercase tracking-wide text-surface-500 mb-2">
          What to change tomorrow
        </div>
        <ul
          v-if="learningState.recommendations.length > 0"
          class="text-sm text-surface-300 space-y-1"
        >
          <li v-for="recommendation in learningState.recommendations" :key="recommendation">
            - {{ recommendation }}
          </li>
        </ul>
        <div v-else class="text-sm text-surface-500">No recommendations available yet.</div>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <div
        v-for="lesson in lessons"
        :key="`${lesson.date}-${lesson.content}`"
        class="rounded-lg border bg-surface-800 border-surface-600 p-4 flex flex-col gap-4"
      >
        <div class="flex items-center gap-2">
          <span
            class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-primary-600/30 text-primary-300 border border-primary-500/40"
          >
            {{ lesson.date }}
          </span>
          <span class="text-xs text-surface-500">Learning Report</span>
        </div>

        <div class="flex flex-col gap-4">
          <div
            v-for="(lines, section) in parseLesson(lesson.content)"
            :key="section"
            class="rounded-md border border-surface-600 bg-surface-900/50 p-3"
          >
            <div class="text-xs font-semibold uppercase tracking-wide text-primary-400 mb-2">
              {{ section }}
            </div>

            <ul v-if="lines.length > 0" class="text-sm text-surface-300 space-y-1 text-left">
              <li v-for="line in lines" :key="line" class="leading-5">
                - {{ line.replace(/^-\s*/, '').trim() }}
              </li>
            </ul>

            <div v-else class="text-sm text-surface-500">No entries in this section.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-xs text-surface-500 text-center mt-auto">
      {{ isLive ? 'Live data from learning_loop.py' : 'Demo data · API unreachable' }}
      · API: {{ API_BASE }}
      · lessons + learning_state
    </div>
  </div>
</template>
