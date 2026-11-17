<script setup lang="ts">
import type { DisplayType } from '@/widgets/types';
import { CHART_KIND_LABELS, DISPLAY_LABELS, SOURCES, SOURCE_LIST } from '@/widgets/sources';
import { TIME_RANGES } from '@/widgets/helpers';
import { DIMENSIONS, METRICS } from '@/widgets/analytics';

const props = defineProps<{ boardId: string }>();

const boardsStore = useBoardsStore();
const botStore = useBotStore();

const widget = computed(() =>
  boardsStore.boards[props.boardId]?.widgets.find((w) => w.id === boardsStore.settingsWidgetId),
);
const source = computed(() => (widget.value ? SOURCES[widget.value.source] : undefined));
const opts = computed(() => widget.value!.options);
// Non-null aliases for the drawer body, which only renders while a widget is open.
const w = computed(() => widget.value!);
const src = computed(() => source.value!);

const open = computed({
  get: () => !!widget.value,
  set: (v: boolean) => {
    if (!v) boardsStore.settingsWidgetId = null;
  },
});

const sourceItems = computed(() =>
  SOURCE_LIST.map((s) => ({ label: `${s.category} · ${s.label}`, value: s.id })),
);

function changeSource(id: string) {
  if (!widget.value || !SOURCES[id]) return;
  widget.value.source = id;
  widget.value.display = SOURCES[id]!.defaultDisplay;
  // Columns, KPIs and chart views are specific to a source.
  delete opts.value.columns;
  delete opts.value.kpis;
  delete opts.value.chartView;
  delete opts.value.sortBy;
}

function setDisplay(d: DisplayType) {
  if (widget.value) widget.value.display = d;
}

// ----- Columns -----
const allColumns = computed(() => source.value?.columns ?? []);
const effectiveColumns = computed(() => {
  if (opts.value.columns?.length) return opts.value.columns;
  const keys = allColumns.value.filter((c) => c.defaultVisible).map((c) => c.key);
  return opts.value.botScope !== 'selected' && allColumns.value.some((c) => c.key === 'botName')
    ? ['botName', ...keys]
    : keys;
});
const orderedColumns = computed(() => [
  ...effectiveColumns.value
    .map((k) => allColumns.value.find((c) => c.key === k))
    .filter((c) => !!c),
  ...allColumns.value.filter((c) => !effectiveColumns.value.includes(c.key)),
]);

function resetColumns() {
  delete opts.value.columns;
}
function toggleColumn(key: string, on: boolean) {
  const cur = [...effectiveColumns.value];
  opts.value.columns = on ? [...cur, key] : cur.filter((k) => k !== key);
}
function moveColumn(key: string, dir: -1 | 1) {
  const cur = [...effectiveColumns.value];
  const i = cur.indexOf(key);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= cur.length) return;
  [cur[i], cur[j]] = [cur[j]!, cur[i]!];
  opts.value.columns = cur;
}

// ----- KPIs -----
const allKpis = computed(() => source.value?.kpis ?? []);
const effectiveKpis = computed(() =>
  opts.value.kpis?.length
    ? opts.value.kpis
    : allKpis.value
        .filter((k) => (widget.value?.display === 'gauge' ? k.max !== undefined : k.defaultVisible))
        .map((k) => k.key),
);
function toggleKpi(key: string, on: boolean) {
  const cur = [...effectiveKpis.value];
  opts.value.kpis = on ? [...cur, key] : cur.filter((k) => k !== key);
}

// ----- Chart -----
const charts = computed(() => source.value?.charts ?? []);
const chartView = computed(
  () => charts.value.find((c) => c.key === opts.value.chartView) ?? charts.value[0],
);
const chartControls = computed(() => chartView.value?.controls ?? []);

// ----- Metric / grouping choices -----
const dimensionItems = DIMENSIONS.map((d) => ({ label: d.label, value: d.value }));
/** Leaderboards over pre-aggregated rows offer that source's own metrics. */
const metricItems = computed(() =>
  widget.value?.display === 'leaderboard' && source.value?.rank
    ? source.value.rank.metrics.map((m) => ({ label: m.label, value: m.key }))
    : METRICS.map((m) => ({ label: m.label, value: m.value })),
);
const showMetric = computed(
  () =>
    (widget.value?.display === 'chart' && chartControls.value.includes('metric')) ||
    widget.value?.display === 'leaderboard' ||
    widget.value?.display === 'pivot',
);
const showGroupBy = computed(
  () =>
    (widget.value?.display === 'chart' && chartControls.value.includes('groupBy')) ||
    (widget.value?.display === 'leaderboard' && !!source.value?.groupable),
);
const showTopN = computed(
  () =>
    (widget.value?.display === 'chart' && chartControls.value.includes('topN')) ||
    widget.value?.display === 'leaderboard',
);
const showTimeBasis = computed(
  () =>
    (widget.value?.display === 'chart' && chartControls.value.includes('timeBasis')) ||
    widget.value?.display === 'pivot',
);

