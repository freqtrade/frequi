import { ElementEvent } from 'echarts';
import { roundTimeframe } from '@/shared/timemath';

export function usePercentageTool(chartRef, props) {
  const inputListener = useKeyModifier('Shift', { events: ['keydown', 'keyup'] });

  const color = computed(() => (props.theme === 'dark' ? 'white' : 'black'));

  const startPos = ref({ x: 0, y: 0 });
  const drawLimitPerSecond = 144;
  const canDraw = ref(true);
  const active = ref(false);

  function mouseMove(e: ElementEvent) {
    if (canDraw.value) draw(e.offsetX, e.offsetY);
  }

  function mouseDown(e: ElementEvent) {
    if (!active.value) {
      startPos.value = { x: e.offsetX, y: e.offsetY };
      chartRef.value?.chart.getZr().on('mousemove', mouseMove);
      drawStart();
    } else {
      drawEnd();
      chartRef.value?.chart.getZr().off('mousemove', mouseMove);
      chartRef.value?.chart.getZr().off('mousedown', mouseDown);
    }
  }

  function drawStart() {
    active.value = true;
    chartRef.value?.setOption({
      dataZoom: [{ disabled: true }],
      graphic: [
        {
          type: 'line',
          shape: {
            x1: startPos.value.x,
            x2: startPos.value.x,
            y1: startPos.value.y,
            y2: startPos.value.y,
          },
          style: {
            stroke: color.value,
          },
        },
        { type: 'text', z: 5 },
      ],
    });
  }

  function drawEnd() {
    active.value = false;
    chartRef.value?.setOption({
      dataZoom: [{ disabled: false }],
      graphic: [{ $action: 'remove' }, { $action: 'remove' }],
    });
  }

  function draw(x: number, y: number) {
    const startValues = chartRef.value?.convertFromPixel({ seriesIndex: 0 }, [
      startPos.value.x,
      startPos.value.y,
    ]);
    const endValues = chartRef.value?.convertFromPixel({ seriesIndex: 0 }, [x, y]);
    const startPrice = Number(startValues[1]);
    const endPrice = Number(endValues[1]);
    const startTime = roundTimeframe(props.dataset.timeframe_ms, Number(startValues[0]));
    const endTime = roundTimeframe(props.dataset.timeframe_ms, Number(endValues[0]));
    const timeDiff = Math.abs(startTime - endTime) / props.dataset.timeframe_ms;
    const pct = Math.abs(((startPrice - endPrice) / startPrice) * 100).toFixed(2);

    chartRef.value?.setOption({
      graphic: [
        {
          shape: {
            x2: x,
            y2: y,
          },
        },
        {
          style: {
            x: x,
            y: y - 20,
            text: `${timeDiff} bars -  ${startPrice < endPrice ? pct : '-' + pct}%`,
            font: '14px sans-serif',
            fill: color.value,
          },
        },
      ],
    });

    canDraw.value = false;
    setTimeout(() => {
      canDraw.value = true;
    }, 1000 / drawLimitPerSecond);
  }

  watch(
    () => inputListener.value,
    () => {
      if (inputListener.value && !active.value) {
        chartRef.value?.chart.getZr().on('mousedown', mouseDown);
      }
    },
  );
}
