import { describe, it, expect, vi } from 'vitest';
import { randomColor } from '@/utils/randomColor';

describe('randomColor', () => {
  it('Generates a random color', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.555);
    const color = randomColor();
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
    expect(color).toMatch('#8e147a');
  });
  it('Generates a random color with very low random state', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.0001);
    const color = randomColor();
    expect(color).toMatch('#00068d');
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });
  it('Generates a random color with very high random state', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99999);
    const color = randomColor();
    expect(color).toMatch('#ffff57');
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('Generates a random color - without mock', () => {
    const color = randomColor();
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });
});
