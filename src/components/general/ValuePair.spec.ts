import { mount } from '@cypress/vue';
import ValuePair from './ValuePair.vue';

it('renders a message', () => {
  const msg = 'Test description';
  mount(ValuePair, {
    propsData: {
      description: msg,
    },
  });

  cy.get('label').contains(msg);
});
