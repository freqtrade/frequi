import type { EChartsOption, TooltipComponentFormatterCallbackParams } from 'echarts';
import type { Ref } from 'vue';
import { format as echartsFormat } from 'echarts';

type CandleTooltipParam = Exclude<
  TooltipComponentFormatterCallbackParams,
  TooltipComponentFormatterCallbackParams[]
> & {
  axisValue?: number | string;
  axisValueLabel?: string;
};

type CandleTooltipRow = {
  label: string;
  value?: string;
  marker?: string;
};

export function useCandleChartTooltip(chartOptions: Ref<EChartsOption>) {
  function normalizeTooltipParams(
    params: TooltipComponentFormatterCallbackParams,
  ): CandleTooltipParam[] {
    return (Array.isArray(params) ? params : [params]) as CandleTooltipParam[];
  }

  function formatTooltipValue(value: unknown): string {
    if (typeof value === 'number') {
      return value.toLocaleString(undefined, { maximumFractionDigits: 15 });
    }
    if (typeof value === 'string') {
      return value;
    }
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  }

  function formatTooltipHtmlValue(value: string | undefined): string {
    return echartsFormat.encodeHTML(value ?? '').replaceAll('\n', '<br />');
  }

  function getSeriesOptionForTooltip(seriesIndex: number | undefined) {
    if (seriesIndex === undefined || !Array.isArray(chartOptions.value.series)) {
      return undefined;
    }
    return chartOptions.value.series[seriesIndex];
  }

  function getTooltipSectionTitle(seriesIndex: number | undefined): string {
    const series = getSeriesOptionForTooltip(seriesIndex);
    const axisIndex =
      series && typeof series === 'object' && 'yAxisIndex' in series
        ? Number(series.yAxisIndex ?? 0)
        : 0;

    if (axisIndex === 0) {
      return 'Candles';
    }
    if (axisIndex === 1) {
      return 'Volume';
    }
    if (Array.isArray(chartOptions.value.yAxis)) {
      const axis = chartOptions.value.yAxis[axisIndex];
      if (axis && typeof axis === 'object' && 'name' in axis && typeof axis.name === 'string') {
        const title = axis.name.trim();
        if (title) {
          return title;
        }
      }
    }
    return 'Candles';
  }

  function getTooltipDimensionValues(param: CandleTooltipParam): string[] {
    if (!Array.isArray(param.value)) {
      return [formatTooltipValue(param.value)];
    }
    const seriesValues = param.value;

    const tooltipDimensions = Array.isArray(param.encode?.tooltip)
      ? param.encode.tooltip
      : param.encode?.tooltip !== undefined
        ? [param.encode.tooltip]
        : [];
    if (tooltipDimensions.length > 0) {
      return tooltipDimensions
        .map((dimension) => formatTooltipValue(seriesValues[Number(dimension)]))
        .filter(Boolean);
    }

    const yDimensions = Array.isArray(param.encode?.y)
      ? param.encode.y
      : param.encode?.y !== undefined
        ? [param.encode.y]
        : [];
    return yDimensions
      .map((dimension) => formatTooltipValue(seriesValues[Number(dimension)]))
      .filter(Boolean);
  }

  function formatCandlestickSection(param: CandleTooltipParam): CandleTooltipRow[] {
    if (!Array.isArray(param.value)) {
      return [];
    }

    const encodedValues = Array.isArray(param.encode?.y) ? param.encode.y : [];
    if (encodedValues.length < 4) {
      return [];
    }

    const [openIndex, closeIndex, lowIndex, highIndex] = encodedValues.map((value) =>
      Number(value),
    );
    return [
      {
        marker: typeof param.marker === 'string' ? param.marker : '',
        label: 'open',
        value: formatTooltipValue(param.value[openIndex]),
      },
      {
        marker: typeof param.marker === 'string' ? param.marker : '',
        label: 'highest',
        value: formatTooltipValue(param.value[highIndex]),
      },
      {
        marker: typeof param.marker === 'string' ? param.marker : '',
        label: 'lowest',
        value: formatTooltipValue(param.value[lowIndex]),
      },
      {
        marker: typeof param.marker === 'string' ? param.marker : '',
        label: 'close',
        value: formatTooltipValue(param.value[closeIndex]),
      },
    ];
  }

  function formatTooltipLine(param: CandleTooltipParam): CandleTooltipRow[] {
    if (param.componentType !== 'series') {
      return [];
    }
    if (param.seriesType === 'candlestick') {
      return formatCandlestickSection(param);
    }

    const values = getTooltipDimensionValues(param);
    const marker = typeof param.marker === 'string' ? param.marker : '';
    const label = param.seriesName ?? '';
    if (values.length === 0) {
      return [{ label, marker }];
    }
    if (values.length === 1) {
      return [{ label, value: values[0], marker }];
    }
    return [
      {
        label,
        value: `${values[0]} (${values.slice(1).join(', ')})`,
        marker,
      },
    ];
  }

  function renderTooltipRow(row: CandleTooltipRow): string {
    const labelHtml = `${row.marker ?? ''}${echartsFormat.encodeHTML(row.label)}`;
    if (!row.value) {
      return `<div style="text-align:start;">${labelHtml}</div>`;
    }

    return `
  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;"><span>${labelHtml}</span
    ><span style="font-weight:700;text-align:right;white-space:pre-wrap;"
    >${echartsFormat.encodeHTML(formatTooltipHtmlValue(row.value))}</span></div>`;
  }

  /** Main chandlechart tooltip formatter */
  function formatCandleTooltip(params: TooltipComponentFormatterCallbackParams): string {
    const tooltipParams = normalizeTooltipParams(params);
    if (tooltipParams.length === 0) {
      return '';
    }

    const timestamp =
      tooltipParams[0].axisValueLabel ??
      (typeof tooltipParams[0].axisValue === 'number'
        ? timestampms(tooltipParams[0].axisValue)
        : (tooltipParams[0].axisValue?.toString() ?? ''));

    const groupedLines = new Map<string, CandleTooltipRow[]>();
    for (const param of tooltipParams) {
      const lines = formatTooltipLine(param);
      if (lines.length === 0) {
        continue;
      }

      const sectionTitle = getTooltipSectionTitle(param.seriesIndex);
      const sectionLines = groupedLines.get(sectionTitle) ?? [];
      sectionLines.push(...lines);
      groupedLines.set(sectionTitle, sectionLines);
    }

    const sections = Array.from(groupedLines.entries())
      .map(([title, lines], index) => {
        const titleHtml =
          title === 'Volume'
            ? ''
            : `<div style="margin:${index === 0 ? '6px' : '8px'} 0 2px;font-weight:700; text-decoration:underline; text-align:left;"
            >${echartsFormat.encodeHTML(title)}</div>`;
        const linesHtml = lines.map((line) => renderTooltipRow(line)).join('');
        return `${titleHtml}${linesHtml}`;
      })
      .join('');

    return `<div style="font-size:13px;line-height:1.45;"
      ><span style="font-weight:700; text-decoration:underline;">${echartsFormat.encodeHTML(timestamp)}</span
      >${sections}</div>`;
  }
  return { formatCandleTooltip };
}
