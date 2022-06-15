import ValuePair from './ValuePair.vue';

it('renders a message', () => {
  const msg = 'Test description';
  cy.mount(ValuePair, {
    propsData: {
      description: msg,
    },
  });

  cy.get('label').contains(msg);
});
