import ProfitSymbol from '@/components/general/ProfitSymbol.vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

describe('ProfitSymbol.vue', () => {
  it('calculates isProfitable with negative profit', () => {
    const wrapper = mount(ProfitSymbol, { props: { profit: -0.5 } });
    const divs = wrapper.findAll('div');
    expect(divs[1].classes()).toContain('triangle-down');
    expect(divs[1].classes()).not.toContain('triangle-up');
  });

  it('calculates isProfitable with positive profit', () => {
    const wrapper = mount(ProfitSymbol, { props: { profit: 0.5 } });

    const divs = wrapper.findAll('div');
    expect(divs[1].classes()).not.toContain('triangle-down');
    expect(divs[1].classes()).toContain('triangle-up');
  });
});
