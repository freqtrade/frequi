import { mount } from '@vue/test-utils';
import ValuePair from '@/components/general/ValuePair.vue';

describe('ValuePair.vue', () => {
  it('renders description when passed', () => {
    const msg = 'Test description';
    const wrapper = mount(ValuePair, {
      propsData: { description: msg },
    });
    expect(wrapper.text()).toMatch(msg);
  });
});
