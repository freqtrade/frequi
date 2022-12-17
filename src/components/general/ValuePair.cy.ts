import ValuePair from '@/components/general/ValuePair.vue';

it('renders a message', () => {
  const msg = 'Test description';
  cy.mount(ValuePair, { props: { description: msg } });

  cy.get('label').contains(msg);
});
