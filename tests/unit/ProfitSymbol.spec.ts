/* eslint-disable @typescript-eslint/camelcase */
import { mount } from '@vue/test-utils';
import Vue from 'vue';
import ProfitSymbol from '@/components/ftbot/ProfitSymbol.vue';

describe('ProfitSymbol.vue', () => {
  let cmp;

  beforeEach(() => {
    cmp = mount(ProfitSymbol, { propsData: { trade: {} } });
  });
  it('calculates isProfitable with negative profit', () => {
    const trade = {
      profit_ratio: -0.5,
    };
    cmp.setProps({ trade });

    expect(cmp.vm.isProfitable).toBe(false);
  });
  it('calculates isProfitable with positive profit', () => {
    const trade = {
      close_profit: 0.5,
      current_profit: 0.5,
      profit_ratio: 0.5,
    };
    cmp.setProps({ trade });

    expect(cmp.vm.isProfitable).toBe(true);
  });

  it('renders triangle down when profit is negative', async () => {
    const trade = {
      profit_ratio: -0.5,
    };
    cmp.setProps({ trade });
    await Vue.nextTick();
    expect(cmp.html()).toContain('triangle-down');
    expect(cmp.html()).not.toContain('triangle-up');
  });

  it('renders triangle up when profit is positive', async () => {
    const trade = {
      profit_ratio: 0.5,
    };
    cmp.setProps({ trade });
    await Vue.nextTick();
    expect(cmp.html()).toContain('triangle-up');
    expect(cmp.html()).not.toContain('triangle-down');
  });
});