const botItems = computed(() =>
  botStore.availableBotsSorted.map((b) => ({ label: b.botName, value: b.botId })),
);
const scopeItems = [
  { label: 'Selected bot', value: 'selected' },
  { label: 'All selected bots', value: 'all' },
  { label: 'A specific bot', value: 'bot' },
];
const filterKeys = computed(() => source.value?.supports?.filters ?? []);

function duplicate() {
  if (widget.value) boardsStore.duplicateWidget(props.boardId, widget.value.id);
}
function remove() {
  if (!widget.value) return;
  boardsStore.removeWidget(props.boardId, widget.value.id);
  boardsStore.settingsWidgetId = null;
}
</script>

<template>
  <USlideover v-model:open="open" side="right" :title="widget?.title || source?.label || 'Widget'">
    <template #description>
      <span class="text-sm text-muted">{{ source?.description }}</span>
    </template>
    <template #body>
      <div v-if="widget && source" class="flex flex-col gap-5 text-sm">
        <!-- General -->
        <section class="flex flex-col gap-2">
          <label class="font-medium" for="widget-title">Title</label>
          <UInput id="widget-title" v-model="w.title" :placeholder="src.label" class="w-full" />
          <label class="font-medium">Data</label>
          <USelect
            :model-value="w.source"
            :items="sourceItems"
            class="w-full"
            @update:model-value="(v) => changeSource(String(v))"
          />
        </section>

        <!-- Display -->
        <section class="flex flex-col gap-2">
          <span class="font-medium">Display as</span>
          <div class="flex flex-wrap gap-1">
            <UButton
              v-for="d in src.displays"
              :key="d"
              size="sm"
              color="neutral"
              :variant="w.display === d ? 'solid' : 'outline'"
              :icon="DISPLAY_LABELS[d]?.icon"
              :label="DISPLAY_LABELS[d]?.label"
              @click="setDisplay(d)"
            />
          </div>
        </section>

        <!-- Chart options -->
        <section v-if="w.display === 'chart' && charts.length" class="flex flex-col gap-2">
          <span class="font-medium">Chart</span>
          <USelect
            :model-value="chartView?.key"
            :items="charts.map((c) => ({ label: c.label, value: c.key }))"
            class="w-full"
            @update:model-value="(v) => (opts.chartView = String(v))"
          />
          <div class="flex gap-1">
            <UButton
              v-for="k in chartView?.kinds ?? []"
              :key="k"
              size="sm"
              color="neutral"
              :variant="(opts.chartKind ?? chartView?.kinds[0]) === k ? 'solid' : 'outline'"
              :icon="CHART_KIND_LABELS[k]?.icon"
              :label="CHART_KIND_LABELS[k]?.label ?? k"
              @click="opts.chartKind = k"
            />
          </div>
          <div v-if="chartControls.includes('bins')" class="flex items-center gap-2">
            <label class="grow" for="widget-bins">Histogram bins</label>
            <UInputNumber
              id="widget-bins"
              :model-value="opts.bins ?? 20"
              :min="5"
              :max="100"
              class="w-28"
              @update:model-value="(v) => (opts.bins = Number(v) || 20)"
            />
          </div>
        </section>

        <!-- Measure / grouping (charts, leaderboards, pivots) -->
        <section
          v-if="showMetric || showGroupBy || showTopN || showTimeBasis || w.display === 'pivot'"
          class="flex flex-col gap-2"
        >
          <span class="font-medium">Measure</span>
          <template v-if="w.display === 'pivot'">
            <div class="flex items-center gap-2">
              <span class="w-16 text-muted">Rows</span>
              <USelect
                :model-value="opts.pivotRows ?? 'pair'"
                :items="dimensionItems"
                class="grow"
                @update:model-value="(v) => (opts.pivotRows = v as never)"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="w-16 text-muted">Columns</span>
              <USelect
                :model-value="opts.pivotCols ?? 'month'"
                :items="dimensionItems"
                class="grow"
                @update:model-value="(v) => (opts.pivotCols = v as never)"
              />
            </div>
          </template>
          <div v-if="showMetric" class="flex items-center gap-2">
            <span class="w-16 text-muted">Value</span>
            <USelect
              :model-value="opts.metric ?? metricItems[0]?.value"
              :items="metricItems"
              class="grow"
              @update:model-value="(v) => (opts.metric = v as never)"
            />
          </div>
          <div v-if="showGroupBy" class="flex items-center gap-2">
            <span class="w-16 text-muted">Group by</span>
            <USelect
              :model-value="opts.groupBy ?? 'pair'"
              :items="dimensionItems"
              class="grow"
              @update:model-value="(v) => (opts.groupBy = v as never)"
            />
          </div>
          <div v-if="showTopN" class="flex items-center gap-2">
            <label class="grow" for="widget-topn">Show top</label>
            <UInputNumber
              id="widget-topn"
              :model-value="opts.topN ?? 10"
              :min="1"
              :max="50"
              class="w-28"
              @update:model-value="(v) => (opts.topN = Number(v) || 10)"
            />
          </div>
          <div v-if="w.display === 'leaderboard'" class="flex gap-1">
            <UButton
              size="sm"
              color="neutral"
              :variant="!opts.bottom ? 'solid' : 'outline'"
              icon="i-mdi-sort-descending"
              label="Best first"
              @click="opts.bottom = false"
            />
            <UButton
              size="sm"
              color="neutral"
              :variant="opts.bottom ? 'solid' : 'outline'"
              icon="i-mdi-sort-ascending"
              label="Worst first"
              @click="opts.bottom = true"
            />
          </div>
          <div v-if="showTimeBasis" class="flex items-center gap-2">
            <span class="w-16 text-muted">Time of</span>
            <USelect
              :model-value="opts.timeBasis ?? 'close'"
              :items="[
                { label: 'Trade exit', value: 'close' },
                { label: 'Trade entry', value: 'open' },
              ]"
              class="grow"
              @update:model-value="(v) => (opts.timeBasis = v as 'open' | 'close')"
            />
          </div>
        </section>

        <!-- Note -->
        <section v-if="w.display === 'note'" class="flex flex-col gap-2">
          <label class="font-medium" for="widget-note">Note (markdown)</label>
          <UTextarea
            id="widget-note"
            v-model="opts.note"
            :rows="12"
            autoresize
            class="w-full font-mono"
            placeholder="## Heading&#10;- [ ] checklist item&#10;**bold**, *italic*, [link](https://…)"
          />
          <p class="text-xs text-muted">
            Supports headings, bold, italic, code, links, lists and checklists. Checklist items can
            be ticked directly on the board.
          </p>
        </section>

        <!-- Columns -->
        <section
          v-if="(w.display === 'table' || w.display === 'list') && allColumns.length"
          class="flex flex-col gap-2"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium">{{
              w.display === 'table' ? 'Columns' : 'Fields (table)'
            }}</span>
            <UButton
              v-if="opts.columns"
              size="xs"
              color="neutral"
              variant="ghost"
              label="Defaults"
              @click="resetColumns"
            />
          </div>
          <ul class="flex flex-col gap-0.5">
            <li
              v-for="c in orderedColumns"
              :key="c.key"
              class="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/5"
            >
              <UCheckbox
                :model-value="effectiveColumns.includes(c.key)"
                :label="c.label"
                class="grow"
                @update:model-value="(v) => toggleColumn(c.key, !!v)"
              />
              <template v-if="effectiveColumns.includes(c.key)">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-mdi-arrow-up"
                  :aria-label="`Move ${c.label} up`"
                  @click="moveColumn(c.key, -1)"
                />
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-mdi-arrow-down"
                  :aria-label="`Move ${c.label} down`"
                  @click="moveColumn(c.key, 1)"
                />
              </template>
            </li>
          </ul>
          <template v-if="w.display === 'table'">
            <label class="font-medium" for="widget-page-size">Rows per page</label>
            <USelect
              id="widget-page-size"
              :model-value="opts.pageSize ?? 25"
              :items="[10, 15, 25, 50, 100, 500]"
              class="w-full"
              @update:model-value="(v) => (opts.pageSize = Number(v))"
            />
          </template>
        </section>

        <!-- KPIs -->
        <section
          v-if="(w.display === 'kpi' || w.display === 'gauge') && allKpis.length"
          class="flex flex-col gap-2"
        >
          <span class="font-medium">{{ w.display === 'gauge' ? 'Gauges' : 'Tiles' }}</span>
          <div class="flex gap-1">
            <template v-if="w.display === 'kpi'">
              <UButton
                size="sm"
                color="neutral"
                :variant="(opts.kpiStyle ?? 'tiles') === 'tiles' ? 'solid' : 'outline'"
                icon="i-mdi-view-grid-outline"
                label="Tiles"
                @click="opts.kpiStyle = 'tiles'"
              />
              <UButton
                size="sm"
                color="neutral"
                :variant="opts.kpiStyle === 'big' ? 'solid' : 'outline'"
                icon="i-mdi-format-size"
                label="Big numbers"
                @click="opts.kpiStyle = 'big'"
              />
            </template>
            <template v-else>
              <UButton
                size="sm"
                color="neutral"
                :variant="(opts.gaugeStyle ?? 'dial') === 'dial' ? 'solid' : 'outline'"
                icon="i-mdi-gauge"
                label="Dials"
                @click="opts.gaugeStyle = 'dial'"
              />
              <UButton
                size="sm"
                color="neutral"
                :variant="opts.gaugeStyle === 'bar' ? 'solid' : 'outline'"
                icon="i-mdi-progress-check"
                label="Bars"
                @click="opts.gaugeStyle = 'bar'"
              />
            </template>
          </div>
          <div class="grid grid-cols-2 gap-1">
            <UCheckbox
              v-for="k in allKpis"
              :key="k.key"
              :model-value="effectiveKpis.includes(k.key)"
              :label="k.label"
              @update:model-value="(v) => toggleKpi(k.key, !!v)"
            />
          </div>
        </section>

        <!-- Data scope -->
        <section
          v-if="src.supports?.botScope || src.supports?.timeRange || src.supports?.period"
          class="flex flex-col gap-2"
        >
          <span class="font-medium">Data scope</span>
          <template v-if="src.supports?.botScope">
            <USelect v-model="opts.botScope" :items="scopeItems" class="w-full" />
            <USelect
              v-if="opts.botScope === 'bot'"
              v-model="opts.botId"
              :items="botItems"
              placeholder="Choose bot"
              class="w-full"
            />
          </template>
          <USelect
            v-if="src.supports?.timeRange"
            v-model="opts.timeRange"
            :items="TIME_RANGES.map((t) => ({ label: t.label, value: t.value }))"
            class="w-full"
          />
          <div v-if="src.supports?.period" class="flex gap-2">
            <USelect
              :model-value="opts.period ?? 'daily'"
              :items="[
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' },
              ]"
              class="grow"
              @update:model-value="(v) => (opts.period = v as 'daily' | 'weekly' | 'monthly')"
            />
            <UInputNumber
              :model-value="opts.periodCount ?? 30"
              :min="1"
              :max="365"
              class="w-28"
              aria-label="Number of periods"
              @update:model-value="(v) => (opts.periodCount = Number(v) || 30)"
            />
          </div>
        </section>

        <!-- Filters -->
        <section v-if="filterKeys.length && w.display !== 'native'" class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="font-medium">Filters</span>
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              label="Clear"
              @click="opts.filters = {}"
            />
          </div>
          <UInput
            v-if="filterKeys.includes('pair')"
            v-model="opts.filters.pair"
            placeholder="Pair contains… (e.g. BTC)"
            class="w-full"
          />
          <div class="flex gap-2">
            <USelect
              v-if="filterKeys.includes('side')"
              :model-value="opts.filters.side ?? 'all'"
              :items="[
                { label: 'Long and short', value: 'all' },
                { label: 'Long only', value: 'long' },
                { label: 'Short only', value: 'short' },
              ]"
              class="grow"
              @update:model-value="(v) => (opts.filters.side = v as 'all' | 'long' | 'short')"
            />
            <USelect
              v-if="filterKeys.includes('outcome')"
              :model-value="opts.filters.outcome ?? 'all'"
              :items="[
                { label: 'Wins and losses', value: 'all' },
                { label: 'Wins only', value: 'win' },
                { label: 'Losses only', value: 'loss' },
              ]"
              class="grow"
              @update:model-value="(v) => (opts.filters.outcome = v as 'all' | 'win' | 'loss')"
            />
          </div>
          <UInput
            v-if="filterKeys.includes('exitReason')"
            v-model="opts.filters.exitReason"
            placeholder="Exit reason contains…"
            class="w-full"
          />
          <UInput
            v-if="filterKeys.includes('enterTag')"
            v-model="opts.filters.enterTag"
            placeholder="Enter tag contains…"
            class="w-full"
          />
        </section>
        <p v-else-if="filterKeys.length" class="text-xs text-muted">
          Filters apply to the Table, Cards, Chart and Stat tiles displays.
        </p>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full gap-2">
        <UButton color="neutral" variant="outline" icon="i-mdi-content-copy" @click="duplicate"
          >Duplicate</UButton
        >
        <UButton color="error" variant="soft" icon="i-mdi-delete-outline" @click="remove"
          >Remove</UButton
        >
        <UButton class="ms-auto" @click="open = false">Done</UButton>
      </div>
    </template>
  </USlideover>
</template>
