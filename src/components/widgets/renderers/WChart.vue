<script setup lang="ts">
import type { EChartsOption } from 'echarts';
import ECharts from 'vue-echarts';
import {
  BarChart,
  BoxplotChart,
  CustomChart,
  HeatmapChart,
  LineChart,
  PieChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  SunburstChart,
  TreemapChart,
} from 'echarts/charts';
import {
  CalendarComponent,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  RadarComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { ChartData, ChartKind, TreeNode, ValueFormat, VizData } from '@/widgets/types';
import { formatValue } from '@/widgets/helpers';
import { dayKey, histogramBins, quartiles } from '@/widgets/analytics';

use([
  BarChart,
  BoxplotChart,
  CustomChart,
  HeatmapChart,
  LineChart,
  PieChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  SunburstChart,
  TreemapChart,
  CanvasRenderer,
  CalendarComponent,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  RadarComponent,
  TooltipComponent,
  VisualMapComponent,
]);

const props = withDefaults(
  defineProps<{ data: VizData; kind: ChartKind; stake?: string; bins?: number }>(),
  { stake: '', bins: 20 },
);

const settingsStore = useSettingsStore();
const colorStore = useColorStore();

const fmtWith = (format: ValueFormat | undefined) => (v: unknown) =>
  formatValue(v, format ?? 'number', props.stake);
/** Axis labels: drop the currency suffix to save space */
const axisFmt = (format: ValueFormat | undefined) => (v: number) =>
  fmtWith(format)(v).replace(/ [A-Z]+$/, '');

/** Current accent and neutral colours (canvas cannot read CSS variables). */
const palette = computed(() => {
  // Re-evaluated when theme or accent changes.
  void settingsStore.accent;
  const dark = settingsStore.isDarkTheme;
  const css = getComputedStyle(document.documentElement);
  return {
    profit: colorStore.colorProfit,
    loss: colorStore.colorLoss,
    accent: css.getPropertyValue('--color-brand-400').trim() || '#22d3ee',
    neutral: dark ? '#1e293b' : '#e2e8f0',
    text: dark ? '#a8b3c7' : '#475569',
    border: dark ? 'rgba(10,16,28,0.9)' : 'rgba(255,255,255,0.9)',
  };
});

const signColor = (v: number) => (v < 0 ? palette.value.loss : palette.value.profit);

function seriesOption(d: ChartData): EChartsOption {
  const fmt = fmtWith(d.valueFormat);
  const { x, series, timeAxis } = d;

  if (props.kind === 'pie' || props.kind === 'donut') {
    const s = series[0];
    return {
      tooltip: {
        trigger: 'item',
        formatter: (p: unknown) => {
          const item = p as { name: string; value: number; percent: number };
          return `${item.name}<br/><b>${fmt(item.value)}</b> (${item.percent}%)`;
        },
      },
      legend: { type: 'scroll', orient: 'vertical', right: 0, top: 'middle' },
      series: [
        {
          type: 'pie',
          radius: props.kind === 'donut' ? ['48%', '74%'] : [0, '74%'],
          center: ['40%', '50%'],
          itemStyle: { borderRadius: 6, borderWidth: 2, borderColor: palette.value.border },
          label: { show: false },
          // Slices need positive values; show the magnitude.
          data: x.map((name, i) => ({ name: String(name), value: Math.abs(s?.data[i] ?? 0) })),
        },
      ],
    };
  }

  const base = {
    tooltip: { trigger: 'axis' as const, valueFormatter: (v: unknown) => fmt(v) },
    grid: { left: 8, right: 16, top: series.length > 1 ? 32 : 12, bottom: 8, containLabel: true },
    xAxis: timeAxis
      ? { type: 'time' as const, axisLabel: { hideOverlap: true } }
      : { type: 'category' as const, data: x.map(String), axisLabel: { hideOverlap: true } },
    yAxis: { type: 'value' as const, axisLabel: { formatter: axisFmt(d.valueFormat) } },
    dataZoom: x.length > 60 ? [{ type: 'inside' as const }] : undefined,
    legend: series.length > 1 ? { type: 'scroll' as const, top: 0 } : undefined,
  };

  if (props.kind === 'waterfall') {
    // Invisible base bar + visible delta bar, then a total bar.
    const values = series[0]?.data.map((v) => v ?? 0) ?? [];
    const bases: number[] = [];
    let acc = 0;
    values.forEach((v) => {
      bases.push(v >= 0 ? acc : acc + v);
      acc += v;
    });
    const cats = [...x.map(String), 'Total'];
    return {
      ...base,
      xAxis: { type: 'category', data: cats, axisLabel: { hideOverlap: true } },
      tooltip: {
        trigger: 'axis',
        formatter: (p: unknown) => {
          const items = p as { name: string; dataIndex: number }[];
          const i = items[0]!.dataIndex;
          const v = i < values.length ? values[i]! : acc;
          return `${items[0]!.name}<br/><b>${fmt(v)}</b>`;
        },
      },
      series: [
        {
          type: 'bar',
          stack: 'wf',
          silent: true,
          itemStyle: { color: 'transparent' },
          data: [...bases, Math.min(0, acc)],
        },
        {
          type: 'bar',
          stack: 'wf',
          data: [
            ...values.map((v) => ({ value: Math.abs(v), itemStyle: { color: signColor(v) } })),
            { value: Math.abs(acc), itemStyle: { color: palette.value.accent } },
          ],
        },
      ],
    };
  }

  const isBar = props.kind === 'bar' || props.kind === 'stackedBar';
  return {
    ...base,
    series: series.map((s) => ({
      name: s.name,
      type: isBar ? 'bar' : 'line',
      stack: props.kind === 'stackedBar' ? 'total' : undefined,
      showSymbol: false,
      areaStyle: props.kind === 'area' ? { opacity: 0.18 } : undefined,
      data: timeAxis ? s.data.map((v, i) => [x[i], v]) : s.data,
      // Single-series bars are coloured by sign.
      itemStyle:
        isBar && series.length === 1
          ? {
              color: (p: { value: unknown }) =>
                signColor(Array.isArray(p.value) ? (p.value[1] as number) : (p.value as number)),
            }
          : undefined,
    })) as EChartsOption['series'],
  };
}

function treeColor(n: TreeNode): TreeNode & { itemStyle?: object } {
  const children = n.children?.map(treeColor);
  return {
    ...n,
    children,
    itemStyle: n.signed !== undefined ? { color: signColor(n.signed) } : undefined,
  };
}

function visualMapFor(min: number, max: number, diverging?: boolean) {
  const bound = Math.max(Math.abs(min), Math.abs(max)) || 1;
  return {
    min: diverging ? -bound : min,
    max: diverging ? bound : max,
    calculable: true,
    orient: 'horizontal' as const,
    left: 'center',
    bottom: 0,
    itemHeight: 120,
    textStyle: { color: palette.value.text },
    inRange: {
      color: diverging
        ? [palette.value.loss, palette.value.neutral, palette.value.profit]
        : [palette.value.neutral, palette.value.accent],
    },
  };
}

const option = computed<EChartsOption>(() => {
  const d = props.data;

  switch (d.type) {
    case 'matrix': {
      const fmt = fmtWith(d.valueFormat);
      const vals = d.values.map((v) => v[2]).filter((v): v is number => v !== null);
      return {
        tooltip: {
          formatter: (p: unknown) => {
            const v = (p as { value: [number, number, number] }).value;
            return `${d.yLabels[v[1]]} · ${d.xLabels[v[0]]}<br/><b>${fmt(v[2])}</b>`;
          },
        },
        grid: { left: 8, right: 8, top: 8, bottom: 44, containLabel: true },
        xAxis: { type: 'category', data: d.xLabels, splitArea: { show: true } },
        yAxis: { type: 'category', data: d.yLabels, splitArea: { show: true } },
        visualMap: visualMapFor(
          d.min ?? Math.min(0, ...vals),
          d.max ?? Math.max(...vals, 0),
          d.diverging,
        ),
        series: [
          {
            type: 'heatmap',
            data: d.values,
            label: {
              show: d.xLabels.length <= 12,
              formatter: (p: { value: unknown }) =>
                axisFmt(d.valueFormat)((p.value as number[])[2]!),
            },
            itemStyle: { borderRadius: 3, borderColor: palette.value.border, borderWidth: 1 },
          },
        ],
      };
    }
    case 'calendar': {
      const fmt = fmtWith(d.valueFormat);
      const dates = d.days.map((x) => x[0]).sort();
      const end = dates[dates.length - 1] ?? dayKey(Date.now());
      const startDate = new Date(end);
      startDate.setFullYear(startDate.getFullYear() - 1);
      const yearAgo = dayKey(startDate.getTime());
      const start = dates[0] && dates[0] > yearAgo ? dates[0] : yearAgo;
      const vals = d.days.map((x) => x[1]);
      return {
        tooltip: {
          formatter: (p: unknown) => {
            const v = (p as { value: [string, number] }).value;
            return `${v[0]}<br/><b>${fmt(v[1])}</b>`;
          },
        },
        visualMap: visualMapFor(Math.min(0, ...vals), Math.max(0, ...vals), true),
        calendar: {
          range: [start, end],
          top: 28,
          left: 36,
          right: 12,
          bottom: 44,
          cellSize: ['auto', 'auto'],
          splitLine: { show: false },
          itemStyle: { color: 'transparent', borderColor: palette.value.border, borderWidth: 2 },
          yearLabel: { show: false },
          dayLabel: { firstDay: 1, nameMap: 'en', color: palette.value.text },
          monthLabel: { color: palette.value.text },
        },
        series: [{ type: 'heatmap', coordinateSystem: 'calendar', data: d.days }],
      };
    }
    case 'tree': {
      const fmt = fmtWith(d.valueFormat);
      const data = d.nodes.map(treeColor);
      const tooltip = {
        formatter: (p: unknown) => {
          const item = p as { name: string; value: number; data: TreeNode };
          const signed = item.data?.signed;
          return `${item.name.replace(/\u200b/g, '')}<br/><b>${fmt(item.value)}</b>${
            signed !== undefined ? `<br/>Profit: ${formatValue(signed, 'stake', props.stake)}` : ''
          }`;
        },
      };
      if (props.kind === 'sunburst') {
        return {
          tooltip,
          series: [
            {
              type: 'sunburst',
              data,
              radius: ['12%', '92%'],
              itemStyle: { borderColor: palette.value.border, borderWidth: 2 },
              label: { rotate: 'radial', minAngle: 12, color: '#fff' },
            },
          ],
        } as EChartsOption;
      }
      return {
        tooltip,
        series: [
          {
            type: 'treemap',
            data,
            roam: false,
            nodeClick: 'zoomToNode',
            breadcrumb: { show: true, bottom: 4 },
            width: '100%',
            height: '86%',
            top: 0,
            upperLabel: { show: true, height: 18, color: '#fff' },
            itemStyle: { borderColor: palette.value.border, borderWidth: 2, gapWidth: 2 },
            levels: [
              { itemStyle: { borderWidth: 0, gapWidth: 3 } },
              { colorSaturation: [0.35, 0.6] },
            ],
          },
        ],
      } as EChartsOption;
    }
    case 'flow': {
      const fmt = fmtWith(d.valueFormat);
      const clean = (s?: string) => (s ?? '').replace(/\u200b/g, '');
      return {
        tooltip: {
          trigger: 'item',
          formatter: (p: unknown) => {
            const item = p as {
              name: string;
              value: number;
              data: { source?: string; target?: string };
            };
            const name = item.data?.source
              ? `${clean(item.data.source)} → ${clean(item.data.target)}`
              : clean(item.name);
            return `${name}<br/><b>${fmt(item.value)}</b>`;
          },
        },
        series: [
          {
            type: 'sankey',
            left: 8,
            right: 90,
            top: 8,
            bottom: 8,
            nodeGap: 6,
            emphasis: { focus: 'adjacency' },
            data: d.nodes.map((n) => ({ name: n.name, depth: n.depth })),
            links: d.links,
            lineStyle: { color: 'gradient', opacity: 0.35 },
            label: {
              color: palette.value.text,
              formatter: (p: { name: string }) => clean(p.name),
            },
          },
        ],
      } as EChartsOption;
    }
    case 'points': {
      const groups = [...new Set(d.points.map((p) => p.group))];
      const maxSize = Math.max(1, ...d.points.map((p) => p.size ?? 0));
      return {
        tooltip: {
          formatter: (p: unknown) => {
            const item = p as { data: { name: string; value: number[] } };
            return `${item.data.name}<br/>${d.xLabel}: ${formatValue(item.data.value[0], d.xFormat)}<br/>${d.yLabel}: <b>${formatValue(item.data.value[1], d.yFormat)}</b>`;
          },
        },
        legend: { type: 'scroll', top: 0 },
        grid: { left: 8, right: 16, top: 32, bottom: 24, containLabel: true },
        xAxis: { type: 'value', name: d.xLabel, nameLocation: 'middle', nameGap: 24 },
        yAxis: { type: 'value', name: d.yLabel, axisLabel: { formatter: axisFmt(d.yFormat) } },
        series: groups.map((g) => ({
          name: g,
          type: 'scatter',
          symbolSize:
            props.kind === 'bubble'
              ? (_v: unknown, p: { data: { size: number } }) =>
                  6 + 26 * Math.sqrt((p.data?.size ?? 0) / maxSize)
              : 7,
          itemStyle: { opacity: 0.75 },
          data: d.points
            .filter((p) => p.group === g)
            .map((p) => ({ name: p.name, value: [p.x, p.y], size: p.size })),
        })) as EChartsOption['series'],
      };
    }
    case 'ranges': {
      const fmt = fmtWith(d.valueFormat);
      return {
        tooltip: {
          formatter: (p: unknown) => {
            const v = (p as { value: [number, number, number, number, string] }).value;
            return `${v[4]}<br/>${timestampms(v[1])} → ${timestampms(v[2])}<br/><b>${fmt(v[3])}</b>`;
          },
        },
        grid: { left: 8, right: 16, top: 8, bottom: 8, containLabel: true },
        dataZoom: [{ type: 'inside', filterMode: 'weakFilter' }],
        xAxis: { type: 'time', axisLabel: { hideOverlap: true } },
        yAxis: { type: 'category', data: d.rows, inverse: true },
        series: [
          {
            type: 'custom',
            encode: { x: [1, 2], y: 0 },
            data: d.items.map((it) => [it.row, it.start, it.end, it.value, it.label]),
            renderItem: (
              _params: unknown,
              api: {
                value: (i: number) => unknown;
                coord: (v: unknown[]) => number[];
                size?: (v: number[]) => number[] | number;
              },
            ) => {
              const row = api.value(0) as number;
              const start = api.coord([api.value(1), row]);
              const end = api.coord([api.value(2), row]);
              const height = ((api.size?.([0, 1]) as number[])?.[1] ?? 16) * 0.6;
              return {
                type: 'rect',
                shape: {
                  x: start[0]!,
                  y: start[1]! - height / 2,
                  width: Math.max(2, end[0]! - start[0]!),
                  height,
                  r: 2,
                },
                style: { fill: signColor(api.value(3) as number), opacity: 0.85 },
              };
            },
          },
        ],
      } as EChartsOption;
    }
    case 'distribution': {
      const fmt = fmtWith(d.valueFormat);
      if (props.kind === 'boxplot') {
        const groups = d.groups.filter((g) => g.values.length > 0);
        return {
          tooltip: {
            formatter: (p: unknown) => {
              const item = p as { name: string; value: number[] };
              const [, min, q1, med, q3, max] = item.value;
              return `${item.name}<br/>max ${fmt(max)}<br/>Q3 ${fmt(q3)}<br/><b>median ${fmt(med)}</b><br/>Q1 ${fmt(q1)}<br/>min ${fmt(min)}`;
            },
          },
          grid: { left: 8, right: 16, top: 12, bottom: 8, containLabel: true },
          xAxis: {
            type: 'category',
            data: groups.map((g) => g.name),
            axisLabel: { hideOverlap: true },
          },
          yAxis: { type: 'value', axisLabel: { formatter: axisFmt(d.valueFormat) } },
          series: [
            {
              type: 'boxplot',
              data: groups.map((g) => quartiles(g.values)),
              itemStyle: { color: 'transparent', borderColor: palette.value.accent },
            },
          ],
        };
      }
      // Histogram over all values
      const all = d.groups.flatMap((g) => g.values);
      const { edges, counts } = histogramBins(all, props.bins);
      return {
        tooltip: {
          trigger: 'axis',
          formatter: (p: unknown) => {
            const item = (p as { dataIndex: number }[])[0]!;
            const lo = edges[item.dataIndex]!;
            const hi = edges[item.dataIndex + 1] ?? Math.max(...all);
            return `${fmt(lo)} – ${fmt(hi)}<br/><b>${counts[item.dataIndex]} trades</b>`;
          },
        },
        grid: { left: 8, right: 16, top: 12, bottom: 8, containLabel: true },
        xAxis: {
          type: 'category',
          data: edges.map((e) => axisFmt(d.valueFormat)(e)),
          axisLabel: { hideOverlap: true },
        },
        yAxis: { type: 'value', minInterval: 1 },
        series: [
          {
            type: 'bar',
            barCategoryGap: '4%',
            data: counts.map((c, i) => ({
              value: c,
              itemStyle: { color: signColor(edges[i]! + 1e-12) },
            })),
          },
        ],
      };
    }
    case 'radar':
      return {
        tooltip: { trigger: 'item' },
        legend: { type: 'scroll', bottom: 0 },
        radar: {
          indicator: d.indicators,
          radius: '62%',
          axisName: { color: palette.value.text },
        },
        series: [
          {
            type: 'radar',
            areaStyle: { opacity: 0.15 },
            data: d.series.map((s) => ({ name: s.name, value: s.values })),
          },
        ],
      };
    case 'band': {
      const fmt = fmtWith(d.valueFormat);
      const [p5, p25, p50, p75, p95] = d.lines;
      if (!p5 || !p25 || !p50 || !p75 || !p95) return {};
      const diff = (a: number[], b: number[]) => a.map((v, i) => v - b[i]!);
      const band = (name: string, opacity: number, stack: string, data: number[]) => ({
        name,
        type: 'line' as const,
        stack,
        showSymbol: false,
        lineStyle: { opacity: 0 },
        areaStyle: { opacity, color: palette.value.accent },
        data,
      });
      return {
        tooltip: {
          trigger: 'axis',
          formatter: (p: unknown) => {
            const i = (p as { dataIndex: number }[])[0]!.dataIndex;
            return `After ${d.x[i]} trades<br/>95%: ${fmt(p95.data[i])}<br/>75%: ${fmt(p75.data[i])}<br/><b>Median: ${fmt(p50.data[i])}</b><br/>25%: ${fmt(p25.data[i])}<br/>5%: ${fmt(p5.data[i])}`;
          },
        },
        legend: { top: 0, data: ['5–95%', '25–75%', 'Median'] },
        grid: { left: 8, right: 16, top: 32, bottom: 8, containLabel: true },
        xAxis: { type: 'category', data: d.x.map(String), name: 'Trades', boundaryGap: false },
        yAxis: { type: 'value', axisLabel: { formatter: axisFmt(d.valueFormat) } },
        series: [
          band('base-outer', 0, 'outer', p5.data),
          band('5–95%', 0.15, 'outer', diff(p95.data, p5.data)),
          band('base-inner', 0, 'inner', p25.data),
          band('25–75%', 0.3, 'inner', diff(p75.data, p25.data)),
          {
            name: 'Median',
            type: 'line',
            showSymbol: false,
            lineStyle: { width: 2, color: palette.value.accent },
            itemStyle: { color: palette.value.accent },
            data: p50.data,
          },
        ],
      };
    }
    default:
      return seriesOption(d);
  }
});

const isEmpty = computed(() => {
  const d = props.data;
  switch (d.type) {
    case 'matrix':
      return d.values.length === 0;
    case 'calendar':
      return d.days.length === 0;
    case 'tree':
      return d.nodes.length === 0;
    case 'flow':
      return d.links.length === 0;
    case 'points':
      return d.points.length === 0;
    case 'ranges':
      return d.items.length === 0;
    case 'distribution':
      return d.groups.every((g) => g.values.length === 0);
    case 'radar':
      return d.series.length === 0;
    case 'band':
      return d.x.length === 0;
    default:
      return d.x.length === 0;
  }
});
</script>

<template>
  <div class="h-full w-full p-2">
    <ECharts
      v-if="!isEmpty"
      :option="option"
      :theme="settingsStore.chartTheme"
      autoresize
      class="h-full w-full"
    />
    <div v-else class="flex h-full items-center justify-center text-sm text-muted">
      No data for this selection.
    </div>
  </div>
</template>
