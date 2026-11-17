<script setup lang="ts">
import type {
  ColumnDef,
  KpiDef,
  SourceContext,
  ValueFormat,
  VizData,
  WidgetInstance,
} from '@/widgets/types';
import { SOURCES } from '@/widgets/sources';
import { resolveBots } from '@/widgets/helpers';
import { DIMENSIONS, metricFormat, pivot, rankGroups } from '@/widgets/analytics';

const props = defineProps<{ widget: WidgetInstance }>();

const botStore = useBotStore();

const source = computed(() => SOURCES[props.widget.source]);
const options = computed(() => props.widget.options);
const display = computed(() => props.widget.display);
const bots = computed(() => resolveBots(options.value));
const stake = computed(() => bots.value[0]?.stakeCurrency ?? '');

const loaded = shallowRef<unknown>(null);
const loading = ref(false);

async function load() {
  const src = source.value;
  if (!src?.load || display.value === 'native') return;
  loading.value = true;
  try {
    loaded.value = await src.load({
      options: options.value,
      bots: bots.value,
      stakeCurrency: stake.value,
    });
  } catch (e) {
    console.error(`Widget ${src.id} failed to load`, e);
  } finally {
    loading.value = false;
  }
}

watch(
  () => [
    props.widget.source,
    display.value,
    options.value.botScope,
    options.value.botId,
    options.value.period,
    options.value.periodCount,
    options.value.topN,
    bots.value.map((b) => b.botId).join(','),
  ],
  load,
  { immediate: true },
);

let timer: number | undefined;
watch(
  () => source.value?.refreshMs,
  (ms) => {
    window.clearInterval(timer);
    if (ms) timer = window.setInterval(load, ms);
  },
  { immediate: true },
);
onBeforeUnmount(() => window.clearInterval(timer));

const ctx = computed<SourceContext>(() => ({
  options: options.value,
  bots: bots.value,
  loaded: loaded.value,
  stakeCurrency: stake.value,
}));

const rows = computed(() =>
  display.value !== 'native' && display.value !== 'note' && source.value?.rows
    ? source.value.rows(ctx.value)
    : [],
);

// ----- Table / list -----
const visibleColumns = computed<ColumnDef[]>(() => {
  const all = source.value?.columns ?? [];
  let keys = options.value.columns;
  if (!keys?.length) {
    keys = all.filter((c) => c.defaultVisible).map((c) => c.key);
    // Multi-bot widgets show which bot a row belongs to.
    if (options.value.botScope !== 'selected' && all.some((c) => c.key === 'botName')) {
      keys = ['botName', ...keys];
    }
  }
  return keys.map((k) => all.find((c) => c.key === k)).filter((c): c is ColumnDef => !!c);
});

// ----- Stat tiles / gauges -----
const visibleKpis = computed<KpiDef[]>(() => {
  const all = source.value?.kpis ?? [];
  let keys = options.value.kpis;
  if (!keys?.length) {
    keys = all
      .filter((k) => (display.value === 'gauge' ? k.max !== undefined : k.defaultVisible))
      .map((k) => k.key);
  }
  return keys.map((k) => all.find((t) => t.key === k)).filter((t): t is KpiDef => !!t);
});
const usesKpis = computed(() => display.value === 'kpi' || display.value === 'gauge');
const kpiValues = computed(() =>
  usesKpis.value ? (source.value?.kpiValues?.(rows.value, ctx.value) ?? {}) : {},
);
const kpiPrevious = computed(() =>
  display.value === 'kpi' ? (source.value?.kpiPrevious?.(rows.value, ctx.value) ?? {}) : {},
);
const spark = computed(() =>
  display.value === 'kpi' ? (source.value?.sparkline?.(rows.value, ctx.value) ?? []) : [],
);

// ----- Charts -----
const chartView = computed(() => {
  const charts = source.value?.charts ?? [];
  return charts.find((c) => c.key === options.value.chartView) ?? charts[0];
});
const chartKind = computed(() => {
  const view = chartView.value;
  if (!view) return 'bar';
  const kind = options.value.chartKind;
  return kind && view.kinds.includes(kind) ? kind : view.kinds[0]!;
});
const chartData = computed<VizData>(() =>
  display.value === 'chart' && chartView.value
    ? chartView.value.build(rows.value, ctx.value)
    : { x: [], series: [] },
);

