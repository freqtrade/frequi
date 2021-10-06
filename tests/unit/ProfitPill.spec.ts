/* eslint-disable @typescript-eslint/camelcase */
import { mount } from '@vue/test-utils';
import Vue from 'vue';
import ProfitPill from '@/components/general/ProfitPill.vue';

describe('ProfitPill.vue', () => {
  let cmp;

  beforeEach(() => {
    cmp = mount(ProfitPill, {
      propsData: {
        profitRatio: 0,
        profitAbs: 0,
        profitDesc: '',
        stakeCurrency: 'USDT',
      },
    });
  });
  it('Shows a Green pill with positive profits', async () => {
    const props = {
      profitRatio: 0.051,
      profitAbs: 0.1,
    };
    cmp.setProps(props);
    await Vue.nextTick();
    expect(cmp.html()).toContain('profit-pill-profit');
    expect(cmp.html()).toContain('5.10%');
    expect(cmp.html()).toContain('(0.1)');
    expect(cmp.html()).toContain('title="USDT"');
  });
  it('Shows a Red pill with positive profits', async () => {
    const props = {
      profitRatio: -0.1,
      profitAbs: -0.1,
      stakeCurrency: 'USDT',
    };
    cmp.setProps(props);
    await Vue.nextTick();
    expect(cmp.html()).not.toContain('profit-pill-profit');
    expect(cmp.html()).toContain('profit-pill');
    expect(cmp.html()).toContain('(-0.1)');
    expect(cmp.html()).toContain('-10.00%');
    expect(cmp.html()).toContain('title="USDT"');
  });
  it('Shows a pill with 0.0 profits.', async () => {
    const props = {
      profitRatio: 0.0,
      profitAbs: 0.0,
      stakeCurrency: 'BTC',
    };
    cmp.setProps(props);
    await Vue.nextTick();
    expect(cmp.html()).toContain('profit-pill');
    expect(cmp.html()).toContain('0.00%');
    expect(cmp.html()).toContain('(0)');
    expect(cmp.html()).toContain('title="BTC"');
  });
});
