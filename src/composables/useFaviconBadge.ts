const ICON_SIZE = 32;
const BADGE_BG = '#d00';
const BADGE_FG = '#fff';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Draws a numeric badge onto the page favicon (replacement for favico.js).
 * The original icon is restored when the count drops to 0.
 */
export function useFaviconBadge() {
  const originalHref =
    document.querySelector<HTMLLinkElement>('link[rel~="icon"]')?.href ?? '/favicon.ico';
  const href = useFavicon(originalHref);

  let baseImage: Promise<HTMLImageElement> | undefined;
  // Guards against out-of-order renders when the count changes while the icon is loading.
  let renderId = 0;

  function drawBadge(img: HTMLImageElement, count: number): string | undefined {
    const canvas = document.createElement('canvas');
    canvas.width = ICON_SIZE;
    canvas.height = ICON_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    ctx.drawImage(img, 0, 0, ICON_SIZE, ICON_SIZE);

    const text = count > 99 ? '99+' : String(count);
    const height = ICON_SIZE * 0.6;
    let fontSize = height * 0.8;
    ctx.font = `bold ${fontSize}px sans-serif`;
    // Shrink the font if the text would not fit within the icon width.
    const maxTextWidth = ICON_SIZE - height * 0.3;
    const textWidth = ctx.measureText(text).width;
    if (textWidth > maxTextWidth) {
      fontSize *= maxTextWidth / textWidth;
      ctx.font = `bold ${fontSize}px sans-serif`;
    }
    const width = Math.min(ICON_SIZE, Math.max(height, ctx.measureText(text).width + height * 0.3));
    // Bottom-right corner, matching favico.js' default position.
    const x = ICON_SIZE - width;
    const y = ICON_SIZE - height;

    ctx.fillStyle = BADGE_BG;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, height / 2);
    ctx.fill();

    ctx.fillStyle = BADGE_FG;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2 + 1);

    return canvas.toDataURL('image/png');
  }

  async function setBadge(count: number) {
    const id = ++renderId;
    if (count <= 0) {
      href.value = originalHref;
      return;
    }
    baseImage ??= loadImage(originalHref);
    let img: HTMLImageElement;
    try {
      img = await baseImage;
    } catch {
      // Icon failed to load - leave the favicon untouched.
      baseImage = undefined;
      return;
    }
    if (id !== renderId) return;
    const dataUrl = drawBadge(img, count);
    if (dataUrl) href.value = dataUrl;
  }

  function reset() {
    return setBadge(0);
  }

  return { setBadge, reset };
}
