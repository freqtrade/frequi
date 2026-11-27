import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import { useFaviconBadge } from '@/composables/useFaviconBadge';

const BADGE_DATA_URL = 'data:image/png;base64,BADGE';

let imageShouldFail = false;

class FakeImage {
  onload: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  set src(_value: string) {
    // Resolve asynchronously, like a real image load.
    setTimeout(() =>
      imageShouldFail ? this.onerror?.(new Error('load failed')) : this.onload?.(),
    );
  }
}

function fontSize(font: string): number {
  return Number(/([\d.]+)px/.exec(font)?.[1] ?? 0);
}

// Rough approximation of a bold sans-serif font: each character is 0.6em wide.
function fakeTextWidth(text: string, font: string): number {
  return text.length * fontSize(font) * 0.6;
}

function createFakeContext() {
  const context = {
    font: '',
    fillStyle: '',
    textAlign: '',
    textBaseline: '',
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn((text: string) => ({ width: fakeTextWidth(text, context.font) })),
  };
  return context;
}

let ctx: ReturnType<typeof createFakeContext>;

function iconLink() {
  return document.querySelector<HTMLLinkElement>('link[rel~="icon"]')!;
}

async function flush() {
  // Let the fake image load and the useFavicon watcher run.
  await new Promise((resolve) => setTimeout(resolve));
  await nextTick();
}

describe('useFaviconBadge', () => {
  let originalHref: string;

  beforeEach(() => {
    imageShouldFail = false;
    document.head.innerHTML = '<link rel="icon" href="/favicon.ico">';
    originalHref = iconLink().href;

    vi.stubGlobal('Image', FakeImage);
    ctx = createFakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(BADGE_DATA_URL);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('draws the count onto the favicon', async () => {
    const { setBadge } = useFaviconBadge();
    await setBadge(5);
    await flush();

    expect(ctx.drawImage).toHaveBeenCalledOnce();
    expect(ctx.roundRect).toHaveBeenCalledOnce();
    expect(ctx.fillText).toHaveBeenCalledWith('5', expect.any(Number), expect.any(Number));
    expect(iconLink().href).toBe(BADGE_DATA_URL);
  });

  it.each([
    [99, '99'],
    [100, '99+'],
    [150, '99+'],
  ])('caps the count at 99+ (%i -> %s)', async (count, expected) => {
    const { setBadge } = useFaviconBadge();
    await setBadge(count);

    expect(ctx.fillText).toHaveBeenCalledWith(expected, expect.any(Number), expect.any(Number));
  });

  it('shrinks the font so wide text fits inside the badge', async () => {
    const { setBadge } = useFaviconBadge();
    await setBadge(150);

    const [x, y, width, height] = ctx.roundRect.mock.calls[0]!;
    // Default font size is 80% of the badge height - it must have been reduced.
    expect(fontSize(ctx.font)).toBeLessThan(height * 0.8);

    // The text, plus the horizontal padding, fits inside the badge ...
    const padding = height * 0.3;
    expect(fakeTextWidth('99+', ctx.font) + padding).toBeLessThanOrEqual(width + 1e-9);
    // ... and the badge fits inside the icon.
    expect(x).toBeGreaterThanOrEqual(0);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(x + width).toBeLessThanOrEqual(32);
    expect(y + height).toBeLessThanOrEqual(32);
  });

  it('keeps the default font size for short text', async () => {
    const { setBadge } = useFaviconBadge();
    await setBadge(5);

    const [, , , height] = ctx.roundRect.mock.calls[0]!;
    expect(fontSize(ctx.font)).toBeCloseTo(height * 0.8);
  });

  it('restores the original favicon on reset', async () => {
    const { setBadge, reset } = useFaviconBadge();
    await setBadge(3);
    await flush();
    expect(iconLink().href).toBe(BADGE_DATA_URL);

    await reset();
    await flush();
    expect(iconLink().href).toBe(originalHref);
  });

  it('treats a count of 0 as reset', async () => {
    const { setBadge } = useFaviconBadge();
    await setBadge(0);
    await flush();

    expect(ctx.fillText).not.toHaveBeenCalled();
    expect(iconLink().href).toBe(originalHref);
  });

  it('discards a stale render when the count changes while loading', async () => {
    const { setBadge, reset } = useFaviconBadge();
    // Don't await - reset() is called while the icon is still loading.
    const pending = setBadge(4);
    await reset();
    await pending;
    await flush();

    expect(ctx.fillText).not.toHaveBeenCalled();
    expect(iconLink().href).toBe(originalHref);
  });

  it('loads the base icon only once', async () => {
    const imageSpy = vi.fn();
    vi.stubGlobal(
      'Image',
      class extends FakeImage {
        constructor() {
          super();
          imageSpy();
        }
      },
    );
    const { setBadge } = useFaviconBadge();
    await setBadge(1);
    await setBadge(2);

    expect(imageSpy).toHaveBeenCalledOnce();
    expect(ctx.fillText).toHaveBeenLastCalledWith('2', expect.any(Number), expect.any(Number));
  });

  it('leaves the favicon untouched if the icon fails to load', async () => {
    imageShouldFail = true;
    const { setBadge } = useFaviconBadge();
    await setBadge(7);
    await flush();

    expect(ctx.fillText).not.toHaveBeenCalled();
    expect(iconLink().href).toBe(originalHref);
  });
});
