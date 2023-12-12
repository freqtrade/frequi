import { ElementEvent } from 'echarts';
import { ROUND_CLOSER, roundTimeframe } from '@/shared/timemath';

export function usePercentageTool(chartRef, props) {
  const inputListener = useKeyModifier('Shift', { events: ['keydown', 'keyup'] });

  const color = computed(() => (props.theme === 'dark' ? 'white' : 'black'));

  const startPos = ref({ x: 0, y: 0 });
  const drawLimitPerSecond = 144;
  const canDraw = ref(true);
  const active = ref(false);

  function roundTF(timestamp: number) {
    return roundTimeframe(props.dataset.timeframe_ms, timestamp, ROUND_CLOSER);
  }

  function mouseMove(e: ElementEvent) {
    if (canDraw.value) draw(e.offsetX, e.offsetY);
  }

  function mouseDown(e: ElementEvent) {
    if (!active.value) {
      const startValues = chartRef.value?.convertFromPixel({ seriesIndex: 0 }, [
        e.offsetX,
        e.offsetY,
      ]);
      startValues[0] = roundTF(Number(startValues[0]));
      const startnew = chartRef.value?.convertToPixel({ seriesIndex: 0 }, startValues);

      startPos.value = { x: startnew[0], y: startnew[1] };

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
          type: 'rect',
          shape: {
            x: startPos.value.x,
            width: 0,
            y: startPos.value.y,
            height: 0,
          },
          style: {
            fill: color.value,
            // color: color.value,
            opacity: 0.4,
          },
        },
        {
          type: 'text',
          z: 5,
          style: {
            x: startPos.value.x,
            y: startPos.value.y - 20,
            text: '0 bars - 0%',
            font: '14px sans-serif',
            fill: color.value,
          },
        },
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
    const startTime = roundTF(Number(startValues[0]));
    const endTime = roundTF(Number(endValues[0]));
    const timeDiff = Math.abs(startTime - endTime) / props.dataset.timeframe_ms;
    const xr = chartRef.value?.convertToPixel({ seriesIndex: 0 }, [endTime, 0])[0];

    const pct = Math.abs(((startPrice - endPrice) / startPrice) * 100).toFixed(2);

    chartRef.value?.setOption({
      graphic: [
        {
          shape: {
            width: xr > startPos.value.x ? -1 * (startPos.value.x - xr) : xr - startPos.value.x,
            height: y > startPos.value.y ? -1 * (startPos.value.y - y) : y - startPos.value.y,
          },
        },
        {
          style: {
            x: xr,
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
