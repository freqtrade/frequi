import { use } from 'echarts/core';
import { ElementEvent } from 'echarts';
import { useInputListener } from './inputListener';
import { GraphicComponent } from 'echarts/components';

use([GraphicComponent]);

export function usePercentageTool(chartRef: Ref) {
  const inputListener = useInputListener();

  const mousePos = ref({ x: 0, y: 0 });
  const startPos = ref({ x: 0, y: 0 });
  const drawLimitPerSecond = 144;
  const canDraw = ref(true);
  const active = ref(false);

  function mouseMove(e: ElementEvent) {
    mousePos.value.x = e.offsetX;
    mousePos.value.y = e.offsetY;

    if (!active.value || !canDraw.value) return;
    draw(e.offsetX, e.offsetY);
  }

  function drawStart() {
    active.value = true;
    startPos.value = { ...mousePos.value };
    chartRef.value?.setOption({
      dataZoom: [{ disabled: true }],
      graphic: [
        {
          type: 'line',
          shape: {
            x1: mousePos.value.x,
            x2: mousePos.value.x,
            y1: mousePos.value.y,
            y2: mousePos.value.y,
          },
          style: {
            stroke: 'white',
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
    const startPrice = Number(
      chartRef.value?.convertFromPixel({ seriesIndex: 0 }, [startPos.value.x, startPos.value.y])[1],
    );
    const endPrice = Number(chartRef.value?.convertFromPixel({ seriesIndex: 0 }, [x, y])[1]);
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
            text: (startPrice < endPrice ? pct : '-' + pct) + '%',
            font: '16px sans-serif',
            fill: 'white',
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
    () => inputListener.isAnyPressed.value,
    () => {
      if (inputListener.isKeyPressed(KeyCode.SHIFT_LEFT)) {
        drawStart();
      } else if (active.value) {
        drawEnd();
      }
    },
  );

  onMounted(() => {
    chartRef.value?.chart.getZr().on('mousemove', mouseMove);
  });
  onUnmounted(() => {
    chartRef.value?.chart.getZr().off('mousemove', mouseMove);
  });
}