// ----- Leaderboard -----
const leaderboard = computed<{
  items: { key: string; value: number; count?: number }[];
  format: ValueFormat;
}>(() => {
  if (display.value !== 'leaderboard' || !source.value) return { items: [], format: 'number' };
  const topN = options.value.topN ?? 10;
  const rank = source.value.rank;
  if (rank) {
    // Pre-aggregated rows (one row per pair / bot / reason).
    const metric = rank.metrics.find((m) => m.key === options.value.metric) ?? rank.metrics[0]!;
    const items = rows.value
      .map((r) => ({
        key: String(r[rank.label] ?? ''),
        value: (r[metric.key] as number) ?? 0,
        count: r.count as number | undefined,
      }))
      .sort((a, b) => (options.value.bottom ? a.value - b.value : b.value - a.value))
      .slice(0, topN);
    return { items, format: metric.format ?? 'number' };
  }
  const metric = options.value.metric ?? 'profit_abs';
  return {
    items: rankGroups(rows.value, options.value.groupBy ?? 'pair', metric, {
      topN,
      bottom: options.value.bottom,
      basis: options.value.timeBasis,
    }),
    format: metricFormat(metric),
  };
});

// ----- Pivot -----
const pivotResult = computed(() =>
  display.value === 'pivot'
    ? pivot(
        rows.value,
        options.value.pivotRows ?? 'pair',
        options.value.pivotCols ?? 'month',
        options.value.metric ?? 'profit_abs',
        options.value.timeBasis,
      )
    : undefined,
);
const pivotRowLabel = computed(
  () => DIMENSIONS.find((d) => d.value === (options.value.pivotRows ?? 'pair'))?.label ?? '',
);

// ----- Feed -----
const feedItems = computed(() =>
  display.value === 'feed' ? (source.value?.feed?.(rows.value, ctx.value) ?? []) : [],
);

const nativeProps = computed(() => source.value?.nativeProps?.(ctx.value) ?? {});
const selectedId = computed(() => botStore.activeBot?.detailTradeId ?? null);
const needsBot = computed(
  () => !source.value?.standalone && display.value !== 'native' && bots.value.length === 0,
);

function onRowClick(row: Record<string, unknown>) {
  source.value?.onRowClick?.(row, ctx.value);
}

// Widgets live in the boards store; edit them through this alias.
const editable = computed(() => props.widget);
function onSort(key: string, desc: boolean) {
  editable.value.options.sortBy = key;
  editable.value.options.sortDesc = desc;
}
function onNoteUpdate(text: string) {
  editable.value.options.note = text;
}
</script>

<template>
  <div v-if="!source" class="p-4 text-sm text-muted">Unknown widget "{{ widget.source }}".</div>
  <div v-else-if="needsBot" class="p-4 text-sm text-muted">
    No bot in scope. Log in to a bot, or change this widget's bot scope.
  </div>
  <div v-else class="relative h-full">
    <UProgress
      v-if="loading && !loaded"
      animation="carousel"
      size="xs"
      class="absolute inset-x-0 top-0 z-10"
    />
    <component
      :is="source.native"
      v-if="display === 'native' && source.native"
      v-bind="nativeProps"
    />
    <WTable
      v-else-if="display === 'table'"
      :rows="rows"
      :columns="visibleColumns"
      :stake="stake"
      :sort-by="options.sortBy"
      :sort-desc="options.sortDesc ?? true"
      :page-size="options.pageSize ?? 25"
      :clickable="!!source.onRowClick"
      :selected-id="selectedId"
      @row-click="onRowClick"
      @sort="onSort"
    />
    <WList
      v-else-if="display === 'list' && source.list"
      :rows="rows"
      :def="source.list"
      :columns="source.columns ?? []"
      :stake="stake"
      :clickable="!!source.onRowClick"
      :selected-id="selectedId"
      @row-click="onRowClick"
    />
    <WKpi
      v-else-if="display === 'kpi'"
      :tiles="visibleKpis"
      :values="kpiValues"
      :previous="kpiPrevious"
      :spark="spark"
      :stake="stake"
      :variant="options.kpiStyle ?? 'tiles'"
    />
    <WGauge
      v-else-if="display === 'gauge'"
      :tiles="visibleKpis"
      :values="kpiValues"
      :variant="options.gaugeStyle ?? 'dial'"
      :stake="stake"
    />
    <WChart
      v-else-if="display === 'chart'"
      :data="chartData"
      :kind="chartKind"
      :stake="stake"
      :bins="options.bins ?? 20"
    />
    <WLeaderboard
      v-else-if="display === 'leaderboard'"
      :items="leaderboard.items"
      :format="leaderboard.format"
      :tone="leaderboard.format !== 'integer'"
      :stake="stake"
    />
    <WPivot
      v-else-if="display === 'pivot' && pivotResult"
      :result="pivotResult"
      :row-label="pivotRowLabel"
      :format="metricFormat(options.metric ?? 'profit_abs')"
      :diverging="(options.metric ?? 'profit_abs') !== 'count'"
      :stake="stake"
    />
    <WFeed v-else-if="display === 'feed'" :items="feedItems" :stake="stake" />
    <WNote v-else-if="display === 'note'" :text="options.note ?? ''" @update="onNoteUpdate" />
  </div>
</template>
