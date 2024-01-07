import { ElementEvent } from 'echarts';
import { ROUND_CLOSER, roundTimeframe } from '@/shared/timemath';
import humanizeDuration from 'humanize-duration';

export function usePercentageTool(chartRef, theme: Ref<string>, timeframe_ms: Ref<number>) {
  const inputListener = useKeyModifier('Shift', { events: ['keydown', 'keyup'] });

  const color = computed(() => (theme.value === 'dark' ? 'white' : 'black'));

  const startPos = ref({ x: 0, y: 0 });
  const drawLimitPerSecond = 144;
  const canDraw = ref(true);
  const active = ref(false);
  const closing = ref(false);
  const boxHeight = 35;

  function roundTF(timestamp: number) {
    return roundTimeframe(timeframe_ms.value, timestamp, ROUND_CLOSER);
  }

  function mouseMove(e: ElementEvent) {
    if (canDraw.value && !closing.value) draw(e.offsetX, e.offsetY);
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
    } else if (!closing.value) {
      closing.value = true;
    } else {
      drawEnd();
      closing.value = false;
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
            opacity: 0.1,
          },
        },
        {
          // Rect containing text ...
          type: 'rect',
          z: 5,
          shape: {
            x: startPos.value.x,
            width: 170,
            y: startPos.value.y,
            height: boxHeight,
            r: 5,
          },
          style: {
            fill: '#002fff',
            // color: color.value,
            opacity: 0.8,
          },
          textContent: {
            z: 10,
            style: {
              text: '0 bars - 0%',
              font: '14px sans-serif',
              fill: 'white',
            },
          },
          textConfig: {
            position: 'inside',
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
    const timeDiff = Math.abs(startTime - endTime);
    const xr = chartRef.value?.convertToPixel({ seriesIndex: 0 }, [endTime, 0])[0];
    const timeElapsed = humanizeDuration(timeDiff, { units: ['d', 'h', 'm'] });
    const pct = Math.abs(((startPrice - endPrice) / startPrice) * 100).toFixed(2);

    chartRef.value?.setOption({
      graphic: [
        {
          // Transparent rectangle ....
          shape: {
            width: xr > startPos.value.x ? -1 * (startPos.value.x - xr) : xr - startPos.value.x,
            height: y > startPos.value.y ? -1 * (startPos.value.y - y) : y - startPos.value.y,
          },
        },
        {
          // Rect containing text ...
          shape: {
            x: xr + 5, //startPos.value.x + (xr - startPos.value.x) / 2,
            y: y > startPos.value.y ? y - (boxHeight + 5) : y + 9,
          },
          textContent: {
            style: {
              textAlign: x < startPos.value.x ? 'left' : 'right',
              text: `${timeDiff / timeframe_ms.value} bars (${
                startPrice < endPrice ? pct : '-' + pct
              }%) \n ${timeElapsed}`,
            },
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
